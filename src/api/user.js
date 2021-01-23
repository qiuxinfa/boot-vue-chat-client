import request from '@/utils/request'

export function getUserInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function getUserList(data) {
  return request({
    url: '/user/list',
    method: 'get',
    params: data
  })
}
