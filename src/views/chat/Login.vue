<template>
  <el-container>
<!--    <el-header >
      <el-button @click="gotoAdminLogin" icon="el-icon-d-arrow-right" style="float: right;border: none" >管理端登录</el-button>
    </el-header> -->
    <el-main>
      <div class="loginContainer">
        <el-form ref="loginForm" :rules="rules" :model="loginForm" label-width="80px">
          <h3 class="loginTitle">webChat~</h3>
          <el-form-item label="用户名:" prop="username">
            <el-input type="text" v-model="loginForm.username" auto-complete="off" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <el-form-item label="密码:" prop="password">
            <el-input type="password"  v-model="loginForm.password" auto-complete="off" placeholder="请输入密码"></el-input>
          </el-form-item>
          <el-form-item label="验证码:" prop="code">
            <el-input type="text" @keydown.enter.native="submitLogin" v-model="loginForm.code" auto-complete="off" placeholder="请输入验证码" style="width:150px;"></el-input>
			<img :src="verifyCode" title="点击切换验证码" style="float: right;" @click="changeverifyCode" />
          </el-form-item>
           <el-checkbox v-model="checked" class="loginRemember"></el-checkbox><span> 记住我一周</span>
		   <a href="##" style="float: right;text-decoration: none;" @click="forgotPass">忘记密码?</a>
          <div>
            <el-button @click="showRegistryDialog" style="width:45% ;margin-right: 15px">注册</el-button>
            <el-button type="primary" style="width:45% ;" @click="submitLogin"  v-loading.fullscreen.lock="fullscreenLoading">登录</el-button>
          </div>
        </el-form>
      </div>
    </el-main>
    <el-dialog title="新用户注册" :before-close="closeRegisterDialog" :visible.sync="registerDialogVisible" width="30%">
      <el-form :model="registerForm" status-icon :rules="registerRules" ref="registerForm" >
        <el-form-item label="登录用户名：" :label-width="formLabelWidth" prop="username">
            <el-input v-model="registerForm.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码：" :label-width="formLabelWidth" prop="password">
          <el-input type="password" v-model="registerForm.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="确认密码：" :label-width="formLabelWidth" prop="checkPass">
          <el-input type="password" v-model="registerForm.checkPass" autocomplete="off"></el-input>
        </el-form-item>
		<el-form-item label="手机号码：" :label-width="formLabelWidth" prop="phone">
		    <el-input v-model="registerForm.phone" autocomplete="off"></el-input>
		</el-form-item>
		<el-form-item label="邮箱：" :label-width="formLabelWidth" prop="email">
		    <el-input v-model="registerForm.email" placeholder="方便找回密码" autocomplete="off"></el-input>
		</el-form-item>
        <el-form-item label="用户头像：" :label-width="formLabelWidth">
          <el-upload
                  action="/file"
                  ref="upload"
                  list-type="picture-card"
				  accept=".jpg,.jpeg,.png,.JPG,JPEG,.PNG,.gif,.GIF"
                  :class="{disabled:uploadDisabled}"
                  :before-upload="beforeAvatarUpload"
                  :file-list="fileList"
                  :on-progress="onProgress"
                  :on-success="imgSuccess"
                  :on-error="imgError"
                  :on-remove="imgRemove"
                  >
            <i  class="el-icon-plus"></i>
            <!-- <div slot="tip" class="el-upload__tip">只能上传不超过4MB的图片(可使用默认头像！)</div> -->
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitRegisterForm('registerForm') " style="width: 100%">注册</el-button>
      </div>
    </el-dialog>
	
	<el-dialog title="重置密码" :visible.sync="resetPassVisible" width="30%">
	  <el-form :model="resetPassForm" status-icon :rules="resetPassRules" ref="resetPassForm" >
		<template v-if="resetPassForm.key">
			<el-form-item label="密码：" :label-width="formLabelWidth" prop="password">
			  <el-input type="password" v-model="resetPassForm.password" autocomplete="off"></el-input>
			</el-form-item>
			<el-form-item label="确认密码：" :label-width="formLabelWidth" prop="confirmPassword">
			  <el-input type="password" v-model="resetPassForm.confirmPassword" autocomplete="off"></el-input>
			</el-form-item>
		</template>
		<template v-else>
			<el-form-item label="用户名：" :label-width="formLabelWidth" prop="username">
				<el-input v-model="resetPassForm.username" placeholder="请输入用户名" autocomplete="off"></el-input>
			</el-form-item>		
			<el-form-item label="邮箱：" :label-width="formLabelWidth" prop="email">
				<el-input v-model="resetPassForm.email" placeholder="注册时的邮箱" autocomplete="off"></el-input>
			</el-form-item>			
		</template>
	  </el-form>
	  <div slot="footer" class="dialog-footer">
	    <el-button type="primary" @click="doResetPass('resetPassForm') " style="width: 100%">{{resetPassForm.key ? '重置密码' : '验证邮箱'}}</el-button>
	  </div>
	</el-dialog>
	
  </el-container>


