// 定义全局引入组件的ts类型
// 引入需要全局引入的组件 为其获取ts类型
import HwSwiper from '@/components/HwSwiper.vue'
// 引入猜你喜欢组件
import HwGuess from '@/components/HwGuess.vue'

// Volar官网固定写法
declare module 'vue' {
  export interface GlobalComponents {
    // js中的typeof用于获取基本数据的类型 ts中的typeof可以在 【类型上下文】中进行类型查询
    // 这里的typeof可以拿到某个js文件对应的ts类型 作为对应组件的类型声明
    HwSwiper: typeof HwSwiper
    HwGuess: typeof HwGuess
  }
}

// HwGuess、HwSwiper组件的实例类型 在ref拿到组件实例时使用
// 使用InstanceType拿到实例的类型【里面传入的是组件类型，不是实例类型】
export type HwGuessInstance = InstanceType<typeof HwGuess>
export type HwSwiperInstance = InstanceType<typeof HwSwiper>
