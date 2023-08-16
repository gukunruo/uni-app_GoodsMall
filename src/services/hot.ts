import { http } from '@/utils/http'
import type { PageParams } from '@/types/global'
import type { HotResult } from '@/types/hot.d.ts'

// &类型扩展
type HotParams = PageParams & { subType?: string }
/**
 * 通用热门推荐类型
 * @param url 请求地址 因为我们四个地址是不同的 所以我们对请求的地址进行自定义传入
 * @param data 请求参数 data使用通用ts类型
 */
export const getHotRecommendAPI = (url: string, data?: HotParams) => {
  return http<HotResult>({
    method: 'GET',
    // url自定义传入
    url,
    data,
  })
}
