<template>
  <div id="card">
		<el-input class="search" type="text" size="mini" v-model="$store.state.filterKey" placeholder="搜索好友或聊天记录" prefix-icon="el-icon-search"></el-input>
		<el-dropdown trigger="click">
			<el-button class="searchBtn" size="mini"><i class="fa fa-plus" aria-hidden="true"></i></el-button>
<!-- 		  <el-button type="primary">
			更多菜单<i class="el-icon-arrow-down el-icon--right"></i>
		  </el-button> -->
		  <el-dropdown-menu slot="dropdown">
			<el-dropdown-item @click.native="friendOpen">添加好友</el-dropdown-item>
			<el-dropdown-item @click.native="roomOpen">创建群聊</el-dropdown-item>
		  </el-dropdown-menu>
		</el-dropdown>
		<!-- 添加好友 -->
		<el-dialog title="添加好友" :visible.sync="friendVisible" width="30%">
			<el-row>
			  <el-col :span="12"><el-input v-model="searchKey" type="text" placeholder="输入用户名模糊查询" @keyup.enter="queryUserList"></el-input></el-col>
			  <el-col :span="8"><el-button type="primary" icon="el-icon-search" @click="queryUserList">搜索</el-button></el-col>
			</el-row>	
			<br />
			  <el-table v-if="friendData && friendData.length >0"
			    :data="friendData"
			    tooltip-effect="dark"
			    style="width: 100%">
			    <el-table-column v-if="false"
			      prop="id"
			      label="id"
			      width="120">
			    </el-table-column>
			    <el-table-column
			      prop="username"
			      label="用户名"
			      width="120">
			    </el-table-column>
				<el-table-column
				      align="center"
				      fixed="right"
				      label="操作">
				      <template slot-scope="scope">
				        <el-button
				          size="mini"
				          type="primary" icon="el-icon-plus"
				          @click="handleEdit(scope.row)">加为好友</el-button>
				      </template>
				</el-table-column>
			  </el-table>
		</el-dialog>
		<!-- 好友备注 -->
		<el-dialog title="好友备注" :visible.sync="friendRemarkVisible" class="feedbackDialog">
		  <el-form status-icon>
		    <el-form-item label="好友备注：" label-width="120px">
		        <el-input v-model="friendRemark" placeholder="给好友取个名字吧" autocomplete="off"></el-input>
		    </el-form-item>
		  </el-form>	
		  <span slot="footer" class="dialog-footer">
		    <el-button type="primary" @click="handleSend">发送请求</el-button>
		    <el-button @click="friendRemarkVisible = false">取 消</el-button>
		  </span>
		</el-dialog>
		
		<!-- 创建群聊 -->
		<el-dialog title="创建群聊" :visible.sync="roomVisible" width="30%">
			<el-row>
			  <el-col :span="8"><el-input v-model="searchKey" type="text" placeholder="输入用户名模糊查询" @keyup.enter="queryUserList"></el-input></el-col>
			  <el-col :span="8"><el-button type="primary" icon="el-icon-search" @click="queryUserList">搜索</el-button></el-col>
			  <el-col :span="8"><el-button type="primary" icon="el-icon-plus" @click="editRoomName">创建群聊</el-button></el-col>
			</el-row>	
			<br />
			  <el-table v-if="roomData && roomData.length >0"
			    ref="multipleTable"
			    :data="roomData"
			    tooltip-effect="dark"
			    style="width: 100%"
			    @selection-change="handleSelectionChange">
			    <el-table-column
			      type="selection"
			      width="55">
			    </el-table-column>
			    <el-table-column v-if="false"
			      prop="id"
			      label="id"
			      width="120">
			    </el-table-column>
			    <el-table-column
			      prop="username"
			      label="用户名"
			      width="120">
			    </el-table-column>
				</el-table-column>
			  </el-table>
		</el-dialog>
		<!-- 群聊名称 -->
		<el-dialog title="创建群聊" :visible.sync="roomNameVisible" class="feedbackDialog">
		  <el-form status-icon>
		    <el-form-item label="群聊名称：" label-width="120px">
		        <el-input v-model="roomName" placeholder="给群聊取个名字吧" autocomplete="off"></el-input>
		    </el-form-item>
			<el-form-item label="群聊头像：" label-width="120px">
				<el-image v-if="roomAvatar"  :src="roomAvatar" class="img"></el-image>
				<el-upload v-else
						class="upload-btn"
						action="/file"
						:before-upload="beforeAvatarUpload"
						:on-success="imgSuccess"
						:on-error="imgError"
						:show-file-list="false"
						accept=".jpg,.jpeg,.png,.JPG,JPEG,.PNG,.gif,.GIF"
						>
				  <el-button type="primary">上传群聊头像</el-button>
				</el-upload>
			</el-form-item>
		  </el-form>	
		  <span slot="footer" class="dialog-footer">
		    <el-button type="primary" @click="confirmCreate">确认创建</el-button>
		    <el-button @click="roomNameVisible = false">取 消</el-button>
		  </span>
		</el-dialog>
		
  </div>
