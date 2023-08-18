import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AddressItem } from '@/types/address'

export const useAddressStore = defineStore('address', () => {
  // 选择的地址
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
