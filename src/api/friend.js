import request from '@/utils/request'

export function getFriendList() {
  return request({
    url: '/friend/list',
    method: 'get'
  })
}

export function addFriend(data) {
  return request({
    url: '/friend/add',
    method: 'post',
	data:data
  })
}