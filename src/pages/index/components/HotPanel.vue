<script setup lang="ts">
// 引入ts类型
import type { HotItem } from '@/types/home.d.ts'

defineProps<{
  list: HotItem[]
}>()
</script>

<template>
  <!-- 推荐专区 -->
  <view class="panel hot">
    <view class="item" v-for="item in list" :key="item.id">
      <view class="title">
        <!-- 推荐分区标题 -->
        <text class="title-text">{{ item.title }}</text>
        <!-- 标题描述信息 -->
        <text class="title-desc">{{ item.alt }}</text>
      </view>
      <!-- navigator链接组件a 跳转时传入当前产品的类型 这里的类型用数字表示 -->
      <navigator hover-class="none" :url="`/pages/hot/hot?type=${item.type}`" class="cards">
        <image
          v-for="src in item.pictures"
          :key="src"
          class="image"
          mode="aspectFit"
          :src="src"
        ></image>
      </navigator>
    </view>
  </view>
</template>

<style lang="scss">
@import '../styles/hot.scss';
</style>
