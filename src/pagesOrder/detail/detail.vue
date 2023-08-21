<script setup lang="ts">
import { useGuessList } from '@/composables/HwGuess'
import { ref } from 'vue'
import { onReady, onLoad } from '@dcloudio/uni-app'
import type { OrderResult, LogisticItem } from '@/types/order'
import {
  getMemberOrderByIdAPI,
  deleteMemberOrderAPI,
  getMemberOrderCancelByIdAPI,
  getMemberOrderLogisticsByIdAPI,
  getMemberOrderConsignmentByIdAPI,
  putMemberOrderReceiptByIdAPI,
} from '@/services/order'
// 引入枚举的订单常量：订单状态 和 订单列表
import { OrderState, orderStateList } from '@/services/constants'
// 骨架屏
import PageSkeleton from './components/PageSkeleton.vue'
// 支付相关api
import { getPayMockAPI, getPayWxPayMiniPayAPI } from '@/services/pay'

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
// 猜你喜欢
const { guessRef, onScrolltolower } = useGuessList()
// 弹出层组件
const popup = ref<UniHelper.UniPopupInstance>()
// 取消原因列表
const reasonList = ref([
  '商品无货',
  '不想要了',
  '商品信息填错了',
  '地址信息填写错误',
  '商品降价',
  '其它',
])
// 订单取消原因
const reason = ref('')
// 复制订单编号
const onCopy = (id: string) => {
  // 设置系统剪贴板的内容
  uni.setClipboardData({ data: id })
}
// 获取页面参数 拿到页面跳转之前页面的id【对应订单的id】
const query = defineProps<{
  id: string
}>()

// 获取页面栈 数组中第一个元素为首页，最后一个元素为当前页面 用于判断标题左侧的导航按钮
const pages = getCurrentPages()

// 通过interface定义接口类型
interface Keyframe {
  [key: string]: string | number
}
interface AnimateOptions {
  scrollSource: string
  timeRange: number
  startScrollOffset: number
  endScrollOffset: number
}
// 页面实例的类型声明
interface PageInstance extends Page.PageInstance {
  animate: (
    selector: string,
    keyframes: Keyframe[],
    duration: number,
    options?: AnimateOptions,
  ) => void
}
// 页面栈中就包含页面的实例 可以通过页面实例去设置页面动画效果
// #ifdef MP-WEIXIN
// 获取当前页面实例，数组最后一项【使用数组方法 at 提取最后一项，索引-1】
const pageInstance = pages.at(-1) as PageInstance

// 页面渲染完毕，绑定动画效果
onReady(() => {
  // 滚动驱动的动画this.animate(selector, keyframes, duration, ScrollTimeline)
  // 动画1：导航栏背景色
  pageInstance.animate(
    // 给自定义导航栏添加动画
    '.navbar',
    // 透明变成#f8f8f8
    [{ backgroundColor: 'transparent' }, { backgroundColor: '#f8f8f8' }],
    // 动画时间
    1000,
    // 指定其他参数
    {
      // scroll-view组件的id
      scrollSource: '#scroller',
      timeRange: 1000,
      // 到第一个位置执行第一个动画 没有滚动时透明
      startScrollOffset: 0,
      // 到第二个位置执行第二个动画
      endScrollOffset: 50,
    },
  )
  // 动画2：导航栏标题
  pageInstance.animate('.navbar .title', [{ color: 'transparent' }, { color: '#000' }], 1000, {
    scrollSource: '#scroller',
    timeRange: 1000,
    startScrollOffset: 0,
    endScrollOffset: 50,
  })
  // 动画3：导航栏返回按钮
  pageInstance.animate('.navbar .back', [{ color: '#fff' }, { color: '#000' }], 1000, {
    scrollSource: '#scroller',
    timeRange: 1000,
    startScrollOffset: 0,
    endScrollOffset: 50,
  })
})
// #endif

// 获取订单详情
const orderDetail = ref<OrderResult>()
const getMemberOrderByIdData = async () => {
  // 根据订单id拿到订单数据
  const res = await getMemberOrderByIdAPI(query.id)
  orderDetail.value = res.result
  console.log('拿到订单数据')
  // 如果订单状态为：待售后、待评价、已完成，则获取物流信息
  if (
    [OrderState.DaiShouHuo, OrderState.DaiPingJia, OrderState.YiWanCheng].includes(
      orderDetail.value.orderState,
    )
  ) {
    // 获取物流信息【这里始终没有执行，不知为何，大概率是判断条件没有通过】
    getMemberOrderLogisticsByIdData()
    console.log('获取物流信息')
  }
}
onLoad(() => {
  getMemberOrderByIdData()
})