</template>

<script>
	import {getUserList} from '@/api/user.js'
	import {addFriend} from '@/api/friend.js'
	import {createRoom} from '@/api/room.js'
	
export default {
  name: 'card',
  data () {
    return {
      user:JSON.parse(window.sessionStorage.getItem('user')),
	  friendVisible: false,
	  roomVisible: false,
	  searchKey: '',  // 查询关键字
	  friendData: [],  
	  roomData: [],  // 结果列表
	  friendRemarkVisible: false,
	  friendId: '',
	  friendUsername: '',
	  friendRemark: '', // 好友备注
	  roomNameVisible: false,
	  roomName: '',    // 群聊名称
	  roomAvatar: null,  // 群聊头像
	  queryType: 0,    // 查询类型，0好友，1群聊
	  selectedUsers: [],  // 群聊选中的用户
    }
  },
  methods:{
	  // 添加好友
	  friendOpen(){
		  this.searchKey = '';
		  this.queryType = 0;
		  this.friendVisible = true;
	  },
	  // 创建群聊
	  roomOpen(){
		  this.searchKey = '';
		  this.queryType = 1;
		  this.roomVisible = true;
	  },
	  // 查询用户列表
	  queryUserList(){
		  if(this.queryType == 0 && !this.searchKey){
			  this.$message.error('查询的关键字不能为空！');
			  return;
		  }
		  const that = this;
		  let param = {
			  searchKey: this.searchKey,
			  isFriend: this.queryType
		  };
		  getUserList(param).then(res => {
			  if(that.queryType == 0){
				  that.friendData = res.data
			  }else{
				  that.roomData = res.data
			  }
			  
		  }).catch(e => {
			  console.log("获取用户列表失败")
		  })
	  },
	  handleSelectionChange(obj){
		  this.selectedUsers = obj
		  // debugger;
	  },
	  
	  // 好友备注
	  handleEdit(item){
		 this.friendId = item.id;
		 this.friendUsername = item.username;
		 this.friendRemarkVisible = true;
	  },
	  // 群聊名称
	  editRoomName(){
		  this.roomNameVisible = true;
	  },
	  // 发送添加好友请求
	  handleSend(){
		  let param = {
			  userId: this.user.id,
			  friendId: this.friendId,
			  remark: this.friendRemark ? this.friendRemark : this.friendUsername
		  };
		  const that = this;
		  addFriend(param).then(res => {
			  that.friendData = [];
			  that.friendRemarkVisible = false;
			  that.friendVisible = false;
		  }).catch(e => {
			  console.log("发送好友请求失败")
		  })
	  },
	  // 创建群聊
	  confirmCreate(){
		  // debugger
		  if(this.selectedUsers && this.selectedUsers.length == 0){
			  this.$message.error('请选择群聊用户！');
			  return;
		  }
		  if(!this.roomName){
			 this.$message.error('群聊名称不能为空！'); 
			 return;
		  }
		  const that = this;
		  let userIds = '';
		  for(let i=0;i<this.selectedUsers.length;i++){
			  userIds += this.selectedUsers[i].id + ',';
		  }
		  // 最后加上自己的id
		  userIds += this.user.id;
		  let param = {
			  userIds: userIds,
			  name: this.roomName,
			  avatar: this.roomAvatar
		  };
		  createRoom(param).then(res => {
			  that.roomData = [];
			  that.roomNameVisible = false;
			  that.roomVisible = false;
		  }).catch(e => {
			  console.log("创建群聊失败")
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
	    this.roomAvatar = response
	  },
	  // 图片上传失败
	  imgError(err, file, fileList){
	    this.$message.error("上传失败");
	  },
	  
  }
}
</script>

<style lang="scss" scoped>
#card {
	padding: 12px;
	margin-bottom: 5px;
  .avatar{
  	width: 40px;
  	height: 40px;
  	vertical-align: middle;/*这个是图片和文字居中对齐*/
  }
  .name {
  	display: inline-block;
  	padding: 10px;
  	margin-bottom: 15px;
  	font-size: 16px;
  }
  .search {
  	background-color: #DBD9D8;
		width: 150px;
  	height: 30px;
  	line-height: 30px;
  	padding: 0 10px;
  	border: 0;
  	border-radius: 4px;
  	outline: none;/*鼠标点击后不会出现蓝色边框*/
    color: #FFF;
  }
	.searchBtn{
		background-color: #DBD9D8;
		border: 0;
		margin-left: 3px;
	}
	.img{
		display: inline-block;
		height: 100px;
		width: 100px;
		margin-top: 15px;
	}
}
</style>
<style>
	/*当前组件的el-input样式设置*/
	#card .el-input__inner {
		background-color: #DBD9D8;
		outline: none;/*鼠标点击后不会出现蓝色边框*/
	}
</style>
