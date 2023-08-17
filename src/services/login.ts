import { http } from '@/utils/http'
import type { LoginResult } from '@/types/member'

type LoginWxMinParams = {
  code: string
  // 加密数据
  encryptedData?: string
  // 加密算法初始向量
  iv?: string
}
/**
 * 小程序登录
 * @param data 请求参数
 */
export const postLoginWxMinAPI = (data: LoginWxMinParams) => {
  return http<LoginResult>({
    method: 'POST',
    url: '/login/wxMin',
    data,
  })
}
/**
 * 小程序登录_内测版
 * @param phoneNumber 模拟手机号码【因为手机号登录不对个人用户开放】
 */
export const postLoginWxMinSimpleAPI = (phoneNumber: string) => {
  return http<LoginResult>({
    method: 'POST',
    url: '/login/wxMin/simple',
    data: {
      phoneNumber,
    },
  })
}

// 登录参数 账号密码
type LoginParams = {
  account: string
  password: string
}
/**
 * 小程序登录_用户名+密码
 * @param data 请求参数
 */
export const postLoginAPI = (data: LoginParams) => {
  return http<LoginResult>({
    method: 'POST',
    url: '/login',
    data,
  })
}
