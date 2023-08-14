import { defineStore } from 'pinia'
import { ref } from 'vue'

// 定义 useMemberStore 用来管理会员信息 使用了组合式写法
export const useMemberStore = defineStore(
  'member',
  () => {
    // 会员信息
    const profile = ref<any>()

    // 保存会员信息，登录时使用
    const setProfile = (val: any) => {
      profile.value = val
    }

    // 清理会员信息，退出时使用
    const clearProfile = () => {
      profile.value = undefined
    }

    // 记得 return
    return {
      profile,
      setProfile,
      clearProfile,
    }
  },
  // TODO: 持久化
  {
    // persist: true, 网页端的配置 默认使用localStorage
    // 调整为兼容多端的API[不能单写一个true] 浏览器持久化存储数据的配置
    persist: {
      storage: {
        // 调用setter和getter
        setItem(key, value) {
          // 调用uni[wx]的持久化存储的api
          uni.setStorageSync(key, value)
        },
        getItem(key) {
          return uni.getStorageSync(key)
        },
      },
    },
  },
)
