// 引入通用商品类型
import type { GoodsItem } from './global'

// 一级分类项
export type CategoryTopItem = {
  // 二级分类集合[ 右侧二级分类项 ]
  children: CategoryChildItem[]
  // 一级分类id、名称、图片
  id: string
  name: string
  picture: string
  // 一级分类图片集[ 一级分类图片项 ]
  imageBanners: string[]
}

// 二级分类项
export type CategoryChildItem = {
  // 二级分类id
  id: string
  // 二级分类 商品集合[ 商品项 ]
  goods: GoodsItem[]
  // 二级分类名称
  name: string
  // 二级分类图片
  picture: string
}
