<script setup lang="ts">
// 获取屏幕边界到安全区域距离 调用uni的api getSystemInfoSync
// safeAreaInsets在竖屏正方向下的安全区域插入位置。
const { safeAreaInsets } = uni.getSystemInfoSync() // 带Sync是同步api 不带是异步
// console.log(safeAreaInsets)
</script>

<template>
  <!-- 使用的都是uni-app中的组件 设置导航栏距离上部动态距离paddingTop -->
  <view class="navbar" :style="{ paddingTop: safeAreaInsets!.top + 10 + 'px' }">
    <!-- logo文字 -->
    <view class="logo">
      <image class="logo-image" src="@/static/images/优选好物.png"></image>
      <text class="logo-text">新鲜 · 亲民 · 快捷</text>
    </view>
    <!-- 搜索条 -->
    <view class="search">
      <text class="icon-search">搜索商品</text>
      <text class="icon-scan"></text>
    </view>
  </view>
</template>

<style lang="scss">
/* 自定义导航条 */
.navbar {
  background-image: url(@/static/images/navigator_bg.png);
  background-size: cover;
  position: relative;
  display: flex;
  // 设置弹性盒主轴 默认为row 从左到右 还可取row-reverse、column[-reverse]
  flex-direction: column;
  padding-top: 20px;
  .logo {
    display: flex;
    align-items: center;
    height: 64rpx;
    padding-left: 30rpx;
    .logo-image {
      width: 166rpx;
      // height: 39rpx; logo.png
      height: 100rpx;
    }
    .logo-text {
      flex: 1;
      line-height: 28rpx;
      color: #fff;
      margin: 2rpx 0 0 20rpx;
      padding-left: 20rpx;
      border-left: 1rpx solid #fff;
      font-size: 26rpx;
    }
  }
  .search {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10rpx 0 26rpx;
    height: 64rpx;
    margin: 16rpx 20rpx;
    color: #fff;
    font-size: 28rpx;
    border-radius: 32rpx;
    background-color: rgba(255, 255, 255, 0.5);
  }
  // 设置文字前的搜索icon
  .icon-search {
    // .icon-search::before
    &::before {
      margin-right: 10rpx;
    }
  }
  // 扫描二维码icon
  .icon-scan {
    font-size: 30rpx;
    padding: 15rpx;
  }
}
</style>
