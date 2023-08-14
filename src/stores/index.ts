import { createPinia } from 'pinia'
// 引入pinia的持久化存储插件 用于在浏览器中持久化存储pinia状态
// 插件默认使用localStorage 实现持久化 引入之后需要在配置中进行配置修改为uni.setStorageSync
import persist from 'pinia-plugin-persistedstate'

// 创建 pinia 实例
const pinia = createPinia()
// 使用持久化存储插件
pinia.use(persist)

// 默认导出，给 main.ts 使用
export default pinia

// 模块统一导出
export * from './modules/member'
