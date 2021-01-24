import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import router from '../router'

// create an axios instance
const service = axios.create({
  baseURL: '', // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 60000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
	// 在这里可以配置token等共同信息，这里暂时用不上  
    // config.headers['Authorization'] = getToken()
    // config.headers['Content-Type'] = 'application/json'
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
	  // 后端返回的提示信息
	  if(response.data && response.data.msg){
		  if (response.data.code == 200){
		    Message.success({message:response.data.msg});
		  }else if(response.data.code == 500){
			Message.error({message:response.data.msg}); 
		  }
	  }
    return response.data
  },
  error => {
	  debugger
	  console.log('err' + error) // for debug
	  // 请求要求用户的身份认证
	  if (error.response.status==401){
		  Message.error({message:'尚未登录，请登录'});
		  router.replace("/");//跳转到登陆页
	   }
    return error; 
  }
)

export default service
