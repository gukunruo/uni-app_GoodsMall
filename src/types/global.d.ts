// 这里放通用的数据类型
/** 通用分页结果类型【可复用在猜你喜欢和订单列表进行复用】 */
export type PageResult<T> = {
  // 列表数据 其中的item用泛型来定义 在不同组件中使用不同的类型
  items: T[]
  /** 总条数 */
  counts: number
  /** 当前页数 */
  page: number
  /** 总页数 */
  pages: number
  /** 每页条数 */
  pageSize: number
}
/** 通用分页参数类型 */
export type PageParams = {
  /** 页码：默认值为 1 */
  page?: number
  /** 页大小：默认值为 10 */
  pageSize?: number
}
