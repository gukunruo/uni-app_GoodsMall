import { http } from '@/utils/http'
import type { GoodsResult } from '@/types/goods'

// 同样是请求拿到响应对象的result属性的数据 ==> 对应商品信息
export const getGoodsByIdAPI = (id: string) => {
  return http<GoodsResult>({
    method: 'GET',
    url: '/goods',
    data: { id },
  })
}
