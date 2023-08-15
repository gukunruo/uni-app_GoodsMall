// 定义全局引入组件的ts类型
// 引入需要全局引入的组件 为其获取ts类型
import HwSwiper from '@/components/HwSwiper.vue'

// Volar官网固定写法
declare module 'vue' {
  export interface GlobalComponents {
    // js中的typeof用于获取基本数据的类型 ts中的typeof可以在 【类型上下文】中进行类型查询
    // 这里的typeof可以拿到某个js文件对应的ts类型 作为对应组件的类型声明
    HwSwiper: typeof HwSwiper
  }
}

// 组件实例类型
