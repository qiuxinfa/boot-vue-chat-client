import  Vue from 'vue'
import  Vuex from 'vuex'
import {getRequest} from "../utils/api";
import SockJS from '../utils/sockjs'
import  '../utils/stomp'
import { Notification } from 'element-ui';
import {getFriendList,getNewFriendList} from '@/api/friend.js'
import {getRoomList} from '@/api/room.js'
import {getOfflineMsg,updateMsgIsRead} from '@/api/messageDetail.js'

Vue.use(Vuex)

const now = new Date();

const store =  new Vuex.Store({
  state:sessionStorage.getItem('state') ? JSON.parse(sessionStorage.getItem('state')) :{
    routes:[],
    sessions:{},//聊天记录
    users:[],//用户列表
    currentUser:null,//当前登录用户
    currentSession:{roomId:'',roomName: '',userId: '',username: '',avatar:''},//当前选中的用户，默认为群聊
    currentList:'群聊',//当前聊天窗口列表
    filterKey:'',
    stomp:null,
    isDot:{},//两用户之间是否有未读信息
    errorImgUrl:"http://39.108.169.57/group1/M00/00/00/J2ypOV7wJkyAAv1fAAANuXp4Wt8303.jpg",//错误提示图片
    shotHistory:{}, //拍一拍的记录历史
	friends: [],  // 好友
	rooms: [],  // 群聊
	chatType: '群聊',   // 聊天类型
	newFriends: [],    // 新朋友列表
  },
  mutations:{
    initRoutes(state,data){
      state.routes=data;
    },
	
	initFriends(state,data){
		getFriendList().then(res => {
			// debugger;
			state.friends=res.data;
		}).catch(e => {
			console.log("获取好友列表失败")
		})
	},
	initNewFriends(state){
		getNewFriendList().then(res => {
			state.newFriends = res.data;
			// debugger
		}).catch(e => {
			console.log("获取新朋友列表失败")
		})
	},
	initRooms(state,data){
		getRoomList().then(res => {
			state.rooms=res.data;
		}).catch(e => {
			console.log("获取群聊列表失败")
		})
	},
	
    changeCurrentSession (state,currentSession) {
		// debugger
      //切换到当前用户就标识消息已读
      if(state.chatType == '群聊'){
		  Vue.set(state.isDot,state.currentUser.id+"#"+currentSession.roomId,false);
	  }else if(state.chatType == '私聊'){
		  Vue.set(state.isDot,state.currentUser.id+"#"+currentSession.userId,false);
	  }
      //更新当前选中的用户
      state.currentSession =currentSession;
    },
    //修改当前聊天窗口列表
    changeCurrentList(state,listName){
	  console.log("当前列表名称："+listName)
      state.currentList=listName;
	  state.chatType = listName;
    },
    //保存聊天数据
    addMessage (state,msg) {
      let message=state.sessions[msg.cacheKey];
      if (!message){
        //创建保存消息记录的数组
        Vue.set(state.sessions,msg.cacheKey,[]);
      }
	  // 追加聊天记录
      state.sessions[msg.cacheKey].push(msg)
    },
    /**
     *  获取离线消息
     */
    initOfflineMsg (state) {
		getOfflineMsg().then(res => {
			// debugger;
			let msgArr = res.data;
			let currentUserId = state.currentUser.id;	
			if(msgArr && msgArr.length > 0){
				for(let i=0;i<msgArr.length;i++){
					let msg = msgArr[i];
					if(msg.msgType == '1'){
						// 群聊消息
						msg.cacheKey = currentUserId+"#"+msg.roomId;
					}else{
						// 私聊消息
						msg.cacheKey = currentUserId+"#"+msg.fromUserId;
					}
					// 设置为未读
					Vue.set(state.isDot,msg.cacheKey,true);
					if (!state.sessions[msg.cacheKey]){
					  //创建保存消息记录的数组
					  Vue.set(state.sessions,msg.cacheKey,[]);
					}
					debugger
					// 去重
					if(state.sessions[msg.cacheKey].length > 0){
						for(let i = 0;i < state.sessions[msg.cacheKey].length;i++){
							debugger
							if(state.sessions[msg.cacheKey][i].id != msg.id){
								state.sessions[msg.cacheKey].push(msg);
								// 防止重复添加
								break;
							}
						}
					}else{
						state.sessions[msg.cacheKey].push(msg)
					}
					
				}
				// 修改为已读
				updateMsgIsRead().then(res => {
					console.log("消息状态更新为已读")
				})
			}
			
		}).catch(e => {
			console.log("获取离线消息失败")
		})
    },
  },
  actions:{
    /**
     * 作用：初始化数据
     * action函数接受一个与store实例具有相同方法和属性的context对象
     * @param context
     */
    initData (context) {
	  // 获取好友列表
	  context.commit('initFriends')
	  // 获取新朋友列表
	  context.commit('initNewFriends')
	  // 获取群聊列表
	  context.commit('initRooms')
      //初始化离线消息
      context.commit('initOfflineMsg')
    },
    /**
     * 实现连接服务端连接与消息订阅
     * @param context 与store实例具有相同方法和属性的context对象
     */
    connect(context){
	  let currentUserId = context.state.currentUser.id;	
      //连接Stomp站点
      context.state.stomp=Stomp.over(new SockJS('/qxf/chat'));
      context.state.stomp.connect({},success=>{
		
		// 订阅指定群聊id的消息  
		function subGroupMsg(subRoomId){
			let subGroup = "/topic/rooms/"+subRoomId+"/"+currentUserId;
			// debugger;
			context.state.stomp.subscribe(subGroup,msg=>{
				// debugger
			  //接收到的消息数据
			  let receiveMsg=JSON.parse(msg.body);
			  receiveMsg.cacheKey = currentUserId+"#"+receiveMsg.roomId;
			  // console.log("收到消息"+receiveMsg);
			  //当前点击的聊天界面不是群聊,默认为消息未读
			  let notRead = context.state.currentSession.roomId != receiveMsg.roomId;
			  if (notRead){
			    Vue.set(context.state.isDot,receiveMsg.cacheKey,true);
			  }
			  // 不是自己发的消息，才将服务端转发的消息进行存储
			  if(receiveMsg && receiveMsg.fromUserId != currentUserId){
				  //提交消息记录
				  context.commit('addMessage',receiveMsg);
			   }
			});
		}
		
        /**
         * 订阅系统广播通知消息
         */
        context.state.stomp.subscribe("/topic/notification",msg=>{
          //判断是否是系统广播通知
            Notification.info({
              title: '系统消息',
              message: msg.body.substr(5),
              position:"top-right"
            });
        });
		
        /**
         * 订阅好友上下线消息
         */
		let myFriends = context.state.friends;
		if(myFriends && myFriends.length > 0){
			for(let i=0;i<myFriends.length;i++){
				context.state.stomp.subscribe("/topic/online/"+myFriends[i].friendId,msg=>{
				    Notification.info({
				      title: '好友状态通知',
				      message: msg.body,
				      position:"top-right"
				    });
					// 更新好友列表的在线状态
					context.commit('initFriends')
				});
			}
		}
		/**
		 * 订阅添加好友请求消息
		 */
		context.state.stomp.subscribe("/topic/newFriends/"+currentUserId,msg=>{
			let obj = JSON.parse(msg.body);
			Notification.info({
			  title: '系统消息',
			  message: obj.msg,
			  position:"top-right"
			});
			// 更新 新朋友 列表
			debugger;
			if(obj.code == 200 && obj.data){
				context.state.newFriends.push(obj.data);
			}
		});
		/**
		 * 订阅好友通过消息（自己请求添加别人为好友，对方同意了，收到消息就可以刷新好友列表了）
		 */
		context.state.stomp.subscribe("/topic/friends/"+currentUserId,msg=>{
			let obj = JSON.parse(msg.body);
			Notification.info({
			  title: '系统消息',
			  message: obj.msg,
			  position:"top-right"
			});
			// 更新好友列表
			debugger;
			if(obj.code == 200 && obj.data){
				context.state.friends.push(obj.data);
			}
		});
		/**
		 * 订阅被拉进群聊的消息
		 */
		context.state.stomp.subscribe("/topic/rooms/"+currentUserId,msg=>{
			let obj = JSON.parse(msg.body);
			if(obj.data.masterId != currentUserId){
				Notification.info({
				  title: '系统消息',
				  message: obj.msg,
				  position:"top-right"
				});
			}
			// 刷新群聊列表
			if(obj.code == 200 && obj.data){
				// 订阅群聊消息
				subGroupMsg(obj.data.id);
				// 追加到群聊列表
				context.state.rooms.push(obj.data);
			}
		});		
        /**
         * 订阅群聊消息
         */
		let myRooms = context.state.rooms;  // 我的所有群聊
		if(myRooms && myRooms.length > 0){
			// 遍历所有的群聊，进行消息订阅
			for(let i=0;i<myRooms.length;i++){
				subGroupMsg(myRooms[i].id);
			}
		}
		
        /**
         * 订阅私人消息
         */
		// let subAddress = '/user/queue/chat';
		let subAddress = '/user/'+currentUserId+'/chat';
		// debugger
        context.state.stomp.subscribe(subAddress,msg=>{
			debugger
          //接收到的消息数据
          let receiveMsg=JSON.parse(msg.body);
		  receiveMsg.cacheKey = currentUserId+"#"+receiveMsg.fromUserId;
          //没有选中用户或选中用户不是发来消息的那一方
          if (!context.state.currentSession||receiveMsg.fromUserId!=context.state.currentSession.userId){
            Notification.info({
              title:'【'+receiveMsg.fromUsername+'】发来一条消息',
              message:receiveMsg.content.length<8?receiveMsg.content:receiveMsg.content.substring(0,8)+"...",
              position:"bottom-right"
            });
            //默认为消息未读
            Vue.set(context.state.isDot,receiveMsg.cacheKey,true);
          }
		  //提交消息记录
		  context.commit('addMessage',receiveMsg);
        })
      },error=>{
		  // debugger;
        Notification.info({
          title: '系统消息',
          message: "无法与服务端建立连接，请尝试重新登陆系统~",
          position:"top-right"
        });
      })
    },
    //与Websocket服务端断开连接
    disconnect(context){
     if (context.state.stomp!=null) {
       context.state.stomp.disconnect();
       console.log("关闭连接~");
     }
    },
  }
})

store.watch(function (state) {
  return state.sessions
},function (val) {
  console.log('CHANGE: ', val);
  localStorage.setItem('chat-session', JSON.stringify(val));
},{
  deep:true/*这个貌似是开启watch监测的判断,官方说明也比较模糊*/
})


export default store;
