// 主页相关的接口
// 引入二次封装的request请求
import { http } from '@/utils/http'
// 引入ts类型
import type { BannerItem } from '@/types/home'

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
