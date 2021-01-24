import request from '@/utils/request'

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

export function updateUserInfo(data) {
  return request({
    url: '/user/update',
    method: 'post',
	data:data
  })
}