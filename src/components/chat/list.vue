<template>
  <div id="list">
	<!--机器人-->
<!-- 	<ul v-if="currentList=='机器人'">
		<p style="padding: 2px 4px;height: 20px">快来和机器人聊天吧！</p>
		<li :class="{ active: currentSession?'机器人'== currentSession.username:false }"
				v-on:click="changeCurrentSession(robotObj)">
			<img class="avatar" src="https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=2548892998,499717296&fm=26&gp=0.jpg">
			<p class="name">瓦力(智能回复)</p>
		</li>
	</ul> -->

	<el-scrollbar wrap-class="userList" wrap-style="height:600px;" view-style="height:100%;" :native="false">
		<ul v-if="chatType == '群聊'">
		    <!--群聊列表-->
			<p style="padding: 2px 4px;height: 20px">群聊列表</p>
			<li v-for="room in rooms" :key="room.id" :class="{ active: currentSession? room.name == currentSession.roomName:false }"
					v-on:click="changeCurrentSession(room)">
				<el-image class="avatar"
						:src="room.avatar"
						:alt="room.name">
				</el-image>
				<el-badge :is-dot="isDot[user.id+'#'+room.id]"><p class="name">{{room.name}}</p></el-badge>
			</li>
		</ul>
		<!-- 好友列表 -->
		<ul v-if="chatType == '私聊'">
			<p style="padding: 2px 4px;height: 20px">好友列表</p>
			<li v-for="item in friends" :class="{ active: currentSession?item.remark === currentSession.username:false }"
						v-on:click="changeCurrentSession(item)">
					<div style="display: flex;justify-content: space-between">
						<div>
							<el-badge :is-dot="isDot[user.id+'#'+item.friendId]" style="">
								<el-image class="avatar"
													:preview-src-list="[item.avatar]"
													:src="item.avatar"
													:alt="item.remark">
									<div slot="error" class="image-slot">
										<i class="el-icon-picture-outline"></i>
									</div>
								</el-image>
							</el-badge>
							<p class="name">{{item.remark}}</p>
						</div>
						<div>
							<el-badge :value="item.isOnline==1?'在线':'离线'" :type="item.isOnline==1?'info':'danger'"></el-badge>
						</div>
					</div>
			</li>
		</ul>
		<!-- 新朋友列表 -->
		<ul  v-if="chatType == '新朋友'">
			<p style="padding: 2px 4px;height: 20px">新朋友列表</p>
			<li v-for="(item,index) in newFriends" :key="item.friendId" :class="{ active: currentIndex == index}" @click="currentIndex=index">
					<div style="display: flex;justify-content: space-between">
						<div>
							<el-image class="avatar"
									:src="item.avatar"
									:alt="item.remark">
							</el-image>
							<p class="name">{{item.remark}}</p>
						</div>
						<div style="float: right;">
							 <el-button type="primary" size="mini" @click="toAgree">同意</el-button>
							 <el-button type="primary" size="mini" @click="refuseFriend(item.friendId)">拒绝</el-button>
						</div>
					</div>
			</li>
		</ul>
	</el-scrollbar>
	
	<!-- 好友备注 -->
	<el-dialog title="好友备注" :visible.sync="friendRemarkVisible" class="feedbackDialog">
	  <el-form status-icon>
		<el-form-item label="好友备注：" label-width="120px">
			<el-input v-model="friendRemark" placeholder="给好友取个名字吧" autocomplete="off"></el-input>
		</el-form-item>
	  </el-form>	
	  <span slot="footer" class="dialog-footer">
		<el-button type="primary" @click="agreeFriend">确 定</el-button>
		<el-button @click="friendRemarkVisible = false">取 消</el-button>
	  </span>
	</el-dialog>
	
  </div>
</template>

<script>
import {mapState} from 'vuex'
import {agree,refuse} from '@/api/friend.js'

export default {
  name: 'list',
  data () {
    return {
			user:this.$store.state.currentUser,
			currentIndex: 0,
			friendRemarkVisible: false,
			friendRemark: '',  // 给好友的备注
    }
  },
  computed: mapState([
  'friends',
  'newFriends',
  'rooms',
  'chatType',
  'currentSession',
	'isDot',
	'currentList'
	]),
  methods:{
  	changeCurrentSession(item) {
		let param = {
			roomId: '',
			roomName: '',
			userId: '',
			username: '',
			avatar: '',
		}
		// debugger
		if(this.chatType == '群聊'){
			param.roomId = item.id
			param.roomName = item.name
		}else if(this.chatType == '私聊'){
			param.userId = item.friendId
			param.username = item.remark
		}
		param.avatar = item.avatar
  		this.$store.commit('changeCurrentSession',param)
  	},
	// 打开好友备注对话框
	toAgree(){
		this.friendRemarkVisible = true;
	},
	// 同意添加为好友
	agreeFriend(){
		let currentFriend = this.newFriends[this.currentIndex];
		let param = {
		  userId: this.user.id,
		  friendId: currentFriend.friendId,
		  remark: this.friendRemark ? this.friendRemark : currentFriend.remark
		};
		const that = this;
		agree(param).then(res => {
			// 刷新 新朋友 列表
			that.$store.commit('initNewFriends');
			that.friendRemarkVisible = false;
			// 刷新好友列表
			that.$store.commit('initFriends');
		}).catch(e => {
			
		})
	},
	// 拒绝添加为好友
	refuseFriend(friendId){
		let param = {
		  userId: this.user.id,
		  friendId: friendId		
		};
		const that = this;
		refuse(param).then(res => {
			// 刷新 新朋友 列表
			that.$store.commit('initNewFriends');
			that.friendRemarkVisible = false;
		}).catch(e => {
			
		})
	},
	
  }
}
</script>

<style lang="scss" scoped>
#list {
	ul{
		margin-left: 0px;
		padding-left: 0px;
		margin-left: 2px;
	}
	li {
		padding-top: 14px;
		padding-bottom: 14px;
		//padding-right: 40px;
		//border-bottom: 1px solid #292C33;
		list-style: none;
		cursor: pointer;
		&:hover {
			background-color: #D8D6D6;
		}
	}
  li.active {/*注意这个是.不是冒号:*/
			background-color: #C8C6C6;
	}
	.avatar {
		border-radius: 2px;
		width: 30px;
		height: 30px;
		vertical-align: middle;
	}
	.name {
		display: inline-block;
		margin-left: 15px;
		margin-top: 0px;
		margin-bottom: 0px;
	}
	.stateItem {//在线状态的样式
		/*position: absolute;*/
		/*left: 160px;*/
		//margin-left: 100px;
		//margin-right: 10px;
	}
	.userList{
		max-height: 600px;
	}
	.el-scrollbar__wrap.default-scrollbar__wrap {
		overflow-x: auto;
	}
}
</style>
