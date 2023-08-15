// 主页相关的接口
// 引入二次封装的request请求
import { http } from '@/utils/http'
// 引入ts类型
import type { BannerItem, CategoryItem, HotItem, GuessItem } from '@/types/home'
// 引入通用ts类型
import type { PageResult, PageParams } from '@/types/global'
/**
 * 首页-广告区域-小程序
 * @param distributionSite 广告区域展示位置（投放位置 投放位置，1为首页，2为分类商品页） 默认是1
 */
export const getHomeBannerAPI = (distributionSite = 1) => {
  // 传入的BannerItem类型就是泛型中result数组中对象的类型
  return http<BannerItem[]>({
    method: 'GET',
    url: '/home/banner',
    // get请求的参数【可查看api】
    data: {
      distributionSite,
    },
  })
}

// 首页——前台分类-小程序
export const getHomeCategoryAPI = () => {
  return http<CategoryItem[]>({
    method: 'GET',
    url: '/home/category/mutli',
  })
}

// 首页-热门推荐-小程序
export const getHomeHotAPI = () => {
  return http<HotItem[]>({
    method: 'GET',
    url: '/home/hot/mutli',
  })
}

// 首页-猜你喜欢-小程序 传入请求数据data PageParams类型就包含我们需要的page和pageSize
export const getHomeGoodsGuessLikeAPI = (data?: PageParams) => {
  // 这里的泛型 用于对类型进行嵌套 将GuessItem类型传入PageResult的泛型参数组成新的类型
  // 然后将新组成的ts类型传给封装的http请求中的泛型参数
  return http<PageResult<GuessItem>>({
    method: 'GET',
    url: '/home/goods/guessLike',
    // request请求中的请求参数就是 data
    data,
  })
}
