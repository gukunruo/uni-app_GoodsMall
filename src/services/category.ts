import { http } from '@/utils/http'
import type { CategoryTopItem } from '@/types/category'

// 分类列表[包含一二级分类数据]-小程序 拿到的是请求响应数据的result数据
export const getCategoryTopAPI = () => {
  return http<CategoryTopItem[]>({
    method: 'GET',
    url: '/category/top',
  })
}
