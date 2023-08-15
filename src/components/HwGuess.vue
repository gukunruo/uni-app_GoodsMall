<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { GuessItem } from '@/types/home.d.ts'
import type { PageParams } from '@/types/global'
import { getHomeGoodsGuessLikeAPI } from '@/services/home'

// 定义分页参数 传入请求中获取对应页码的数据
// Required<PageParams> 替换 PageParams 用于解决 pageParams.page++ 报错问题
// 因为pageParams中的page和pageSize后有"?"可选符，在这里需要用Required改为必选[去掉了?]
const pageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
// 是否结束标记
let finish = ref<boolean>(false)
// 存储列表数据
let guessList = ref<GuessItem[]>([])
const getHomeGoodsGuessLikeData = async () => {
  // 数据加载完判断
  if (finish.value == true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据~' })
  }
  const res = await getHomeGoodsGuessLikeAPI(pageParams)
  // 这里的res.result不止包含列表的数据 还包含counts、page[当前]、pages[总页数]、pageSize
  // guessList.value = res.result.items
  // 将赋值改为追加数据
  guessList.value.push(...res.result.items)
  // 加载新数据的条件 页码累加条件
  if (pageParams.page < res.result.pages) {
    // 页码累加，再次请求时获取新的数据
    pageParams.page++ // 必须在上面改为必选 因为可选类型没数据为undefined，不能++
  } else {
    finish.value = true
  }
}

// 组件挂载完毕时调用
onMounted(() => {
  getHomeGoodsGuessLikeData()
})
// 暴露方法
defineExpose({
  getMore: getHomeGoodsGuessLikeData,
})
</script>

<template>
  <!-- 猜你喜欢 -->
  <view class="caption">
    <text class="text">猜你喜欢</text>
  </view>
  <!-- 具体商品 -->
  <view class="guess">
    <navigator
      class="guess-item"
      v-for="item in guessList"
      :key="item.id"
      :url="`/pages/goods/goods?id=${item.id}`"
    >
      <!-- 图片 -->
      <image class="image" mode="aspectFill" :src="item.picture"></image>
      <!-- 商品名称+描述 -->
      <view class="name"> {{ item.name }}</view>
      <view class="price">
        <text class="small">¥</text>
        <text>{{ item.price }}</text>
      </view>
    </navigator>
  </view>
  <!-- 加载显示文字 -->
  <view class="loading-text">{{ finish ? '没有更多数据~' : '正在加载...' }}</view>
</template>

<style lang="scss">
:host {
  display: block;
}
/* 分类标题 */
.caption {
  display: flex;
  justify-content: center;
  line-height: 1;
  padding: 36rpx 0 40rpx;
  font-size: 32rpx;
  color: #262626;

  // 猜你喜欢标题样式
  .text {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 28rpx 0 30rpx;

    // 猜你喜欢四字 前后分别添加一个图标
    &::before,
    &::after {
      content: '';
      width: 20rpx;
      height: 20rpx;
      background-image: url(@/static/images/bubble.png);
      background-size: contain;
      margin: 0 10rpx;
    }
  }
}

/* 猜你喜欢具体商品 */
.guess {
  // 需要给列表信息的容器开启浮动
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0 20rpx;
  .guess-item {
    width: 345rpx;
    padding: 24rpx 20rpx 20rpx;
    margin-bottom: 20rpx;
    border-radius: 10rpx;
    overflow: hidden;
    background-color: #fff;
  }
  .image {
    width: 304rpx;
    height: 304rpx;
  }
  .name {
    height: 75rpx;
    margin: 10rpx 0;
    font-size: 26rpx;
    color: #262626;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .price {
    line-height: 1;
    padding-top: 4rpx;
    color: #cf4444;
    font-size: 26rpx;
  }
  .small {
    font-size: 80%;
  }
}
// 加载提示文字
.loading-text {
  text-align: center;
  font-size: 28rpx;
  color: #666;
  padding: 20rpx 0;
}
</style>
