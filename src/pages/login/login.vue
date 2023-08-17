<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { postLoginWxMinAPI, postLoginWxMinSimpleAPI } from '@/services/login'
import { useMemberStore } from '@/stores'
import type { LoginResult } from '@/types/member'

// 是否显示账号密码登录表单
const isShowForms = ref<boolean>(false)
// 登录方式切换
const changeMethod = () => {
  isShowForms.value = !isShowForms.value
}

// MP-WEIXIN 获取 code 登录凭证
let code = ''
onLoad(async () => {
  // 调用wx.login 接收返回值 获取 code 登录凭证 用于后端服务器与微信服务器通讯
  const res = await wx.login()
  code = res.code
})
// 注意：code 的获取 不要 在 getphonenumber 事件回调函数调用，否则可能会出现错误！
// encryptedData和iv两个登录需要的数据 在点击时会出现在event中
const onGetphonenumber: UniHelper.ButtonOnGetphonenumber = async (event) => {
  const { encryptedData, iv } = event.detail
  const res = await postLoginWxMinAPI({ code, encryptedData, iv })
  loginSuccess(res.result)
}

// 模拟手机号码快捷登录（开发练习，因为手机号登录不对个人用户开放）
const onGetphonenumberSimple = async () => {
  const res = await postLoginWxMinSimpleAPI('13123456789')
  loginSuccess(res.result)
}

// 封装登录成功回调  参数：用户信息
const loginSuccess = (profile: LoginResult) => {
  // 保存用户信息需要用到用户[会员]相关的仓库
  const memberStore = useMemberStore()
  memberStore.setProfile(profile)
  // 成功提示
  uni.showToast({ icon: 'success', title: '登录成功' })
  // 由于switchTab跳转tabBar页面会关闭其他所有非tabBar页面，这样就显示不了成功的提示
  // 所以我们添加定时器 去延迟跳转
  setTimeout(() => {
    // 页面跳转分为两种情况：tabBar页面【只能用switchTab】普通页面【navigationTo】
    uni.switchTab({ url: '/pages/my/my' })
  }, 500)
}

// 传统表单登录，测试账号：13123456789 密码：123456，测试账号仅开发学习使用。
const form = ref({
  account: '13123456789',
  password: '',
})
</script>

<template>
  <view class="viewport">
    <view class="logo">
      <image
        src="https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/logo_icon.png"
      ></image>
    </view>
    <view class="login">
      <!-- 网页端表单登录 账号密码登录 -->
      <view v-show="isShowForms" class="PasswordLogin">
        <uni-forms label-align="center">
          <!-- name属性用于表单验证时使用 -->
          <uni-forms-item class="formsItem" name="name">
            <uni-easyinput type="text" placeholder="请输入用户名" />
          </uni-forms-item>
          <uni-forms-item name="name">
            <uni-easyinput type="password" placeholder="请输入密码" />
            <!--  v-model="form.account" -->
          </uni-forms-item>
        </uni-forms>
        <button class="buttonLogin phone">登录</button>
      </view>

      <!-- 小程序端授权登录 -->
      <!-- 文档：open-type=getPhoneNumber获取用户手机号，可以从@getphonenumber回调中获取到用户信息 -->
      <button
        class="button phone"
        v-show="!isShowForms"
        open-type="getPhoneNumber"
        @getphonenumber="onGetphonenumber"
      >
        <!-- 使用字体图标 -->
        <text class="icon icon-phone"></text>
        手机号快捷登录
      </button>
      <view class="extra">
        <view class="caption">
          <text>其他登录方式</text>
        </view>
        <view class="options">
          <button class="icon icon-phone" @tap="onGetphonenumberSimple">模拟快捷登录</button>
          <button class="icon icon-phone" @tap="changeMethod">
            {{ isShowForms ? '手机号快捷登录' : '账号密码登录' }}
          </button>
        </view>
      </view>
      <view class="tips">登录/注册即视为你同意《服务条款》和《小兔鲜儿隐私协议》</view>
    </view>
  </view>
</template>

<style lang="scss">
@import './styles/login.scss';
</style>
