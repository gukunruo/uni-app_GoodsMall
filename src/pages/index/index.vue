<script setup lang="ts">
import { ref } from 'vue'
// 引入uni-app中的生命周期钩子
import { onLoad } from '@dcloudio/uni-app'
// 引入api
import { getHomeBannerAPI, getHomeCategoryAPI, getHomeHotAPI } from '@/services/home'
// 引入ts类型
import type { BannerItem, CategoryItem, HotItem } from '@/types/home.d.ts'
// 引入顶部客制化导航栏组件
import CustomNavBar from './components/CustomNavBar.vue'
// 引入未全局引入的组件
import CategoryPanel from './components/CategoryPanel.vue'
import HotPanel from './components/HotPanel.vue'

// 获取轮播图数据
const bannerList = ref<BannerItem[]>([])
// 为了后期复用 封装成一个函数
const getHomeBannerData = async () => {
  const res = await getHomeBannerAPI()
  bannerList.value = res.result
}
// 获取前台分类数据
const categoryList = ref<CategoryItem[]>([])
const getCategoryData = async () => {
  const res = await getHomeCategoryAPI()
  categoryList.value = res.result
}
// 获取热门推荐数据
const hotList = ref<HotItem[]>([])
const getHomeHotData = async () => {
  const res = await getHomeHotAPI()
  hotList.value = res.result
}

// 加载时调用api
onLoad(() => {
  getHomeBannerData()
  getCategoryData()
  getHomeHotData()
})
</script>

<template>
  <!-- 此时与默认导航栏冲突，需要在pages.json中进行配置 -->
  <CustomNavBar />
  <!-- 引入自动全局引入的轮播图组件
    注意：自动导入的组件没有定义ts类型，需要我们进行类型声明 -->
  <HwSwiper :List="bannerList" />
  <!-- 下面的组件不是Hw开头的组件，需要自行引入 -->
  <CategoryPanel :list="categoryList" />
  <HotPanel :list="hotList" />
  <view class="index"></view>
</template>

<style lang="scss">
//
</style>
