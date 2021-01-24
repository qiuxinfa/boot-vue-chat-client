<template>
  <div id="list">
  	<ul v-if="chatType == '群聊'">
        <!--群聊列表-->
		<p style="padding: 2px 4px;height: 20px">群聊列表</p>
		<li v-for="room in rooms" :key="room.roomId" :class="{ active: currentSession? room.roomName == currentSession.roomName:false }"
				v-on:click="changeCurrentSession(room)">
			<!-- <img class="avatar" src="https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1268761962,3976237305&fm=26&gp=0.jpg"> -->
			<el-badge :is-dot="isDot[user.id+'#'+room.roomId]"><p class="name">{{room.roomName}}</p></el-badge>
		</li>
	</ul>
    <!--机器人-->
<!-- 	<ul v-if="currentList=='机器人'">
		<p style="padding: 2px 4px;height: 20px">快来和机器人聊天吧！</p>
		<li :class="{ active: currentSession?'机器人'== currentSession.username:false }"
				v-on:click="changeCurrentSession(robotObj)">
			<img class="avatar" src="https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=2548892998,499717296&fm=26&gp=0.jpg">
			<p class="name">瓦力(智能回复)</p>
		</li>
	</ul>
 --><!--用户列表-->
	<el-scrollbar wrap-class="userList" wrap-style="height:600px;" view-style="height:100%;" :native="false">
	<ul v-if="chatType == '私聊'" >
		<p style="padding: 2px 4px;height: 20px">好友列表</p>
  		<li v-for="item in friends" :class="{ active: currentSession?item.remark === currentSession.username:false }"
					v-on:click="changeCurrentSession(item)"><!--   :class="[item.id === currentSession ? 'active':'']" -->
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
<!-- 					<div>
					<el-badge :value="item.status==1?'在线':'离线'" :type="item.status==0?'danger':'info'"></el-badge>
					</div> -->
				</div>
  		</li>
  	</ul>
		</el-scrollbar>
  </div>
</template>

<script>
import {mapState} from 'vuex'

export default {
  name: 'list',
  data () {
    return {
			user:this.$store.state.currentUser,
    }
  },
  computed: mapState([
  'friends',
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
			param.roomId = item.roomId
			param.roomName = item.roomName
		}else if(this.chatType == '私聊'){
			param.userId = item.friendId
			param.username = item.remark
			param.avatar = item.avatar
		}
  		this.$store.commit('changeCurrentSession',param)
  	}
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
