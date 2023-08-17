<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getMemberProfileAPI, putMemberProfileAPI } from '@/services/profile.ts'
import type { ProfileDetail, Gender } from '@/types/member'
import { useMemberStore } from '@/stores'
// 引入自定义日期格式化的函数
import { formatDate } from '@/utils/formatDate'
const memberStore = useMemberStore()
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

// 请求获取个人信息
const profile = ref({} as ProfileDetail)
const getMemberProfileData = async () => {
  const res = await getMemberProfileAPI()
  profile.value = res.result
  // console.log(res.result)
  // 同步仓库的头像和昵称 用于展示【我的】页面
  memberStore.profile.avatar = res.result.avatar
  memberStore.profile.nickname = res.result.nickname
}
onLoad(() => {
  getMemberProfileData()
})

// 修改头像
const onAvatarChange = () => {
  // 调用微信 拍照/选择图片 的api——，拿到头像的路径
  // 微信小程序从基础库 2.21.0 开始，wx.chooseImage 停止维护，请使用 uni.chooseMedia 代替
  // #ifdef H5 || APP-PLUS
  uni.chooseImage({
    count: 1,
    success: (res) => {
      // 文件路径
      const tempFilePaths = res.tempFilePaths
      // 上传
      uploadFile(tempFilePaths[0])
    },
  })
  // #endif

  // #ifdef MP-WEIXIN
  // uni.chooseMedia 仅支持微信小程序端
  uni.chooseMedia({
    // 文件个数
    count: 1,
    // 文件类型
    mediaType: ['image'],
    success: (res) => {
      // 文件路径【拿到的是一个数组】
      const { tempFilePath } = res.tempFiles[0]
      // 上传
      uploadFile(tempFilePath)
    },
  })
  // #endif
}
// 文件上传-兼容小程序端、H5端、App端
const uploadFile = (file: string) => {
  // 文件上传【我们在添加请求拦截器时添加了对unloadFile的处理】
  uni.uploadFile({
    // 开发者服务器 url
    url: '/member/profile/avatar',
    // 文件对应的 key , 开发者在服务器端通过这个 key 可以获取到文件二进制内容
    name: 'file',
    // 要上传文件资源的路径
    filePath: file,
    success: (res) => {
      if (res.statusCode === 200) {
        // 此时的res.data是字符串形式需要转成对象形式
        const avatar = JSON.parse(res.data).result.avatar
        // 个人信息页数据更新
        profile.value!.avatar = avatar
        // Store头像更新
        memberStore.profile!.avatar = avatar
        uni.showToast({ icon: 'success', title: '更新成功' })
      } else {
        uni.showToast({ icon: 'error', title: '出现错误' })
      }
    },
  })
}

// 修改性别
const onGenderChange: UniHelper.RadioGroupOnChange = (ev) => {
  // 更新数据
  profile.value.gender = ev.detail.value as Gender
}

// 修改生日 DatePickerOnChange其中的Data用于区别具体模式为日期
const onBirthdayChange: UniHelper.DatePickerOnChange = (ev) => {
  // 更新数据
  profile.value.birthday = ev.detail.value
}

// 修改城市
let fullLocationCode: [string, string, string] = ['', '', '']
// RegionPickerOnChange其中的Data用于区别具体模式为区域
const onFullLocationChange: UniHelper.RegionPickerOnChange = (ev) => {
  // 拿到新的数据修改前端界面 拿到数组数据拼接成地址的字符串
  profile.value.fullLocation = ev.detail.value.join(' ')
  // 提交后端更新 将code发送给服务器提交更新
  fullLocationCode = ev.detail.code!
}
// 点击保存提交表单
const onSubmit = async () => {
  // 表单数据被收集到了profile上
  const { nickname, gender, birthday } = profile.value
  const res = await putMemberProfileAPI({
    nickname,
    gender,
    birthday,
    profession: profile.value.profession,
    provinceCode: fullLocationCode[0],
    cityCode: fullLocationCode[1],
    countyCode: fullLocationCode[2],
  })
  // 更新Store昵称 用于在【我的】页面展示
  memberStore.profile!.nickname = res.result.nickname
  uni.showToast({ icon: 'success', title: '保存成功' })
  setTimeout(() => {
    uni.navigateBack()
  }, 400)
}
</script>

