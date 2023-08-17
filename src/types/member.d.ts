/** 通用的用户信息 */
type BaseProfile = {
  /** 用户ID */
  id: number
  /** 头像  */
  avatar: string
  /** 账户名  */
  account: string
  /** 昵称 */
  nickname?: string
}

// 小程序登录 登录用户信息
export type LoginResult = BaseProfile & {
  // 手机号
  mobile: string
  // 登录凭证
  token: string
}

// 性别
export type Gender = '男' | '女'
// 个人信息 获取的用户详情信息
export type ProfileDetail = BaseProfile & {
  // 性别
  gender?: Gender
  // 生日
  birthday?: string
  // 省市区
  fullLocation?: string
  // 职业
  profession?: string
}

// 个人信息 PUT修改用户数据请求体参数 Pick<要拾取的类型，要拾取的属性1，要拾取的属性2>
// Pick方法能从给定的类型中选择指定的属性，创建一个新的类型
export type ProfileParams = Pick<
  ProfileDetail,
  'nickname' | 'gender' | 'birthday' | 'profession'
  // 这里的 | 是ts的联合类型【字段的联合表示并集，对象的联合表示其中属性的交集】
> & {
  /** 省份编码 */
  provinceCode?: string
  /** 城市编码 */
  cityCode?: string
  /** 区/县编码 */
  countyCode?: string
}