// 获取物流信息 logistics物流、后勤
const logisticsList = ref<LogisticItem[]>([])
const getMemberOrderLogisticsByIdData = async () => {
  const res = await getMemberOrderLogisticsByIdAPI(query.id)
  logisticsList.value = res.result.list
  console.log(res.result.list)
}
// 倒计时结束事件
const onTimeup = () => {
  // 修改订单状态为已取消
  orderDetail.value!.orderState = OrderState.YiQuXiao
}

// 订单支付
const onOrderPay = async () => {
  if (import.meta.env.DEV) {
    // 开发环境模拟支付
    await getPayMockAPI({ orderId: query.id })
  } else {
    // 生产环境 PROD
    // #ifdef MP-WEIXIN
    // 正式环境微信支付 orderId来自通过defineProps接收的页面参数
    const res = await getPayWxPayMiniPayAPI({ orderId: query.id })
    // 调用wx的原生api requestPayment 请求支付
    await wx.requestPayment(res.result)
    // #endif

    // #ifdef H5 || APP-PLUS
    // H5端 和 App 端未开通支付-模拟支付体验
    await getPayMockAPI({ orderId: query.id })
    // #endif
  }
  // 关闭当前页，再跳转支付结果页
  uni.redirectTo({ url: `/pagesOrder/payment/payment?id=${query.id}` })
}

// 是否为开发环境
const isDev = import.meta.env.DEV
// 模拟发货【只能在开发环境测试】
const onOrderSend = async () => {
  // 如果是开发环境则进行模拟发货
  if (isDev) {
    await getMemberOrderConsignmentByIdAPI(query.id)
    uni.showToast({ icon: 'success', title: '模拟发货完成' })
    // 主动更新订单状态
    orderDetail.value!.orderState = OrderState.DaiShouHuo
  }
}
// 确认收货
const onOrderConfirm = () => {
  // 二次确认弹窗
  uni.showModal({
    content: '为保障您的权益，请收到货并确认无误后，再确认收货',
    confirmColor: '#27BA9B',
    success: async (success) => {
      if (success.confirm) {
        // 发送确认收货请求
        const res = await putMemberOrderReceiptByIdAPI(query.id)
        // 更新订单状态
        orderDetail.value = res.result
      }
    },
  })
}
// 删除订单
const onOrderDelete = () => {
  // 二次确认
  uni.showModal({
    content: '是否删除订单',
    confirmColor: '#27BA9B',
    success: async (success) => {
      if (success.confirm) {
        // 删除订单并重定向到list订单列表
        await deleteMemberOrderAPI({ ids: [query.id] })
        uni.redirectTo({ url: '/pagesOrder/list/list' })
      }
    },
  })
}

// 取消订单
const onOrderCancel = async () => {
  // 发送请求
  const res = await getMemberOrderCancelByIdAPI(query.id, { cancelReason: reason.value })
  // 更新订单信息
  orderDetail.value = res.result
  // 关闭弹窗
  popup.value?.close!()
  // 轻提示
  uni.showToast({ icon: 'none', title: '订单取消成功' })
}
</script>

