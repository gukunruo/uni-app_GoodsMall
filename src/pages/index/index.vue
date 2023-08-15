<script setup lang="ts">
// 引入顶部客制化导航栏组件
import CustomNavBar from './components/CustomNavBar.vue'
</script>

<template>
  <!-- 此时与默认导航栏冲突，需要在pages.json中进行配置 -->
  <CustomNavBar />
  <!-- 引入自动全局引入的轮播图组件
    注意：自动导入的组件没有定义ts类型，需要我们进行类型声明 -->
  <HwSwiper />
  <view class="index"></view>
</template>

<style lang="scss">
//
</style>
