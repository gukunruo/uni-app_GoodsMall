<script setup lang="ts">
// 引入大仓库和小仓库功能类似是一样的 可能是我们将小仓库在大仓库中用了模块统一导出
// import { useMemberStore } from '@/stores'
import { useMemberStore } from '@/stores/modules/member'

const memberStore = useMemberStore()
// 退出登录
const onLogout = () => {
  // 模态弹窗
  uni.showModal({
    content: '是否退出登录？',
    // 确定按钮颜色
    confirmColor: '#27BA9B',
    // 确定按钮的回调 res为返回的结果 其中的confirm为true则确定删除
    success: (res) => {
      if (res.confirm) {
        // 清理用户信息
        memberStore.clearProfile()
        // 返回上一页
        uni.navigateBack()
      }
    },
  })
}
</script>

<template>
  <view class="viewport">
    <!-- 列表1 -->
    <view class="list" v-if="memberStore.profile">
      <navigator url="/pagesMember/address/address" hover-class="none" class="item arrow">
        我的收货地址
      </navigator>
    </view>
    <!-- 列表2 -->
    <view class="list">
      <button hover-class="none" class="item arrow" open-type="openSetting">授权管理</button>
      <button hover-class="none" class="item arrow" open-type="feedback">问题反馈</button>
      <button hover-class="none" class="item arrow" open-type="contact">联系我们</button>
    </view>
    <!-- 列表3 -->
    <view class="list">
      <navigator hover-class="none" class="item arrow">关于优选好物</navigator>
    </view>
    <!-- 操作按钮 -->
    <view class="action" v-if="memberStore.profile">
      <view @tap="onLogout" class="button">退出登录</view>
    </view>
  </view>
</template>

<style lang="scss">
page {
  background-color: #f4f4f4;
}

.viewport {
  padding: 20rpx;
}

/* 列表 */
.list {
  padding: 0 20rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
  border-radius: 10rpx;

  .item {
    line-height: 90rpx;
    padding-left: 10rpx;
    font-size: 30rpx;
    color: #333;
    border-top: 1rpx solid #ddd;
    position: relative;
    text-align: left;
    border-radius: 0;
    background-color: #fff;

    &::after {
      width: auto;
      height: auto;
      left: auto;
      border: none;
    }

    &:first-child {
      border: none;
    }

    &::after {
      right: 5rpx;
    }
  }

  .arrow::after {
    content: '\e6c2';
    position: absolute;
    top: 50%;
    color: #ccc;
    font-family: 'erabbit' !important;
    font-size: 32rpx;
    transform: translateY(-50%);
  }
}

/* 操作按钮 */
.action {
  text-align: center;
  line-height: 90rpx;
  margin-top: 40rpx;
  font-size: 32rpx;
  color: #333;

  .button {
    background-color: #fff;
    margin-bottom: 20rpx;
    border-radius: 10rpx;
  }
}
</style>
