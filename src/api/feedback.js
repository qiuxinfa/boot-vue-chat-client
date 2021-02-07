import request from '@/utils/request'

export function sendFeedback(data) {
  return request({
    url: '/feedback/send',
    method: 'post',
    data
  })
}