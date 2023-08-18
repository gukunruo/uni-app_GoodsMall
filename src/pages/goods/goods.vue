<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getGoodsByIdAPI } from '@/services/goods'
import type { GoodsResult } from '@/types/goods'
// 引入子组件
import AddressPanel from './components/AddressPanel.vue'
import ServicePanel from './components/ServicePanel.vue'
// 引入sku的ts类型
import type {
  SkuPopupLocaldata,
  SkuPopupEvent,
  SkuPopupInstance,
} from '@/components/vk-data-goods-sku-popup/vk-data-goods-sku-popup'

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

// 首先接收页面参数
const query = defineProps<{
  id: string
}>()

// 获取商品详情信息
const goods = ref<GoodsResult>()
const getGoodsByIdData = async () => {
  const res = await getGoodsByIdAPI(query.id)
  goods.value = res.result
  // 将后端返回数据处理成SKU-Popup组件所需格式
  localdata.value = {
    _id: res.result.id,
    name: res.result.name,
    // 商品图片 拿组图中的第一个作为即可
    goods_thumb: res.result.mainPictures[0],
    // 商品规格列表 通过数组映射map对数据进行处理
    spec_list: res.result.specs.map((v) => {
      return {
        name: v.name,
        list: v.values,
      }
    }),
    // 商品Sku列表
    sku_list: res.result.skus.map((v) => {
      return {
        _id: v.id,
        goods_id: res.result.id,
        goods_name: res.result.name,
        image: v.picture,
        price: v.price * 100, // 注意：需要乘以 100[插件的问题]
        stock: v.inventory,
        // sku规格组成
        sku_name_arr: v.specs.map((vv) => vv.valueName),
      }
    }),
  }
}

// 页面加载
onLoad(() => {
  getGoodsByIdData()
})

// 轮播图变化时
const currentIndex = ref(0)
// 轮播图当前图片发送变化
const onChange: UniHelper.SwiperOnChange = (event) => {
  currentIndex.value = event.detail.current
}

// 点击查看大图
const onTapImage = (url: string) => {
  // 大图预览
  uni.previewImage({
    // current：App平台必填，其他平台可不填 不填或无效则显示urls第一张
    current: url,
    // 传入所有图片链接是为了能左右滑动查看其他图片
    urls: goods.value!.mainPictures,
  })
}

// 拿到ref绑定的popup组件实例 [uni-ui 弹出层组件]
// 为了安全起见给open和close方法指定类型 ==> 函数类型
const popup = ref<{
  // 函数类型 void操作符指定要计算一个表达式但是不返回值
  open: (type?: UniHelper.UniPopupType) => void // open方法中指定打开的方式的类型
  close: () => void
}>()
// 调用uni-popup组件的open和close方法打开和关闭弹出层

// 弹出层渲染
const popupName = ref<'address' | 'service'>()
// typeof可以拿到某个js文件对应的ts类型  指定类型就是限制name取值范围
const openPopup = (name: typeof popupName.value) => {
  // 修改弹出层名称 拿到弹出层名字之后可以进行条件渲染
  popupName.value = name
  // 调用popup组件实例的open事件
  popup.value?.open()
}

// 是否显示Sku
const isShowSku = ref(false)
// 商品信息
const localdata = ref({} as SkuPopupLocaldata)

// 按钮模式
enum SkuMode {
  Both = 1,
  Cart = 2,
  Buy = 3,
}
const mode = ref<SkuMode>(SkuMode.Cart)
// 打开SKU弹窗修改按钮模式
const openSkuPopup = (val: SkuMode) => {
  // 显示SKU弹窗
  isShowSku.value = true
  // 修改按钮模式
  mode.value = val
}
</script>

