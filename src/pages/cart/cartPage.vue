<script setup lang="ts">
import CartMain from './components/CartMain.vue'
</script>

<!--
  页面版的 购物车 用在商品详情页goods.vue的跳转
  由于是页面版 记得在pages.json中配置 -->
<template>
  <!-- 适配底部安全区 -->
  <CartMain safe-area-inset-bottom />
</template>

<style lang="scss">
page {
  height: 100%;
}
</style>
