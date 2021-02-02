import request from '@/utils/request'

export function getOfflineMsg(data) {
  return request({
    url: '/message/detail/offline',
    method: 'get',
    params: data
  })
}

export function updateMsgIsRead() {
  return request({
    url: '/message/update',
    method: 'post'
  })
}