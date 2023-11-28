<template>
  <el-dialog :title="title" :visible="true" width="60%" @close="close">
    <el-form ref="form" label-width="200px" label-position="top">
      <el-form-item label="自动回复的内容">
        <el-input
          type="textarea"
          :autosize="{ minRows: 6, maxRows: 10 }"
          v-model="keywords"
        ></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSubmit">确定</el-button>
        <el-button @click="close">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { uniqBy } from 'lodash-es';

export default {
  props: {
    video: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    title() {
      return this.video.name + ' 的自动回复的内容配置';
    },
  },
  data() {
    return {
      keywords: '',
      visible: false,
    };
  },
  methods: {
    close() {
      this.$emit('close');
    },
    onSubmit() {
      const userInfo = {
        ...this.video,
        content: this.keywords,
      };
      const videoList = uni.getStorageSync('videoList') || [];
      const index = videoList.findIndex((item) => {
        return item.mid === String(userInfo.mid);
      });
      if (index > -1) {
        videoList.splice(index, 1, userInfo);
      } else {
        videoList.unshift(userInfo);
      }
      const uniqVideoList = uniqBy(videoList, 'mid');
      uni.setStorageSync('videoList', uniqVideoList);
      uni.showToast({
        title: '配置成功',
        icon: 'none',
      });
      this.close();
    },
  },
  mounted() {
    this.keywords = this.video.content;
  },
};
</script>

<style lang="scss"></style>
