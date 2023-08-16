import type { GoodsItem } from './global' // 引入通用商品类型

/** 首页-广告区域数据类型 */
export type BannerItem = {
  /** 跳转链接 */
  hrefUrl: string
  /** id */
  id: string
  /** 图片链接 */
  imgUrl: string
  /** 跳转类型 */
  type: number
}
/** 首页-前台类目数据类型 */
export type CategoryItem = {
  /** 图标路径 */
  icon: string
  /** id */
  id: string
  /** 分类名称 */
  name: string
}
/** 首页-热门推荐数据类型 */
export type HotItem = {
  /** 说明 */
  alt: string
  /** id */
  id: string
  /** 图片集合[ 图片路径 ] */
  pictures: string[]
  /** 跳转地址 */
  target: string
  /** 标题 */
  title: string
  /** 推荐类型 */
  type: string
}

/** 猜你喜欢-商品类型
 * GuessItem放到PageResult中替代泛型形成后端返回的类型 然后用于猜你喜欢组件中 */
/* export type GuessItem = {
  desc: string
  discount: number
  id: string
  name: string
  orderNum: number
  picture: string
  price: number
} */

// 由于global.d.ts中的通用商品类型和这个一致，所以可以直接引入作为GuessItem
export type GuessItem = GoodsItem
