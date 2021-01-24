import request from '@/utils/request'

export function getFriendList() {
  return request({
    url: '/friend/list',
    method: 'get'
  })
}