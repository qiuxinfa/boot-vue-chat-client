import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/auth/logout',
    method: 'get'
  })
}

export function userRegister(data) {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
}

export function checkEmail(data) {
  return request({
    url: '/auth/checkEmail',
    method: 'post',
    data
  })
}

export function resetPassword(data) {
  return request({
    url: '/auth/resetPassword',
    method: 'post',
    data
  })
}