<template>
  <!-- 自定义导航栏: 默认透明不可见, scroll-view 滚动到 50 时展示 -->
  <view class="navbar" :style="{ paddingTop: safeAreaInsets?.top + 'px' }">
    <view class="wrap">
      <!-- 页面栈数组大于1 表示是从其他页面跳转而来的，可以返回上一页，显示返回按钮 icon-left -->
      <navigator
        v-if="pages.length > 1"
        open-type="navigateBack"
        class="back icon-left"
      ></navigator>
      <!-- 页面栈数组不大于1，表示只有一个页面，则不能返回上一页，只能返回首页 icon-home -->
      <navigator v-else url="/pages/index/index" open-type="switchTab" class="back icon-home">
      </navigator>
      <view class="title">订单详情</view>
    </view>
  </view>
  <scroll-view
    enable-back-to-top
    scroll-y
    class="viewport"
    id="scroller"
    @scrolltolower="onScrolltolower"
  >
    <!-- 如果有订单数据再进行渲染订单状态 -->
    <template v-if="orderDetail">
      <!-- 订单状态 -->
      <view class="overview" :style="{ paddingTop: safeAreaInsets!.top + 20 + 'px' }">
        <!-- 待付款状态:展示去支付按钮和倒计时 -->
        <template v-if="orderDetail.orderState === OrderState.DaiFuKuan">
          <view class="status icon-clock">等待付款</view>
          <view class="tips">
            <text class="money">应付金额: ¥ {{ orderDetail.payMoney }}</text>
            <text class="time">支付剩余</text>
            <!-- 倒计时组件 剩余时间 -->
            <!-- splitor-color分割符号颜色 show-day显示天数 show-colon设置分隔符 -->
            <uni-countdown
              :second="orderDetail.countdown"
              color="#fff"
              splitor-color="#fff"
              :show-day="false"
              :show-colon="false"
              @timeup="onTimeup"
            />
          </view>
          <view class="button" @tap="onOrderPay">去支付</view>
        </template>

        <!-- 支付成功后的订单详情 -->
        <!-- 如果orderDetail.orderState订单状态不是待付款 其他订单状态:展示再次购买按钮 -->
        <template v-else>
          <!-- 订单状态文字 -->
          <view class="status">{{ orderStateList[orderDetail.orderState].text }}</view>
          <view class="button-group">
            <navigator
              class="button"
              :url="`/pagesOrder/create/create?orderId=${query.id}`"
              hover-class="none"
            >
              再次购买
            </navigator>
            <!-- 待发货状态：模拟发货,开发期间使用,用于修改订单状态为已发货 -->
            <view
              v-if="isDev && orderDetail.orderState == OrderState.DaiFaHuo"
              @tap="onOrderSend"
              class="button"
            >
              模拟发货
            </view>
            <!-- 待收货状态: 展示确认收货按钮 -->
            <view
              v-if="orderDetail.orderState === OrderState.DaiShouHuo"
              @tap="onOrderConfirm"
              class="button"
            >
              确认收货
            </view>
          </view>
        </template>
      </view>

      <!-- 配送状态 -->
      <view class="shipment">
        <!-- 订单物流信息 不能显示，获取不到logisticsList，是因为判断不通过 没有成功发起请求 -->
        <view v-for="item in logisticsList" :key="item.id" class="item">
          <view class="message">
            {{ item.text }}
          </view>
          <view class="date"> {{ item.time }} </view>
        </view>
        <!-- 用户收货地址 -->
        <view class="locate">
          <view class="user">
            {{ orderDetail.receiverContact }} {{ orderDetail.receiverMobile }}
          </view>
          <view class="address"> {{ orderDetail.receiverAddress }} </view>
        </view>
      </view>

      <!-- 商品信息 -->
      <view class="goods">
        <view class="item">
          <navigator
            class="navigator"
            v-for="item in orderDetail.skus"
            :key="item.id"
            :url="`/pages/goods/goods?id=${item.spuId}`"
            hover-class="none"
          >
            <image class="cover" :src="item.image"></image>
            <view class="meta">
              <view class="name ellipsis">{{ item.name }}</view>
              <view class="type">{{ item.attrsText }}</view>
              <view class="price">
                <view class="actual">
                  <text class="symbol">¥</text>
                  <text>{{ item.curPrice }}</text>
                </view>
              </view>
              <view class="quantity">x{{ item.quantity }}</view>
            </view>
          </navigator>
          <!-- 待评价状态:展示按钮 -->
          <view class="action" v-if="orderDetail.orderState === OrderState.DaiPingJia">
            <view class="button primary">申请售后</view>
            <navigator url="" class="button"> 去评价 </navigator>
          </view>
        </view>
        <!-- 合计 -->
        <view class="total">
          <view class="row">
            <view class="text">商品总价: </view>
            <view class="symbol">{{ orderDetail.totalMoney }}</view>
          </view>
          <view class="row">
            <view class="text">运费: </view>
            <view class="symbol">{{ orderDetail.postFee }}</view>
          </view>
          <view class="row">
            <view class="text">应付金额: </view>
            <view class="symbol primary">{{ orderDetail.payMoney }}</view>
          </view>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="detail">
        <view class="title">订单信息</view>
        <view class="row">
          <view class="item">
            订单编号: {{ query.id }}
            <text class="copy" @tap="onCopy(query.id)">复制</text>
          </view>
          <view class="item">下单时间: {{ orderDetail.createTime }}</view>
        </view>
      </view>

      <!-- 猜你喜欢 -->
      <HwGuess ref="guessRef" />

      <!-- 底部操作栏 -->
      <view class="toolbar-height" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }"></view>
      <view class="toolbar" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }">
        <!-- 待付款状态:展示支付按钮 -->
        <template v-if="orderDetail.orderState === OrderState.DaiFuKuan">
          <view class="button primary" @tap="onOrderPay"> 去支付 </view>
          <!-- 调用popup.open打开弹出层组件 -->
          <view class="button" @tap="popup?.open?.()"> 取消订单 </view>
        </template>
        <!-- 其他订单状态:按需展示按钮 -->
        <template v-else>
          <navigator
            class="button secondary"
            :url="`/pagesOrder/create/create?orderId=${query.id}`"
            hover-class="none"
          >
            再次购买
          </navigator>
          <!-- 待收货状态: 展示确认收货 -->
          <view
            class="button primary"
            v-if="orderDetail.orderState === OrderState.DaiShouHuo"
            @tap="onOrderConfirm"
          >
            确认收货
          </view>
          <!-- 待评价状态: 展示去评价 -->
          <view class="button" v-if="orderDetail.orderState === OrderState.DaiPingJia">
            去评价
          </view>
          <!-- 待评价/已完成/已取消 状态: 展示删除订单 -->
          <view
            class="button delete"
            v-if="orderDetail.orderState >= OrderState.DaiPingJia"
            @tap="onOrderDelete"
          >
            删除订单
          </view>
        </template>
      </view>
    </template>
    <template v-else>
      <!-- 骨架屏组件 -->
      <PageSkeleton />
    </template>
  </scroll-view>

  <!-- 取消订单弹窗 弹出层组件 type设置为底部弹出 -->
  <uni-popup ref="popup" type="bottom" background-color="#fff">
    <view class="popup-root">
      <view class="title">订单取消</view>
      <view class="description">
        <view class="tips">请选择取消订单的原因：</view>
        <view class="cell" v-for="item in reasonList" :key="item" @tap="reason = item">
          <text class="text">{{ item }}</text>
          <text class="icon" :class="{ checked: item === reason }"></text>
        </view>
      </view>
      <view class="footer">
        <!-- 关闭弹出层 -->
        <view class="button" @tap="popup?.close?.()">取消</view>
        <view class="button primary" @tap="onOrderCancel">确认</view>
      </view>
    </view>
  </uni-popup>
