import  Vue from 'vue'
import  Vuex from 'vuex'
import {getRequest} from "../utils/api";
import SockJS from '../utils/sockjs'
import  '../utils/stomp'
import { Notification } from 'element-ui';
import {getFriendList,getNewFriendList} from '@/api/friend.js'
import {getRoomList} from '@/api/room.js'

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
    //保存群聊消息记录
    addGroupMessage(state,msg){
	  // let chatHistoryKey = state.currentUser.id+"#"+state.currentSession.roomId;
   //    let message=state.sessions[chatHistoryKey];
   //    if (!message){
   //      Vue.set(state.sessions,chatHistoryKey,[]);
   //    }
   //    state.sessions[chatHistoryKey].push(msg)
    },
    //保存单聊数据
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
     *  获取本地聊天记录，同步数据库的记录保存到localStorage中。
     *  不刷新情况下都是读取保存再localStorage中的记录
     * @param state
     * @constructor
     */
    INIT_DATA (state) {
		Vue.set(state.sessions,'群聊',{});
        //同步数据库中的群聊数据
  //       getRequest("/groupMsgContent/").then(resp=>{
  //         if (resp){
  //           Vue.set(state.sessions,'群聊',resp);
  //         }
  //       }).catch(e => {
			
		// })
		
    },
    //保存系统所有用户
    INIT_USER(state,data){
      state.users=data;
    },
    //请求并保存所有系统用户
    // GET_USERS(state){
    //   getRequest("/user/list").then(resp=>{
    //     if (resp){
    //       state.users=resp.data;
    //     }
    //   })
    // }
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
      //初始化聊天记录
      context.commit('INIT_DATA')
      //获取用户列表
      // context.commit('GET_USERS')
    },
    /**
     * 实现连接服务端连接与消息订阅
     * @param context 与store实例具有相同方法和属性的context对象
     */
    connect(context){
      //连接Stomp站点
      context.state.stomp=Stomp.over(new SockJS('/qxf/chat'));
      context.state.stomp.connect({},success=>{
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
            //更新用户列表（的登录状态）
            // context.commit('GET_USERS');
        });
        /**
         * 订阅群聊消息
         */
		let myRooms = context.state.rooms;  // 我的所有群聊
		if(myRooms && myRooms.length > 0){
			// 遍历所有的群聊，进行消息订阅
			for(let i=0;i<myRooms.length;i++){
				context.state.stomp.subscribe("/topic/rooms/"+myRooms[i].roomId,msg=>{
					// debugger
				  //接收到的消息数据
				  let receiveMsg=JSON.parse(msg.body);
				  receiveMsg.cacheKey = context.state.currentUser.id+"#"+receiveMsg.roomId;
				  // console.log("收到消息"+receiveMsg);
				  //当前点击的聊天界面不是群聊,默认为消息未读
				  let notRead = context.state.currentSession.roomId != receiveMsg.roomId;
				  if (notRead){
				    Vue.set(context.state.isDot,receiveMsg.cacheKey,true);
				  }
				  // 不是自己发的消息，才将服务端转发的消息进行存储
				  if(receiveMsg && receiveMsg.fromUserId != context.state.currentUser.id){
					  //提交消息记录
					  context.commit('addMessage',receiveMsg);
				   }
				});
			}
		}
		
        /**
         * 订阅私人消息
         */
		// let subAddress = '/user/queue/chat';
		let subAddress = '/user/'+context.state.currentUser.id+'/chat';
		// debugger
        context.state.stomp.subscribe(subAddress,msg=>{
			// debugger
          //接收到的消息数据
          let receiveMsg=JSON.parse(msg.body);
		  receiveMsg.cacheKey = context.state.currentUser.id+"#"+receiveMsg.fromUserId;
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
