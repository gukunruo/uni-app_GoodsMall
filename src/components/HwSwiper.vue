<script setup lang="ts">
import { ref } from 'vue'

// 定义激活时的下标
const activeIndex = ref(0)

// 绑定滑块index[从0开始]改变的@change事件 当 swiper 下标发生变化时触发
// 在我们安装的@uni-helper/uni-app-types中有事件对应的ts类型 对应Swiper组件的change事件
const onChange: UniHelper.SwiperOnChange = (event) => {
  // 在event.detail.current中能够拿到当前滑块的index
  activeIndex.value = event.detail!.current
  // ts中的"!"为非空断言[从值域中排除null和undefined]，主观上排除掉空值情况
}
</script>
<!-- 这是一个封装的轮播图组件 需要在pages.json中easycom配置自动引入全局组件 -->
<template>
  <!-- 轮播图 -->
  <view class="carousel">
    <!-- 图片区域
      swiper @change：current[当前所在滑块的 index]改变时会触发 change 事件 -->
    <swiper :circular="true" :autoplay="false" :interval="3000" @change="onChange">
      <!-- 图片项 -->
      <swiper-item>
        <navigator url="/pages/index/index" hover-class="none" class="navigator">
          <image
            mode="aspectFill"
            class="image"
            src="https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/uploads/slider_1.jpg"
          ></image>
        </navigator>
      </swiper-item>
      <swiper-item>
        <navigator url="/pages/index/index" hover-class="none" class="navigator">
          <image
            mode="aspectFill"
            class="image"
            src="https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/uploads/slider_2.jpg"
          ></image>
        </navigator>
      </swiper-item>
      <swiper-item>
        <navigator url="/pages/index/index" hover-class="none" class="navigator">
          <image
            mode="aspectFill"
            class="image"
            src="https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/uploads/slider_3.jpg"
          ></image>
        </navigator>
      </swiper-item>
    </swiper>
    <!-- 指示点 -->
    <view class="indicator">
      <!-- text组件模拟指示点
        active是自定义高亮样式【当循环下标index和activeIndex激活时的下标相等时激活】 -->
      <text
        v-for="(item, index) in 3"
        :key="item"
        class="dot"
        :class="{ active: index === activeIndex }"
      ></text>
    </view>
  </view>
</template>

<style lang="scss">
:host {
  display: block;
  height: 280rpx;
}
/* 轮播图 */
.carousel {
  height: 100%;
  position: relative;
  overflow: hidden;
  transform: translateY(0);
  background-color: #efefef;
  .indicator {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 16rpx;
    display: flex;
    justify-content: center;
    .dot {
      width: 30rpx;
      height: 6rpx;
      margin: 0 8rpx;
      border-radius: 6rpx;
      background-color: rgba(255, 255, 255, 0.4);
    }
    .active {
      background-color: #fff;
    }
  }
  .navigator,
  .image {
    width: 100%;
    height: 100%;
  }
}
</style>
