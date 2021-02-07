<template>
  <div class="chatTitle">
    <span class="titleName">{{chatType=='群聊' ? currentSession.roomName : currentSession.username}}</span>
	<el-dropdown v-if="currentSession.roomId || currentSession.userId" @command="handleCommand">
	  <el-button type="text">同步聊天记录</el-button>
	  <el-dropdown-menu slot="dropdown">
	    <el-dropdown-item :command="chatRecordType.threeDays">最近3天的聊天记录</el-dropdown-item>
	    <el-dropdown-item :command="chatRecordType.sevenDays">最近7天的聊天记录</el-dropdown-item>
	    <el-dropdown-item :command="chatRecordType.thirtyDays">最近30天的聊天记录</el-dropdown-item>
		<el-dropdown-item :command="chatRecordType.year">最近一年的聊天记录</el-dropdown-item>
		<el-dropdown-item :command="chatRecordType.all">所有聊天记录</el-dropdown-item>
	  </el-dropdown-menu>
	</el-dropdown>
    <el-button class="moreBtn" size="small" icon="el-icon-more"></el-button>
  </div>
</template>

<script>
  import {mapState} from 'vuex'
  import {getChatRecord} from '@/api/messageDetail.js'
  
  export default {
    name: "chattitle",
	data(){
		return {
			user:JSON.parse(window.sessionStorage.getItem('user')),
			// 同步聊天记录的类型
			chatRecordType:{
				threeDays: 3,
				sevenDays: 7,
				thirtyDays: 30,
				year: 365,
				all: null,
			}
		}
	},
	
	computed: mapState([
	'chatType',
	'currentSession',
	]),
	
	methods:{
	  handleCommand(command) {
		const that = this
		let param = {}
		param.days = command;
		let cacheKey = ''
		if(this.chatType=='群聊'){
			cacheKey = this.user.id + '#' + this.currentSession.roomId
			// 消息类型，1群聊，2是私聊
			param.msgType = 1
			param.toUserId = this.user.id
			param.roomId = this.currentSession.roomId
		}else{
			cacheKey = this.user.id + '#' + this.currentSession.userId 
			param.msgType = 2
			param.toUserId = this.user.id
			param.fromUserId = this.currentSession.userId
		}
        
		getChatRecord(param).then(res => {
			// debugger;
			// 同步聊天记录
			that.$store.commit('syncChatRecord',{cacheKey:cacheKey,msgArr:res.data});
		}).catch(e => {
			console.log("同步聊天记录失败")
		})
		
	  }
	},
	
  }
</script>

<style scoped>
  .chatTitle{
    height: 50px;
    width: 100%;
    font-size: 20px;
    display: flex;
    justify-content: space-between;
    border-bottom: 0.5px solid #c7d2db;
  }
  .moreBtn{
    background-color: #eee;
    border: 0;
    height: 40px;
  }
  .titleName{
    margin: 10px 20px;
  }
	.el-dropdown-link {
	  cursor: pointer;
	  color: #409EFF;
	  border: 0;
	  height: 40px;
	}

</style>
