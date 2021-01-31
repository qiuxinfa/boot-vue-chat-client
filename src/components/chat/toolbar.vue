<template>
  <div id="toolbar">
    <el-image class="imgProfile"
              :src="user.avatar"
              :preview-src-list="[user.avatar]"
              :alt="user.username">
      <div slot="error" class="image-slot">
        <i class="el-icon-picture-outline"></i>
      </div>
    </el-image>
    <div id="btnBar">
      <div class="topBtnBar">
		<el-tooltip class="item" effect="dark" content="聊天列表" placement="right">
		   <el-button class="toolBtn" size="small"><i class="fa fa-comments fa-2x" aria-hidden="true"></i></el-button>
		</el-tooltip> 
        <el-tooltip  class="item" effect="dark" content="群聊列表" placement="right">
			<el-button @click="chooseChatList('群聊')" class="toolBtn" size="small"><i class="fa fa-group fa-2x" aria-hidden="true"></i></el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="好友列表" placement="right">
			<el-button @click="chooseChatList('私聊')" class="toolBtn" size="small"><i class="fa fa-address-book-o fa-2x" aria-hidden="true"></i></el-button>
        </el-tooltip>
       <el-tooltip class="item" effect="dark" content="新朋友" placement="right">
		  <!-- <el-badge :value="12" class="item"> -->
			<el-button @click="chooseChatList('新朋友')" class="toolBtn" size="small"><i class="fa a fa-user-plus fa-2x" aria-hidden="true"></i></el-button>
		  <!-- </el-badge> -->
        </el-tooltip>
		<el-tooltip class="item" effect="dark" content="系统消息" placement="right">
		   <el-button class="toolBtn" size="small"><i class="fa fa-bell-o fa-2x" aria-hidden="true"></i></el-button>
		</el-tooltip>
      </div>
      <div class="bottomBtnBar">
        <el-tooltip class="item" effect="dark" content="个人中心" placement="right">
          <el-button @click="toUserInfo" class="toolBtn" size="small"><i class="fa fa-user fa-2x" aria-hidden="true"></i></el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="更多" placement="right">
          <el-popover
                  placement="right"
                  width="180"
                  trigger="click"
                  popper-class="moreListPopoverClass"
                   >
            <ul id="moreList">
              <li @click="showFeedbackDialog" >意见反馈</li>
              <li>举报</li>
              <li @click="clearChatHistory">清空聊天记录</li>
            </ul>
            <el-button slot="reference" class="toolBtn" size="small"><i class="fa fa-bars fa-2x" aria-hidden="true"></i></el-button>
          </el-popover>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="退出" placement="right">
			<el-button @click="exitSystem" class="toolBtn" size="small"><i class="fa fa-sign-out fa-2x" aria-hidden="true"></i></el-button>
        </el-tooltip>
      </div>
    </div>
	<!-- 个人中心 -->
	<el-dialog title="个人信息" :visible.sync="userInfoDialogVisible" width="30%">
	  <el-form :model="userInfo" status-icon :rules="rules">
	    <el-form-item label="用户名：" :label-width="formLabelWidth" prop="username">
	        <el-input :value="userInfo.username" :readonly="true" autocomplete="off"></el-input>
	    </el-form-item>
		<el-form-item label="性别：" :label-width="formLabelWidth" prop="sex">
		    <el-select v-model="userInfo.sex">
				<el-option v-for="item in sexOptions" :key="item.value" :value="item.value" :label="item.label">
				</el-option>
			</el-select>
		</el-form-item>
		<el-form-item label="手机号码：" :label-width="formLabelWidth" prop="phone">
		    <el-input v-model="userInfo.phone" autocomplete="off"></el-input>
		</el-form-item>
		<el-form-item label="邮箱：" :label-width="formLabelWidth" prop="email">
		    <el-input v-model="userInfo.email" autocomplete="off"></el-input>
		</el-form-item>
	    <el-form-item label="用户头像：" :label-width="formLabelWidth">
			<el-image v-if="userInfo.avatar" :src="userInfo.avatar"
								:preview-src-list="[user.avatar]"
								class="img">
				<div slot="error" class="image-slot">
					<i class="el-icon-picture-outline"></i>
				</div>
			</el-image>
			<el-upload v-else
					class="upload-btn"
					action="/file"
					:before-upload="beforeAvatarUpload"
					:on-success="imgSuccess"
					:on-error="imgError"
					:show-file-list="false"
					accept=".jpg,.jpeg,.png,.JPG,JPEG,.PNG,.gif,.GIF"
					>
			  <el-button type="primary">修改头像</el-button>
			</el-upload>
	    </el-form-item>
	  </el-form>
	  <div slot="footer" class="dialog-footer">
	    <el-button type="primary" @click="saveUserInfo">保 存</el-button>
		<el-button @click="userInfoDialogVisible = false">取 消</el-button>
	  </div>
	</el-dialog>
	<!-- 意见反馈 -->
    <el-dialog title="意见反馈" :visible.sync="feedBackDialogVisible" class="feedbackDialog">
      <textarea class="feedbackInput" v-model="feedBackContent">

      </textarea>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleFeedbackSend">确 定</el-button>
        <el-button @click="feedBackDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
	import {logout} from '@/api/auth.js'
	import {updateUserInfo} from '@/api/user.js'
	
  export default {
    name: "toolbar",
    data(){
		// 手机号验证
		const validatePhone = (rule, value, callback) => {
		  if (value === "") {
		    callback(new Error("请输入手机号"));
		  } else {
		    if (!/^1[3456789]\d{9}$/.test(value)) {
		      callback(new Error("请输入正确的手机号"));
		    } else {
		      callback();
		    }
		  }
		 }; 
      return{
        user:JSON.parse(window.sessionStorage.getItem('user')),
		userInfo:JSON.parse(window.sessionStorage.getItem('user')),
        feedBackDialogVisible:false,
        feedBackContent:'',
		userInfoDialogVisible: false,
		formLabelWidth: '120px',
		sexOptions: [
			{value:1,label:'男'},
			{value:2,label:'女'},
		],
		// 表单验证
		rules: {
		  phone: [{ validator: validatePhone, trigger: "change" }],
		  email: [
		    { required: true, message: '请输入邮箱地址' },
		    { type: 'email', message: '请输入正确的邮箱地址',trigger: 'blur' }
		  ],
		},
		
      }
    },
    methods:{
	  // 打开个人中心页面
	  toUserInfo(){
		 this.userInfoDialogVisible = true; 
	  },
	  // 保存个人信息
	  saveUserInfo(){
		const that = this;
		updateUserInfo(this.userInfo).then(res => {
			that.userInfoDialogVisible = false;
		}).catch(e => {
			that.$message({
			  type: 'error',
			  message: '保存失败'
			});
		})
		
	  },
	  //上传前
	  beforeAvatarUpload(file) {
	    //判断图片的格式
	    let imgType=file.name.substring(file.name.lastIndexOf(".")+1);
	    imgType=imgType.toLowerCase();
	    let isImg=imgType==='jpg'|| imgType==='png'|| imgType==='jpeg'||imgType==='gif';
	     if (!isImg){
	       this.$message.error('上传图片格式不符合要求！');
	     }
	    return isImg;
	  },
	  // 图片上传成功
	  imgSuccess(response, file, fileList) {
	    console.log("图片url为："+response);
	    this.userInfo.avatar = response
	  },
	  // 图片上传失败
	  imgError(err, file, fileList){
	    this.$message.error("上传失败");
	  },
      //退出系统
      exitSystem(){
        this.$confirm('你是否要退出系统吗?', '系统提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          logout().then(res => {
			  sessionStorage.removeItem("user");
			  //清除SessionStorage中保存的state
			  if (sessionStorage.getItem("state")){
			    sessionStorage.removeItem("state");
			  }
		  }).catch(e => {
			  
		  })
          //关闭连接
          this.$store.dispatch("disconnect");
          this.$router.replace("/");
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消操作'
          });
        });
      },
      //选择聊天列表
      chooseChatList(listName){
        this.$store.commit("changeCurrentList",listName);
      },
      //打开意见反馈对话框
      showFeedbackDialog(){
        this.feedBackContent='';
        this.feedBackDialogVisible=true;
      },
      //处理反馈消息邮件发送
      handleFeedbackSend(){
        let msgObj={};
        msgObj.userId=this.user.id;
        msgObj.username=this.user.username;
        msgObj.username=this.user.username;
        msgObj.content=this.feedBackContent;
        console.log(msgObj)
        this.postRequest("/mail/feedback",msgObj).then(resp=>{
          if (resp) {
            this.feedBackDialogVisible = false;
          }
        })
      },
      //清空聊天记录
      clearChatHistory(){
        this.$confirm('此操作将永久删除本地聊天记录(群聊记录会在下次登录时恢复), 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          //清除本地的localStorage中的聊天记录
          if (localStorage.getItem("chat-session")){
            localStorage.removeItem("chat-session");
          }
          //清除Vuex中保存的记录
          this.$store.state.sessionStorage={};
          //清除SessionStorage中保存的state
          if (sessionStorage.getItem("state")){
            sessionStorage.removeItem("state");
          }
          this.$message({
            type: 'success',
            message: '删除成功'
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      }
    }
  }
</script>

<style lang="scss" scoped>
  #toolbar{
    width: 100%;
    height: 100%;
    #btnBar{
      width: 100%;
      height: 82%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .imgProfile{
      width: 40px;
      height: 40px;
      horiz-align: center;
      margin: 25px 10px;
    }
    .toolBtn{
      background-color: #2e3238;
      border: 0;
      margin: 5px 5px;
    }
    .feedbackDialog{
      width: 1000px;
      height: 800px;
      margin: 10px auto;
      //background-color: #ECEAE8;
    }
    .feedbackInput{
      width: 450px;
      height: 200px;
      resize: none;
      padding: 0;
      margin: 0;
    }
  }

	.img{
		display: inline-block;
		height: 100px;
		width: 100px;
		margin-top: 15px;
	}
		
  #moreList{
    margin: 0px;
    padding: 0px;
    background-color: #2e3238;
    li {
      padding-top: 14px;
      padding-bottom: 14px;
      padding-left: 5px;
      //padding-right: 40px;
      //border-bottom: 1px solid #292C33;
      list-style: none;
      cursor: pointer;
      &:hover {
        background-color: #abaaaa;
      }
    }
  }

</style>
<style lang="scss">
  /* el-popover是和app同级的，所以scoped的局部属性设置了无效 */
  /* 需要设置全局style */
  .el-popover.moreListPopoverClass{
    height:150px;
    width:150px;
   // margin: 0px;
    margin-left: 10px;
    padding: 0px;
    overflow-x: hidden;
    overflow-y: hidden;
    background-color:#2e3238;
    border:none;
  }
</style>
