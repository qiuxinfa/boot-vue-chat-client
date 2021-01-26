import request from '@/utils/request'

export function getFriendList() {
  return request({
    url: '/friend/list',
    method: 'get'
  })
}

export function getNewFriendList() {
  return request({
    url: '/friend/new/list',
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

export function agree(data) {
  return request({
    url: '/friend/agree',
    method: 'post',
	data:data
  })
}

export function refuse(data) {
  return request({
    url: '/friend/refuse',
    method: 'post',
	data:data
  })
}