</template>

<script>
import {login,userRegister,checkEmail,resetPassword} from '@/api/auth.js'
import {checkUsername} from '@/api/user.js'

  export default {
    name: "Login",
    data(){
      var validateUsername = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入用户名'));
        }
        //检查用户名是否重复
        checkUsername({username:value}).then(resp=>{
            if (resp!=0){
              callback(new Error('该用户名已被注册'));
            }
            else {
              callback();
            }
          })

      };
      var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else {
          if (this.registerForm.checkPass !== '') {
            this.$refs.registerForm.validateField('checkPass');
          }
          callback();
        }
      };
      var validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.registerForm.password) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };
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
        loginForm:{
           username:'qxf',
           password:123456,
           code:''
        },
        verifyCode:'/auth/verifyCode',
        checked:true,
        rules: {
          username:[{required:true,message:'请输入用户名',trigger:'blur'}],
          password:[{required:true,message: '请输入密码',trigger:'blur'}],
          code:[{required:true,message: '请输入验证码',trigger:'blur'}]
        },
        fullscreenLoading:false,
        //注册表单相关
        registerDialogVisible:false,
        formLabelWidth: '120px',
        registerForm:{
          username:'',
          password:'',
          checkPass:'',
		  phone: '',
		  email: '',
          avatar:'',
        },
        registerRules: {
          username: [
            { validator: validateUsername, trigger: 'blur' }
          ],
          password: [
            { validator: validatePass, trigger: 'blur' }
          ],
          checkPass: [
            { validator: validatePass2, trigger: 'blur' }
          ],
		  phone: [{ validator: validatePhone, trigger: "change" }],
		  email: [
		    { required: true, message: '请输入邮箱地址' },
		    { type: 'email', message: '请输入正确的邮箱地址',trigger: 'blur' }
		  ],
        },
		// 找回密码相关
		resetPassVisible: false,
		resetPassForm:{
		  username: '',
		  email: '',
		  password:'',
		  confirmPassword:'',
		  key: '',
		},
		resetPassRules: {
		  username:[{required:true,message:'请输入用户名',trigger:'blur'}],	
		  email: [
		    { required: true, message: '请输入邮箱地址' },
		    { type: 'email', message: '请输入正确的邮箱地址',trigger: 'blur' }
		  ],
		},
		
        uploadDisabled:false,
        //上传的文件信息列表
        fileList:[],
      };
    },
	created() {
		let url = window.location.href;
		if(url.includes('key')){
			// 解析url，获取key
			// 截取key的字符串,形如："123456#/"
			url = url.substr(url.lastIndexOf('=')+1);
			// 去掉最后的 #/，剩下：123456
			this.resetPassForm.key = url.substr(0,url.length-2);
			this.forgotPass();
		}else{
			this.resetPassVisible = false;
			this.registerDialogVisible = false;
		}
	},
    methods:{
      submitLogin(){
        this.$refs.loginForm.validate((valid) => {
          if (valid) {
            this.fullscreenLoading=true;
            login(this.loginForm).then(resp=>{
              setTimeout(()=>{
                this.fullscreenLoading=false;
              },1000);
              if (resp){
				  // debugger
                //保存当前用户到vuex
                this.$store.state.currentUser=resp.data;
                //保存登录用户到sessionStorage中
                window.sessionStorage.setItem("user",JSON.stringify(resp.data));
                let path=this.$route.query.redirect;
                this.$router.replace((path=='/'||path==undefined)?"/chatroom":path);
              }else {
                this.changeverifyCode();
              }
            })
          } else {
            this.$message.error("用户名,密码和验证码都不能为空！");
            return false;
          }
        });
      },
      changeverifyCode(){
        this.verifyCode="/auth/verifyCode?time="+new Date();
      },
      gotoAdminLogin(){
        this.$router.replace("/adminlogin");
      },
      showRegistryDialog(){
        this.registerDialogVisible=true;
      },
      /**
       *       图片上传的方法
       */
      //上传前
      beforeAvatarUpload(file) {
      },
      // 上传中
      onProgress(event, file, fileList){
        this.uploadDisabled = true;
      },
      // 图片上传成功
      imgSuccess(response, file, fileList) {
        this.uploadDisabled = true;
        this.registerForm.avatar=response;//将返回的路径给表单的头像属性
        console.log("图片url为："+this.registerForm.avatar);
      },
      // 图片上传失败
      imgError(err, file, fileList){
        this.$message.error("上传失败");
        this.uploadDisabled = false;
      },
      //移除图片
      imgRemove(file,fileList){
        this.uploadDisabled = false;
      },
      closeRegisterDialog(done){
        this.registerForm={//清空表单
          username:'',
          password:'',
          checkPass:'',
          avatar:'',
        };
        //this.$refs.upload.clearFiles();//清除上传组件的图片
        done();//关闭对话框
      },
      //提交注册操作
      submitRegisterForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            userRegister(this.registerForm).then(resp=>{
              if (resp){
                this.registerDialogVisible=false;
				this.$message.success("注册成功，请登录！");
                location.reload();//刷新页面，清空注册界面的上传组件中的图片
              }
            }).catch(e => {
				this.$message.error("注册失败！");
			})
          } else {
            this.$message.error("请正确填写信息！");
            console.log('error submit!!');
            return false;
          }
        });
      },
	  
	  // 重置密码相关
	  forgotPass(){
		this.resetPassVisible = true  
	  },
	  doResetPass(formName){
		  const that = this;
		  if(that.resetPassForm.key){
			// 校验两次密码是否一致
			if(!that.resetPassForm.password){
				that.$message.error("密码不能为空！");
				return;
			}
			if(!that.resetPassForm.confirmPassword){
				that.$message.error("确认密码不能为空！");
				return;
			}
			if(that.resetPassForm.password != that.resetPassForm.confirmPassword){
				that.$message.error("两次密码输入不一致！");
				return;
			}
			// 重置密码 
			resetPassword(that.resetPassForm).then(res => {
				debugger
				that.resetPassVisible = false;
				that.$message.success("密码重置成功，请登录！");
				window.location.href = 'http://localhost:8080';
				// location.reload();
			}).catch(e => {
				that.$message.error("密码重置失败！");
			})
		  }else{
			// 验证邮箱
			that.$refs[formName].validate((valid) => {
				if(valid){
					checkEmail(that.resetPassForm).then(res => {
						// that.$message.success(res.msg);
						that.resetPassVisible = false;
					}).catch(e => {
						that.$message.error("用户名或邮箱不正确！");
					})
				}
			});
		  }
	  },
	  
    }
  }
</script>


<style>
  .disabled .el-upload--picture-card{
    display: none;
  }
  .loginContainer{
    width: 350px;
    margin: 100px auto;
    border-radius:15px ;
    border: 1px solid #eaeaea;
    /*添加阴影 h-shadow(水平阴影位置)，v-shadow(垂直阴影位置)，blur(阴影大小)，color(颜色)*/
    box-shadow: 10px 10px 35px #cac6c6;
    background: #fff;
    /*background-clip——规定背景的绘制区域*/
    /*border-box：背景被裁剪到边框盒*/
    /*padding-box：背景被裁剪到内边距框*/
    /*content-box：背景被裁剪到内容框*/
    background-clip: padding-box;
    padding: 25px 35px 25px 35px;
  }
  .loginTitle{
    margin: 10px auto 30px auto;
    text-align: center;
    color:#505458;
  }
  .loginRemember{
    margin: 5px auto 35px 80px;
  }
  /*.el-form-item__content{*/
  /* display: flex;*/
  /*  align-items: center*/
  /*}*/
</style>
