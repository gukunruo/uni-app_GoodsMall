import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AddressItem } from '@/types/address'

// 使用场景：点击地址管理address.vue的某个地址进行选择 然后跳转会订单界面确定为该地址
export const useAddressStore = defineStore('address', () => {
  // 选择的地址[用于接收订单管理修改的地址]
  const selectedAddress = ref<AddressItem>()

  // 修改选择的地址
  const changeSelectedAddress = (val: AddressItem) => {
    selectedAddress.value = val
  }

  return {
    selectedAddress,
    changeSelectedAddress,
  }
})