<template>
  <!-- SKU弹窗组件 v-show控制显示隐藏 localdata商品信息本地数据源[通过数据源渲染数据] -->
  <vk-data-goods-sku-popup v-model="isShowSku" :localdata="localdata" />

  <scroll-view scroll-y class="viewport">
    <!-- 基本信息 -->
    <view class="goods">
      <!-- 商品主图 -->
      <view class="preview">
        <!-- 轮播图组件 -->
        <swiper @change="onChange" circular>
          <!-- goods.mainPictures是一个string[] -->
          <swiper-item v-for="item in goods?.mainPictures" :key="item">
            <!-- aspectFill 保持纵横比缩放图片，只保证图片的短边能完全显示出来[保证撑满] -->
            <image @tap="onTapImage(item)" mode="aspectFill" :src="item" />
          </swiper-item>
        </swiper>
        <view class="indicator">
          <text class="current">{{ currentIndex + 1 }}</text>
          <text class="split">/</text>
          <text class="total">{{ goods?.mainPictures.length }}</text>
        </view>
      </view>

      <!-- 商品简介 -->
      <view class="meta">
        <view class="price">
          <text class="symbol">¥</text>
          <text class="number">{{ goods?.price }}</text>
        </view>
        <view class="name ellipsis">{{ goods?.name }}</view>
        <view class="desc"> {{ goods?.desc }} </view>
      </view>

      <!-- 操作面板 -->
      <view class="action">
        <view @tap="openSkuPopup(SkuMode.Both)" class="item arrow">
          <text class="label">选择</text>
          <text class="text ellipsis"> 请选择商品规格 </text>
        </view>
        <view @tap="openPopup('address')" class="item arrow">
          <text class="label">送至</text>
          <text class="text ellipsis"> 请选择收获地址 </text>
        </view>
        <view @tap="openPopup('service')" class="item arrow">
          <text class="label">服务</text>
          <text class="text ellipsis"> 无忧退 快速退款 免费包邮 </text>
        </view>
      </view>
    </view>

    <!-- 商品详情 -->
    <view class="detail panel">
      <view class="title">
        <text>详情</text>
      </view>
      <view class="content">
        <view class="properties">
          <!-- 属性详情 -->
          <view v-for="item in goods?.details.properties" :key="item.name" class="item">
            <text class="label">{{ item.name }}</text>
            <text class="value">{{ item.value }}</text>
          </view>
        </view>
        <!-- 图片详情 -->
        <image
          class="image"
          v-for="item in goods?.details.pictures"
          :key="item"
          mode="widthFix"
          :src="item"
        ></image>
      </view>
    </view>

    <!-- 同类推荐 -->
    <view class="similar panel">
      <view class="title">
        <text>同类推荐</text>
      </view>
      <view class="content">
        <navigator
          v-for="item in goods?.similarProducts"
          :key="item.id"
          class="goods"
          hover-class="none"
          :url="`/pages/goods/goods?id=${item.id}`"
        >
          <image class="image" mode="aspectFill" :src="item.picture"></image>
          <view class="name ellipsis">{{ item.name }}</view>
          <view class="price">
            <text class="symbol">¥</text>
            <text class="number">{{ item.price }}</text>
          </view>
        </navigator>
      </view>
    </view>
  </scroll-view>

  <!-- 用户操作 -->
  <view class="toolbar" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }">
    <view class="icons">
      <button class="icons-button"><text class="icon-heart"></text>收藏</button>
      <button class="icons-button" open-type="contact">
        <text class="icon-handset"></text>客服
      </button>
      <navigator class="icons-button" url="/pages/cart/cart" open-type="switchTab">
        <text class="icon-cart"></text>购物车
      </navigator>
    </view>
    <view class="buttons">
      <view class="addcart"> 加入购物车 </view>
      <view class="buynow"> 立即购买 </view>
    </view>
  </view>

  <!-- uni-ui 弹出层 三个属性：
    type="bottom"底部弹出   background-color主窗口背景色 默认none -->
  <uni-popup ref="popup" type="bottom" background-color="#fff">
    <!-- 放组件 地址组件 or 服务组件  父组件给子组件绑定事件 让子组件去触发 -->
    <AddressPanel v-if="popupName === 'address'" @close="popup?.close()" />
    <ServicePanel v-if="popupName === 'service'" @close="popup?.close()" />
  </uni-popup>
</template>

<style lang="scss">
@import './styles/goods.scss';
</style>
