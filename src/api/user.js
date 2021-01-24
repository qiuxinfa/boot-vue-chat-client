import request from '@/utils/request'

export function getUserInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

export function getUserList(data) {
  return request({
    url: '/user/list',
    method: 'get',
    params: data
  })
}

export function checkUsername(data) {
	return request({
	  url: 'user/checkUsername',
	  method: 'get',
	  params: data
	})
}