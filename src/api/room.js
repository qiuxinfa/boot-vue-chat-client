import request from '@/utils/request'

export function getRoomList() {
  return request({
    url: '/room/list',
    method: 'get'
  })
}