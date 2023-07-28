<template>
  <view class="page p-4">
    <u-form
      :model="form"
      ref="uForm"
      label-position="top"
      label-width="100%"
      :border-bottom="false"
    >
      <u-form-item
        label="视频链接或者BV号"
        required
        prop="url"
        :border-bottom="false"
      >
        <u-input
          class="u-border-bottom"
          required
          clearable
          v-model="form.url"
          placeholder="请输入视频链接或者BV号"
        />
      </u-form-item>
      <view class="text-pink-500">APP视频简介长按视频编号可以自动复制</view>
      <u-form-item>
        <u-button type="primary" @click="submit" class="u-button-submit">
          提交
        </u-button>
      </u-form-item>
    </u-form>
  </view>
</template>

<script>
import { getVideoInfo, fetchVideoOnlineTotalInfo } from '@/api/bilibili';
import { showLoading } from '@/utils';
import { pick, uniqBy } from 'lodash-es';
import { pickKeysFromVideo } from '@/utils/constant';

export default {
  data() {
    return {
      form: {
        url: '',
      },
      videoList: [],
    };
  },
  computed: {},
  onLoad(options) {
    const videoList = uni.getStorageSync('videoList');
    const isOld = typeof videoList === 'string';
    if (videoList) {
      this.videoList = isOld ? JSON.parse(videoList) : videoList;
    }
  },
  methods: {
    submit() {
      if (!this.form.url) {
        uni.showToast({
          title: '请输入链接',
          icon: 'none',
        });
        return;
      }
      const url = this.form.url;
      let aid = url.match(/av(\d+)/);
      let bvid = url.match(/BV(\w+)/);
      if (!aid && !bvid) {
        uni.showToast({
          title: '视频链接格式不正确',
          icon: 'none',
        });
        return;
      }
      showLoading('添加中...');
      aid = aid ? aid[1] : '';
      bvid = bvid ? bvid[1] : '';
      const type = aid ? 'aid' : 'bvid';
      const videoId = aid || bvid;
      return getVideoInfo(videoId, type).then((res) => {
        const data = pick(res, pickKeysFromVideo);
        if (!data) {
          uni.showToast({
            title: '视频不存在',
            icon: 'none',
          });
          return;
        }
        data.isCustom = true;
        return fetchVideoOnlineTotalInfo(data.aid, data.cid).then((total) => {
          data.total = total.total;
          const index = this.videoList.findIndex((item) => {
            return item.aid === aid;
          });
          if (index > -1) {
            this.videoList.splice(index, 1, data);
          } else {
            this.videoList.unshift(data);
          }
          const uniqVideoList = uniqBy(this.videoList, 'aid');
          uni.setStorageSync('videoList', uniqVideoList);
          uni.showToast({
            title: '添加成功',
            icon: 'none',
          });
          this.form.url = '';
          uni.reLaunch({
            url: '/pages/index/index',
          });
        });
      });
    },
  },
};
</script>

<style lang="scss"></style>
