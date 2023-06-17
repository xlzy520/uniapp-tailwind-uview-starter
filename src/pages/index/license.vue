<template>
  <view class="page p-4">
    <u-form
      :model="form"
      ref="uForm"
      label-position="top"
      label-width="200"
      :border-bottom="false"
    >
      <u-form-item label="激活码" required prop="url" :border-bottom="false">
        <u-input
          class="u-border-bottom"
          required
          clearable
          v-model="form.license"
          placeholder="请输入激活码"
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
import { checkLicense } from '@/api/bilibili';
export default {
  data() {
    return {
      form: {
        license: '',
      },
    };
  },
  computed: {},
  onLoad(options) {
    const license = uni.getStorageSync('license');
    if (license) {
      this.form.license = license;
    }
  },
  methods: {
    submit() {
      if (!this.form.license) {
        uni.showToast({
          title: '请输入激活码',
          icon: 'none',
        });
        return;
      }
      checkLicense(this.form.license)
        .then((res) => {
          uni.showToast({
            title: '激活成功',
            icon: 'none',
          });
          uni.setStorageSync('license', this.form.license);
          uni.reLaunch({
            url: '/pages/index/index',
          });
        })
        .catch(() => {
          uni.showToast({
            title: '激活失败',
            icon: 'none',
          });
        });
    },
  },
};
</script>

<style lang="scss"></style>