<template>
  <view class="viewport">
    <!-- 导航栏 -->
    <view class="navbar" :style="{ paddingTop: safeAreaInsets?.top + 'px' }">
      <navigator open-type="navigateBack" class="back icon-left" hover-class="none"></navigator>
      <view class="title">个人信息</view>
    </view>
    <!-- 头像 -->
    <view class="avatar">
      <view @tap="onAvatarChange" class="avatar-content">
        <image class="image" :src="profile?.avatar" mode="aspectFill" />
        <text class="text">点击修改头像</text>
      </view>
    </view>
    <!-- 表单 -->
    <view class="form">
      <!-- 表单内容 -->
      <view class="form-content">
        <view class="form-item">
          <text class="label">账号</text>
          <text class="account">{{ profile?.account }}</text>
        </view>
        <view class="form-item">
          <text class="label">昵称</text>
          <input class="input" type="text" placeholder="请填写昵称" v-model="profile!.nickname" />
        </view>
        <view class="form-item">
          <text class="label">性别</text>
          <radio-group @change="onGenderChange">
            <label class="radio">
              <radio value="男" color="#27ba9b" :checked="profile?.gender === '男'" />
              男
            </label>
            <label class="radio">
              <radio value="女" color="#27ba9b" :checked="profile?.gender === '女'" />
              女
            </label>
          </radio-group>
        </view>
        <view class="form-item">
          <text class="label">生日</text>
          <!-- 从底部弹起的滚动选择器 mode="date"用于选择日期 value表示选择了range中的第几个 -->
          <picker
            @change="onBirthdayChange"
            class="picker"
            mode="date"
            :value="profile?.birthday"
            start="1900-01-01"
            :end="formatDate(new Date())"
          >
            <view v-if="profile?.birthday">{{ profile?.birthday }}</view>
            <view class="placeholder" v-else>请选择日期</view>
          </picker>
        </view>
        <!-- 只有微信小程序端内置了省市区数据
          mode="region"可以指定picker为省市区选择器 -->
        <view class="form-item">
          <text class="label">城市</text>
          <!-- profile.fullLocation城市字符串形式数据，用空格分隔返回成数组 -->
          <picker
            @change="onFullLocationChange"
            mode="region"
            class="picker"
            :value="profile?.fullLocation?.split(' ')"
          >
            <view v-if="profile?.fullLocation">{{ profile.fullLocation }}</view>
            <view class="placeholder" v-else>请选择城市</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">职业</text>
          <input class="input" type="text" placeholder="请填写职业" v-model="profile.profession" />
        </view>
      </view>
      <!-- 提交按钮 -->
      <button @tap="onSubmit" class="form-button">保 存</button>
    </view>
  </view>
</template>

<style lang="scss">
page {
  background-color: #f4f4f4;
}

.viewport {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/order_bg.png);
  background-size: auto 420rpx;
  background-repeat: no-repeat;
}

// 导航栏
.navbar {
  position: relative;

  .title {
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    color: #fff;
  }

  .back {
    position: absolute;
    height: 40px;
    width: 40px;
    left: 0;
    font-size: 20px;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

// 头像
.avatar {
  text-align: center;
  width: 100%;
  height: 260rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .image {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    background-color: #eee;
  }

  .text {
    display: block;
    padding-top: 20rpx;
    line-height: 1;
    font-size: 26rpx;
    color: #fff;
  }
}

// 表单
.form {
  background-color: #f4f4f4;

  &-content {
    margin: 20rpx 20rpx 0;
    padding: 0 20rpx;
    border-radius: 10rpx;
    background-color: #fff;
  }

  &-item {
    display: flex;
    height: 96rpx;
    line-height: 46rpx;
    padding: 25rpx 10rpx;
    background-color: #fff;
    font-size: 28rpx;
    border-bottom: 1rpx solid #ddd;

    &:last-child {
      border: none;
    }

    .label {
      width: 180rpx;
      color: #333;
    }

    .account {
      color: #666;
    }

    .input {
      flex: 1;
      display: block;
      height: 46rpx;
    }

    .radio {
      margin-right: 20rpx;
    }

    .picker {
      flex: 1;
    }

    .placeholder {
      color: #808080;
    }
  }

  &-button {
    height: 80rpx;
    text-align: center;
    line-height: 80rpx;
    margin: 30rpx 20rpx;
    color: #fff;
    border-radius: 80rpx;
    font-size: 30rpx;
    background-color: #27ba9b;
  }
}
</style>