</template>

<style lang="scss">
page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.navbar {
  width: 750rpx;
  color: #000;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9;
  /* background-color: #f8f8f8; */
  background-color: transparent;

  .wrap {
    position: relative;

    .title {
      height: 44px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 32rpx;
      /* color: #000; */
      color: transparent;
    }

    .back {
      position: absolute;
      left: 0;
      height: 44px;
      width: 44px;
      font-size: 44rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      /* color: #000; */
      color: #fff;
    }
  }
}

.viewport {
  background-color: #f7f7f8;
}

.overview {
  display: flex;
  flex-direction: column;
  align-items: center;

  line-height: 1;
  padding-bottom: 30rpx;
  color: #fff;
  background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/order_bg.png);
  background-size: cover;

  .status {
    font-size: 36rpx;
  }

  .status::before {
    margin-right: 6rpx;
    font-weight: 500;
  }

  .tips {
    margin: 30rpx 0;
    display: flex;
    font-size: 14px;
    align-items: center;

    .money {
      margin-right: 30rpx;
    }
  }

  .button-group {
    margin-top: 30rpx;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .button {
    width: 260rpx;
    height: 64rpx;
    margin: 0 10rpx;
    text-align: center;
    line-height: 64rpx;
    font-size: 28rpx;
    color: #27ba9b;
    border-radius: 68rpx;
    background-color: #fff;
  }
}

