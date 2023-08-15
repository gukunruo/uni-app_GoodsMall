/*
  uni.addInterceptor用于添加拦截器 其中传递两个参数
    参数1：拦截的api名称 request、uploadFile
    参数2：配置对象，其中可选五个回调函数，都不必填
      invoke：拦截前触发  returnValue：方法调用后触发，处理返回值
      success、fail、complete：分别是成功、失败、完成回调拦截

  添加拦截器：
    拦截request请求
    拦截uploadFile文件上传

  TODO：
    1、非 http 开头需拼接地址
    2、请求超时
    3、添加小程序端请求头标识
    4、添加 token 请求头标识
*/
import { useMemberStore } from '@/stores'
// 设置请求接收方基础路径
const baseURL = 'https://pcapi-xiaotuxian-front-devtest.itheima.net'
// 实例化小仓库member.ts
const memberStore = useMemberStore()
// 设置请求拦截器【添加请求前的配置】
const httpInterceptor = {
  // 拦截前触发 options是拦截到的请求配置【类型通过悬停uni.request查看】
  invoke(options: UniApp.RequestOptions) {
    // 1、非 http 开头需拼接地址
    if (!options.url.startsWith('http')) {
      options.url = baseURL + options.url
    }
    // 2、请求超时 默认60s
    options.timeout = 10000
    // 3、添加小程序端请求头标识
    options.header = {
      // 展开请求头的配置项，然后添加新的配置项
      ...options.header,
      // 根据黑马给的接口文档的小程序请求参数提示 https://apifox.com/apidoc/shared-0e6ee326-d646-41bd-9214-29dbf47648fa/doc-1521513
      'source-client': 'miniapp', // 资源客户端设置为小程序端 app为应用端
    }
    // 4、添加token请求头标识 登录成功的信息存到member会员小仓库中，需要从其中取数据
    const token = memberStore.profile?.token //没有用户信息则不给token赋有用的信息
    // console.log(options)
    // 如果有token，将token携带给服务器
    if (token) {
      // Authorization同样在api文档中查看 token保存到Authorization【授权】中
      options.header.Authorization = token
    }
  },
}

// 添加拦截器 拦截 request 请求【类似于我们pc项目中的二次封装axios】
uni.addInterceptor('request', httpInterceptor)
// 拦截 uploadFile 请求 二者公用一个拦截器
uni.addInterceptor('uploadFile', httpInterceptor)

/*
  uni-app拦截器并不像axios拦截器那样好 uni-app对响应拦截器对ts类型支持并不友好
  所以我们利用promise自己封装响应拦截器实现带有泛型的uni-app[weixin]原生拦截器的功能

  请求函数 借鉴axios 返回一个promise
  @param  UniApp.RequestOptions
  @returns Promise
   1. 返回 Promise 对象
   2. 获取数据成功
     2.1 提取核心数据 res.data
     2.2 添加类型，支持泛型
   3. 获取数据失败
     3.1 401错误  -> 清理用户信息，跳转到登录页
     3.2 其他错误 -> 根据后端错误信息轻提示
     3.3 网络错误 -> 提示用户换网络
*/
// 根据请求到的数据res.data设置后端返回值的类型
// 先拿到code、msg基本类型，然后传来的T指定result类型
type Data<T> = {
  code: string
  msg: string
  result: T // result使用灵活的泛型，因为返回值的result为对象的数组
}
// 2.2 自己二次封装request请求 主要实现带有泛型的响应拦截器【前面请求拦截器已经实现了】
// uni-app不支持类型，给其添加泛型【泛型可以在使用时确定数据类型，请求时传入】
export const http = <T>(options: UniApp.RequestOptions) => {
  // 返回一个promise对象 传入泛型，指定返回值的大致类型
  return new Promise<Data<T>>((resolve, reject) => {
    // 包装uni.request函数【这个request请求已经添加了请求拦截器】
    uni.request({
      ...options,
      // 响应成功 request中的成功回调函数 收到开发者服务器成功返回的回调函数
      success(res) {
        // 状态码 2xx， axios 就是这样设计的
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 2.1 提取核心数据 res.data
          resolve(res.data as Data<T>)
        } else if (res.statusCode === 401) {
          // 401错误  -> 清理用户信息，跳转到登录页
          // 调用会员小仓库清除用户信息函数
          memberStore.clearProfile()
          // 跳转到登录页面
          uni.navigateTo({ url: '/pages/login/login' })
          reject(res)
        } else {
          // 其他错误 -> 根据后端错误信息轻提示 吐司组件 显示消息提示框
          uni.showToast({
            icon: 'none',
            // 同样res.data需要指定类型，然后再拿到其中对应的属性值
            title: (res.data as Data<T>).msg || '请求错误',
          })
          reject(res)
        }
      },
      // 响应失败 request中的失败回调函数 接口调用失败的回调函数
      fail(err) {
        // 轻提示
        uni.showToast({
          icon: 'none',
          title: '网络错误，换个网络试试',
        })
        reject(err)
      },
    })
  })
}
