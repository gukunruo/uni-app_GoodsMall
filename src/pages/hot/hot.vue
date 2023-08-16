<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
// 引入api和ts类型
import { getHotRecommendAPI } from '@/services/hot'
import type { SubTypeItem } from '@/types/hot'
// 热门推荐页 标题和url
const hotMap = [
  { type: '1', title: '特惠推荐', url: '/hot/preference' },
  { type: '2', title: '爆款推荐', url: '/hot/inVogue' },
  { type: '3', title: '一站买全', url: '/hot/oneStop' },
  { type: '4', title: '新鲜好物', url: '/hot/new' },
]

// defineProps作为组件接收父组件传来的数据 作为页面的话拿到的是页面传来的参数
// uniapp 获取页面路由参数 使用defineProps的ts语法
const query = defineProps<{
  type: string
}>()
// 拿到四种推荐页中匹配的一个
const currHotMap = hotMap.find((hot) => hot.type === query.type)
// 动态设置标题
uni.setNavigationBarTitle({ title: currHotMap!.title })

// 推荐封面图
const bannerPicture = ref('')
// 推荐导航选项二选一 合并类型SubTypeItem与finish字段
const subTypes = ref<(SubTypeItem & { finish?: boolean })[]>([])
// 高亮的下标
const activeIndex = ref(0)
// 获取热门推荐数据
const getHotRecommendData = async () => {
  const res = await getHotRecommendAPI(currHotMap!.url, {
    // 技巧：环境变量，开发环境，修改初始页面方便测试分页结束
    page: import.meta.env.DEV ? 30 : 1,
    pageSize: 10,
  })
  console.log(res.result)
  bannerPicture.value = res.result.bannerPicture
  subTypes.value = res.result.subTypes
}

// 页面加载时调用
onLoad(() => {
  getHotRecommendData()
})

// 触底刷新
const onScrollToLower = async () => {
  // 获取当前推荐导航选项 这是一个浅拷贝 拿到了subType.value[xxx]的引用地址
  const currSubType = subTypes.value[activeIndex.value]
  // console.log(currSubType) 浅拷贝
  // 判断当前页码小于总页码
  if (currSubType.goodsItems.page < currSubType.goodsItems.pages) {
    // 当前页码累加
    currSubType.goodsItems.page++
  } else {
    currSubType.finish = true
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
    // 没有数据就返回 不再执行后面发送请求
  }
  // 发送请求追加数据
  const res = await getHotRecommendAPI(currHotMap!.url, {
    // 传入currSubType.id 拿到当前导航类型下的goodsItems的数据
    subType: currSubType.id,
    page: currSubType.goodsItems.page,
    pageSize: currSubType.goodsItems.pageSize,
  })
  // 拿到新的数据
  const newSubType = res.result.subTypes[activeIndex.value]
  // 追加数据
  currSubType.goodsItems.items.push(...newSubType.goodsItems.items)
}
</script>

<template>
  <view class="viewport">
    <!-- 推荐封面图 -->
    <view class="cover">
      <!-- mode 14种图片裁剪、缩放的模式 widthFix：宽度不变，高度自动变化，保持原图宽高比不变 -->
      <image mode="widthFix" :src="bannerPicture"></image>
    </view>
    <!-- 推荐导航选项 -->
    <view class="tabs">
      <text
        v-for="(item, index) in subTypes"
        :key="item.id"
        class="text"
        :class="{ active: index === activeIndex }"
        @tap="activeIndex = index"
      >
        {{ item.title }}
      </text>
    </view>
    <!-- 推荐列表 遍历的几个列表只显示activeIndex === index的一个 -->
    <scroll-view
      enable-back-to-top
      v-for="(item, index) in subTypes"
      :key="item.id"
      v-show="activeIndex === index"
      scroll-y
      class="scroll-view"
      @scrolltolower="onScrollToLower"
    >
      <view class="goods">
        <navigator
          hover-class="none"
          class="navigator"
          v-for="goods in item.goodsItems.items"
          :key="goods.id"
          :url="`/pages/goods/goods?id=${goods.id}`"
        >
          <image class="thumb" :src="goods.picture"></image>
          <view class="name ellipsis">{{ goods.name }}}</view>
          <view class="price">
            <text class="symbol">¥</text>
            <text class="number">{{ goods.price }}}</text>
          </view>
        </navigator>
      </view>
      <view class="loading-text">
        {{ item.finish ? '没有更多数据了~' : '正在加载...' }}
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss">
page {
  height: 100%;
  background-color: #f4f4f4;
}
.viewport {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 180rpx 0 0;
  position: relative;
}
.cover {
  width: 750rpx;
  height: 225rpx;
  border-radius: 0 0 40rpx 40rpx;
  overflow: hidden;
  position: absolute;
  left: 0;
  top: 0;
}
.scroll-view {
  flex: 1;
}
.tabs {
  display: flex;
  justify-content: space-evenly;
  height: 100rpx;
  line-height: 90rpx;
  margin: 0 20rpx;
  font-size: 28rpx;
  border-radius: 10rpx;
  box-shadow: 0 4rpx 5rpx rgba(200, 200, 200, 0.3);
  color: #333;
  background-color: #fff;
  position: relative;
  z-index: 9;
  .text {
    margin: 0 20rpx;
    position: relative;
  }
  .active {
    &::after {
      content: '';
      width: 40rpx;
      height: 4rpx;
      transform: translate(-50%);
      background-color: #27ba9b;
      position: absolute;
      left: 50%;
      bottom: 24rpx;
    }
  }
}
.goods {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0 20rpx 20rpx;
  .navigator {
    width: 345rpx;
    padding: 20rpx;
    margin-top: 20rpx;
    border-radius: 10rpx;
    background-color: #fff;
  }
  .thumb {
    width: 305rpx;
    height: 305rpx;
  }
  .name {
    height: 88rpx;
    font-size: 26rpx;
  }
  .price {
    line-height: 1;
    color: #cf4444;
    font-size: 30rpx;
  }
  .symbol {
    font-size: 70%;
  }
  .decimal {
    font-size: 70%;
  }
}

.loading-text {
  text-align: center;
  font-size: 28rpx;
  color: #666;
  padding: 20rpx 0 50rpx;
}
</style>
