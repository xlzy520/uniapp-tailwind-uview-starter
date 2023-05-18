<template>
  <view class="page">
    <u-form
      :model="form"
      ref="uForm"
      label-position="top"
      class="lzy-form"
      :border-bottom="false"
    >
      <u-form-item label="CK" required prop="cookie" :border-bottom="false">
        <u-textarea
          class="u-border-bottom"
          required
          maxlength="9999"
          autoHeight
          v-model="form.cookie"
          placeholder="请输入您的CK"
        />
      </u-form-item>
      <u-form-item>
        <u-button type="primary" @click="submit" class="u-button-submit">
          提交
        </u-button>
      </u-form-item>
    </u-form>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: {
        cookie: '',
      },
    };
  },
  computed: {},
  onLoad(options) {
    const cookie = uni.getStorageSync('cookie');
    if (cookie) {
      this.form.cookie = cookie;
    }
  },
  methods: {
    submit() {
      if (!this.form.cookie) {
        uni.showToast({
          title: '请输入cookie',
          icon: 'none',
        });
        return;
      }
      const match = this.form.cookie.match(/DedeUserID=(\d+)/);
      if (!match) {
        uni.showModal({
          title: '提示',
          content: 'cookie不完整, 请包含DedeUserID',
          showCancel: false,
        });
        return;
      }
      const mid = match[1];
      if (!mid) {
        uni.showModal({
          title: '提示',
          content: 'cookie不完整, 请包含DedeUserID',
          showCancel: false,
        });
        return;
      }
      uni.setStorageSync('cookie', this.form.cookie);
      uni.setStorageSync('mid', mid);
      uni.showToast({
        title: '设置成功',
        icon: 'none',
      });
      uni.switchTab({
        url: '/pages/users/index?getUp=1',
      });
    },
  },
};
</script>

<style lang="scss">
.lzy-form {
  display: block;
  padding: 25upx 30upx;
}
</style>
