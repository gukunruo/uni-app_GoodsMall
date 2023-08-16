<script setup lang="ts">
import { ref } from 'vue'
// 引入uni-app中的生命周期钩子
import { onLoad } from '@dcloudio/uni-app'
// 引入api
import { getHomeBannerAPI, getHomeCategoryAPI, getHomeHotAPI } from '@/services/home'
// 引入ts类型
import type { BannerItem, CategoryItem, HotItem } from '@/types/home.d.ts'
// 引入组件实例的ts类型
import type { HwGuessInstance } from '@/types/components.d.ts'
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
// 猜你喜欢组件不需要在此处封装调用 直接在组件内部调用更好 因为大部分数据复用时是相同的

// 加载时调用api
onLoad(() => {
  getHomeBannerData()
  getCategoryData()
  getHomeHotData()
})

// 拿到guess组件 guess组件没有类型校验
const guessRef = ref<HwGuessInstance>()
// 滚动栏触底函数
const onScrolltolower = () => {
  // 调用guess组件的getMore方法
  guessRef.value?.getMore()
}

// 当前下拉刷新状态 可以控制动画
const isTriggered = ref<boolean>(false)
// 自定义下拉刷新被触发
const onRefresherrefresh = async () => {
  // 开始动画
  isTriggered.value = true
  // 下拉重置猜你喜欢数据
  guessRef.value?.resetData()
  // 重新发起请求 发起多个异步请求 搭配promise.all去使用
  await Promise.all([
    getHomeBannerData(),
    getCategoryData(),
    getHomeHotData(),
    guessRef.value?.getMore(),
  ])
  // 需要我们主动关闭动画，否则动画不会消失
  isTriggered.value = false
}
</script>

<template>
  <!-- 此时与默认导航栏冲突，需要在pages.json中进行配置 -->
  <CustomNavBar />
  <!-- 设置滚动容器 添加滚动触底事件scrolltolower -->
  <scroll-view
    enable-back-to-top
    refresher-enabled
    @refresherrefresh="onRefresherrefresh"
    :refresher-triggered="isTriggered"
    @scrolltolower="onScrolltolower"
    class="scrollView"
    scroll-y
  >
    <!-- 引入自动全局引入的轮播图组件
      注意：自动导入的组件没有定义ts类型，需要我们进行类型声明 -->
    <HwSwiper :list="bannerList" />
    <!-- 下面的组件不是Hw开头的组件，需要自行引入 -->
    <CategoryPanel :list="categoryList" />
    <HotPanel :list="hotList" />
    <!-- 引入自动引入组件 猜你喜欢 -->
    <HwGuess ref="guessRef" />
  </scroll-view>
</template>

<style lang="scss">
// page相当于body节点
page {
  background-color: #f7f7f7;
  height: 100%;
  display: flex;
  flex-direction: column;
}
// 这样做是为了让顶部导航栏不固定在最上方，滚动栏进行滚动
.scrollView {
  flex: 1;
}
</style>
