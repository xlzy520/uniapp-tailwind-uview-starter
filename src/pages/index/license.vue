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
      <view class="font-bold text-[20px] text-red-500" v-if="isH5">
        请记得打开视频数据后台客户端, 否则会激活失败
      </view>
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
import { isH5 } from '@/utils';

export default {
  data() {
    return {
      isH5: isH5,
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
        .catch((err) => {
          if (err.errMsg === 'request:fail') {
            this.$alert('请双击运行下载的客户端, 否则会激活失败', '提示', {
              type: 'error',
              confirmButtonText: '确定',
            });
            return;
          }
          this.$message.error('激活失败, 可能是切换了浏览器');
        });
    },
  },
};
</script>

<style lang="scss"></style>
