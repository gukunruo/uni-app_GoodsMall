import type { PageResult, GoodsItem } from './global'

/** 热门推荐-子类选项 */
export type SubTypeItem = {
  /** 子类id */
  id: string
  /** 子类标题 */
  title: string
  /** 子类对应的商品集合 使用类型的嵌套PageResult<GoodsItem> */
  goodsItems: PageResult<GoodsItem>
}

/** 热门推荐 api请求到的数据 */
export type HotResult = {
  /** id信息 */
  id: string
  /** 活动图片 */
  bannerPicture: string
  /** 活动标题 */
  title: string
  /** 子类选项 */
  subTypes: SubTypeItem[]
}
