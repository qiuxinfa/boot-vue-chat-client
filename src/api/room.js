import request from '@/utils/request'

export function getRoomList() {
  return request({
    url: '/room/list',
    method: 'get'
  })
}

export function createRoom(data) {
  return request({
    url: '/room/add',
    method: 'post',
	data:data
  })
}