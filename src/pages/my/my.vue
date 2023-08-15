<script setup lang="ts">
import { useMemberStore } from '@/stores'
// 导入请求拦截器实用工具 和我们vue3中二次封装的axios[request]是相同的
import { http } from '@/utils/http'

const memberStore = useMemberStore()
// 测试拦截器函数 await async 异步回调
const getData = async () => {
  // 发送请求，需要传入我们需要的类型去匹配泛型【使用我们封装的request请求api 类似于二次封装的axios】
  const res = await http<string[]>({
    method: `GET`,
    url: `/home/banner`,
    header: {},
  })
}
</script>

<template>
  <view class="my">
    <view>会员信息：{{ memberStore.profile }}</view>
    <button
      @tap="
        memberStore.setProfile({
          nickname: '好物商城',
          token: 'ggbone',
        })
      "
      size="mini"
      plain
      type="primary"
    >
      保存用户信息
    </button>
    <button @tap="memberStore.clearProfile()" size="mini" plain type="warn">清理用户信息</button>
    <button @tap="getData" size="mini" type="default">test request</button>
  </view>
</template>

<style lang="scss">
//
</style>
