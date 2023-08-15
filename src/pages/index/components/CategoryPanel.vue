<script setup lang="ts">
// 引入ts类型
import type { CategoryItem } from '@/types/home.d.ts'

defineProps<{
  list: CategoryItem[]
}>()
</script>

<template>
  <!-- 导航栏 前台分类 -->
  <view class="category">
    <!-- 前台分类的每一项 navigator页面跳转 类似HTML中的<a>组件 -->
    <navigator
      class="category-item"
      hover-class="none"
      url="/pages/index/index"
      v-for="item in list"
      :key="item.id"
    >
      <image class="icon" :src="item.icon"></image>
      <text class="text">{{ item.name }}</text>
    </navigator>
  </view>
</template>

<style lang="scss">
/* @符号用于表示一种指令 @import: 用于导入其他 SCSS 文件到当前文件，实现代码分离和模块化 */
@import '../styles/category.scss';
</style>