.shipment {
  line-height: 1.4;
  padding: 0 20rpx;
  margin: 20rpx 20rpx 0;
  border-radius: 10rpx;
  background-color: #fff;

  .locate,
  .item {
    min-height: 120rpx;
    padding: 30rpx 30rpx 25rpx 75rpx;
    background-size: 50rpx;
    background-repeat: no-repeat;
    background-position: 6rpx center;
  }

  .locate {
    background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/locate.png);

    .user {
      font-size: 26rpx;
      color: #444;
    }

    .address {
      font-size: 24rpx;
      color: #666;
    }
  }

  .item {
    background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/car.png);
    border-bottom: 1rpx solid #eee;
    position: relative;

    .message {
      font-size: 26rpx;
      color: #444;
    }

    .date {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.goods {
  margin: 20rpx 20rpx 0;
  padding: 0 20rpx;
  border-radius: 10rpx;
  background-color: #fff;

  .item {
    padding: 30rpx 0;
    border-bottom: 1rpx solid #eee;

    .navigator {
      display: flex;
      margin: 20rpx 0;
    }

    .cover {
      width: 170rpx;
      height: 170rpx;
      border-radius: 10rpx;
      margin-right: 20rpx;
    }

    .meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
    }

    .name {
      height: 80rpx;
      font-size: 26rpx;
      color: #444;
    }

    .type {
      line-height: 1.8;
      padding: 0 15rpx;
      margin-top: 6rpx;
      font-size: 24rpx;
      align-self: flex-start;
      border-radius: 4rpx;
      color: #888;
      background-color: #f7f7f8;
    }

    .price {
      display: flex;
      margin-top: 6rpx;
      font-size: 24rpx;
    }

    .symbol {
      font-size: 20rpx;
    }

    .original {
      color: #999;
      text-decoration: line-through;
    }

    .actual {
      margin-left: 10rpx;
      color: #444;
    }

    .text {
      font-size: 22rpx;
    }

    .quantity {
      position: absolute;
      bottom: 0;
      right: 0;
      font-size: 24rpx;
      color: #444;
    }

    .action {
      display: flex;
      flex-direction: row-reverse;
      justify-content: flex-start;
      padding: 30rpx 0 0;

      .button {
        width: 200rpx;
        height: 60rpx;
        text-align: center;
        justify-content: center;
        line-height: 60rpx;
        margin-left: 20rpx;
        border-radius: 60rpx;
        border: 1rpx solid #ccc;
        font-size: 26rpx;
        color: #444;
      }

      .primary {
        color: #27ba9b;
        border-color: #27ba9b;
      }
    }
  }

  .total {
    line-height: 1;
    font-size: 26rpx;
    padding: 20rpx 0;
    color: #666;

    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10rpx 0;
    }

    .symbol::before {
      content: '¥';
      font-size: 80%;
      margin-right: 3rpx;
    }

    .primary {
      color: #cf4444;
      font-size: 36rpx;
    }
  }
}

.detail {
  line-height: 1;
  padding: 30rpx 20rpx 0;
  margin: 20rpx 20rpx 0;
  font-size: 26rpx;
  color: #666;
  border-radius: 10rpx;
  background-color: #fff;

  .title {
    font-size: 30rpx;
    color: #444;
  }

  .row {
    padding: 20rpx 0;

    .item {
      padding: 10rpx 0;
      display: flex;
      align-items: center;
    }

    .copy {
      border-radius: 20rpx;
      font-size: 20rpx;
      border: 1px solid #ccc;
      padding: 5rpx 10rpx;
      margin-left: 10rpx;
    }
  }
}

.toolbar-height {
  height: 100rpx;
  box-sizing: content-box;
}

.toolbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(var(--window-bottom));
  z-index: 1;

  height: 100rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  border-top: 1rpx solid #ededed;
  border-bottom: 1rpx solid #ededed;
  background-color: #fff;
  box-sizing: content-box;

  .button {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 200rpx;
    height: 72rpx;
    margin-left: 15rpx;
    font-size: 26rpx;
    border-radius: 72rpx;
    border: 1rpx solid #ccc;
    color: #444;
  }

  .delete {
    order: 4;
  }

  .button {
    order: 3;
  }

  .secondary {
    order: 2;
    color: #27ba9b;
    border-color: #27ba9b;
  }

  .primary {
    order: 1;
    color: #fff;
    background-color: #27ba9b;
  }
}

.popup-root {
  padding: 30rpx 30rpx 0;
  border-radius: 10rpx 10rpx 0 0;
  overflow: hidden;

  .title {
    font-size: 30rpx;
    text-align: center;
    margin-bottom: 30rpx;
  }

  .description {
    font-size: 28rpx;
    padding: 0 20rpx;

    .tips {
      color: #444;
      margin-bottom: 12rpx;
    }

    .cell {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15rpx 0;
      color: #666;
    }

    .icon::before {
      content: '\e6cd';
      font-family: 'erabbit' !important;
      font-size: 38rpx;
      color: #999;
    }

    .icon.checked::before {
      content: '\e6cc';
      font-size: 38rpx;
      color: #27ba9b;
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    padding: 30rpx 0 40rpx;
    font-size: 28rpx;
    color: #444;

    .button {
      flex: 1;
      height: 72rpx;
      text-align: center;
      line-height: 72rpx;
      margin: 0 20rpx;
      color: #444;
      border-radius: 72rpx;
      border: 1rpx solid #ccc;
    }

    .primary {
      color: #fff;
      background-color: #27ba9b;
      border: none;
    }
  }
}
</style>
