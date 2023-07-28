<template>
  <view class="page">
    <u-form
      :model="form"
      ref="uForm"
      label-position="top"
      class="lzy-form"
      label-width="200"
      :border-bottom="false"
    >
      <u-form-item label="CK" required prop="cookie" :border-bottom="false">
        <u-textarea
          class="u-border-bottom"
          required
          maxlength="9999"
          v-model="form.cookie"
          placeholder="请输入您的CK"
        />
      </u-form-item>
      <u-form-item
        label="置顶文字"
        required
        prop="topText"
        :border-bottom="false"
      >
        <u-textarea
          class="u-border-bottom"
          required
          v-model="form.topText"
          placeholder="请输入置顶文字"
        />
      </u-form-item>
      <u-form-item
        label="置顶图片链接"
        required
        prop="topImageUrl"
        :border-bottom="false"
      >
        <u-textarea
          class="u-border-bottom"
          required
          v-model="form.topImageUrl"
          placeholder="请输入置顶图片链接"
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
        topImageUrl: '',
        topText: '',
      },
      videoIndex: null,
    };
  },
  computed: {},
  onLoad(options) {
    const videoIndex = options.videoIndex;
    this.videoIndex = videoIndex;
    const videoList = uni.getStorageSync('videoList');
    if (videoList) {
      this.videoList = JSON.parse(videoList);
      const video = this.videoList[videoIndex];
      this.form = {
        cookie: video.cookie,
        topImageUrl: video.topImageUrl,
        topText: video.topText,
      };
    }
  },
  methods: {
    submit() {
      // if (!this.form.cookie) {
      //   uni.showToast({
      //     title: '请输入cookie',
      //     icon: 'none',
      //   });
      //   return;
      // }
      if (this.videoIndex) {
        this.videoList[this.videoIndex] = {
          ...this.videoList[this.videoIndex],
          ...this.form,
        };
        uni.setStorageSync('videoList', JSON.stringify(this.videoList));
      }
      uni.showToast({
        title: '设置成功',
        icon: 'none',
      });
      // uni.switchTab({
      //   url: '/pages/users/index?getUp=1',
      // });
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
