<template>
  <div id="uesrtext">
    <div>
      <el-popover placement="top-start" width="400" trigger="click" class="emoBox">
        <div class="emotionList">
          <a href="javascript:void(0);" @click="getEmo(index)" v-for="(item,index) in faceList" :key="index" class="emotionItem">{{item}}</a>
        </div>
        <el-button id="emojiBtn" class="emotionSelect" slot="reference">
          <i class="fa fa-smile-o" aria-hidden="true"></i>
        </el-button>
      </el-popover>
    <el-upload
            class="upload-btn"
            action="/file"
            :before-upload="beforeAvatarUpload"
            :on-success="imgSuccess"
            :on-error="imgError"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png,.JPG,JPEG,.PNG,.gif,.GIF"
            >
      <el-button id="uploadImgBtn" icon="el-icon-picture-outline"></el-button>
    </el-upload>
    </div>
    <textarea id="textarea" placeholder="按 Ctrl + Enter 发送" v-model="content" v-on:keyup="addMessage">
    </textarea>
    <el-button id="sendBtn" type="primary" size="mini" @click="addMessageByClick" >发送(S)</el-button>
  </div>
</template>

<script>
import {mapState} from 'vuex';
const appData=require("../../utils/emoji.json")//引入存放emoji表情的json文件

export default {
  name: 'uesrtext',
  data () {
    return {
      faceList:[],//表情包数据
      content:''
    }
  },
  mounted(){
    for (let i in appData){//读取json文件保存数据给数组
      this.faceList.push(appData[i].char);
    }
  },
  computed:mapState([
    'sessions',
	'chatType',
    'currentSession'
  ]),
  methods: {
    addMessageByClick(){
		this.sendMsg(1,this.content)
    },
  	addMessage (e) {
  		if (e.ctrlKey && e.keyCode ===13 && this.content.length) {
  		   this.addMessageByClick();
  		}
  	},
	sendMsg(msgContentType,msgContent){
		let msgObj = {};
		msgObj.content = msgContent;
		msgObj.fromUserId = this.$store.state.currentUser.id;
		msgObj.fromUsername = this.$store.state.currentUser.username;
		msgObj.fromAvatar = this.$store.state.currentUser.avatar;
		msgObj.createTime = Date.now();
		// 消息内容类型，1文本消息，2图片消息，3语音，4视频，5其他文件
		msgObj.contentType = msgContentType;
		//发送群聊消息
		if (this.chatType == "群聊"){
			// 消息类型，1群聊，2私聊
			msgObj.msgType = 1;  
			msgObj.roomId = this.currentSession.roomId;
			msgObj.roomName = this.currentSession.roomName;
			this.$store.state.stomp.send("/ws/groupChat",{},JSON.stringify(msgObj));
			msgObj.cacheKey = msgObj.fromUserId + "#" + msgObj.roomId;
		}
		//发送私聊消息
		else{
		  msgObj.msgType = 2;  	
		  msgObj.toUserId=this.currentSession.userId;
		  msgObj.toUsername=this.currentSession.username;
		  this.$store.state.stomp.send("/ws/chat",{},JSON.stringify(msgObj));
		  msgObj.cacheKey = msgObj.fromUserId + "#" + msgObj.toUserId;
		}
		//提交消息记录
		this.$store.commit('addMessage',msgObj);
		//清空输入框
		this.content='';
	},
    /**
     *       图片上传的方法
     */
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
      this.sendMsg(2,response)
    },
    // 图片上传失败
    imgError(err, file, fileList){
      this.$message.error("上传失败");
    },
    //获取Emoji
    getEmo(index){
      var textArea=document.getElementById('textarea');
      //将选中的表情插入到输入文本的光标之后
      function changeSelectedText(obj, str) {
        if (window.getSelection) {
          // 非IE浏览器
          textArea.setRangeText(str);
          // 在未选中文本的情况下，重新设置光标位置
          textArea.selectionStart += str.length;
          textArea.focus()
        } else if (document.selection) {
          // IE浏览器
          obj.focus();
          var sel = document.selection.createRange();
          sel.text = str;
        }
      }
      changeSelectedText(textArea,this.faceList[index]);
      this.content=textArea.value;// 要同步data中的数据
      // console.log(this.faceList[index]);
      return;

    },
  }
}
</script>


<style lang="scss">
  /* el-popover是和app同级的，所以scoped的局部属性设置无效 */
  /* 需要设置全局style */
  .el-popover{
    height:200px;
    width:450px;
    overflow: scroll;
    overflow-x:auto;
  }
</style>

<style lang="scss" scoped>
#uesrtext {
	position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 30%;
  border: solid 1px #DDD;
  background-color: white;
  > textarea {
  	padding: 10px;
  	width: 95%;
  	height: 58%;
  	border: none;
  	outline: none;
    resize: none;//禁止拉伸
  }
  #sendBtn{
    float: right;
    margin-right: 10px;
  }
  #uploadImgBtn{
    border: none;
    padding-bottom: 0px;
    margin-bottom: 0px;
    padding-left: 12px;
  }
  #uploadImgBtn:hover{
    background-color: white;
  }
  #emojiBtn{
    border: none;
    padding-right: 0px;
    padding-bottom: 0px;
    margin-bottom: 0px;
  }
  #emojiBtn:hover{
    background-color: white;
  }
  .upload-btn{
    display: inline-block;
  }
}
.emotionList{
  display: flex;
  flex-wrap: wrap;
  padding:5px;
}
.emotionItem{
  width:10%;
  font-size:20px;
  text-align:center;
}
/*包含以下四种的链接*/
.emotionItem {
  text-decoration: none;
}
/*正常的未被访问过的链接*/
.emotionItem:link {
  text-decoration: none;
}
/*已经访问过的链接*/
.emotionItem:visited {
  text-decoration: none;
}
/*鼠标划过(停留)的链接*/
.emotionItem:hover {
  text-decoration: none;
}
/* 正在点击的链接*/
.emotionItem:active {
  text-decoration: none;
}
</style>
