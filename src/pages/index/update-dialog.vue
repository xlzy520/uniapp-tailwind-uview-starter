<template>
  <view class="ml-2" v-if="text">
    <u-button type="success" @click="visible = true">{{ text }}</u-button>
    <el-dialog title="更新内容" :visible="visible" width="60%" @close="close">
      <div class="">
        <div class="text-16 font-bold text-black">1.0.1</div>
        <div class="text-red-500 mt-1">1. 修复楼中楼删评不完整</div>
        <div class="text-red-500 mt-1">
          2. 当评论超过60条时，补充检查最新一页的评论
        </div>
      </div>
      <div class="mt-4 text-center mb-2">
        <el-button type="primary" @click="onDownload">
          立即下载最新客户端
        </el-button>
      </div>
    </el-dialog>
  </view>
</template>

<script>
export default {
  data() {
    return {
      keywords: '',
      visible: false,
      version: '',
      currentVersion: '',
    };
  },
  computed: {
    text() {
      if (this.version !== this.currentVersion) {
        return `更新客户端(${this.version})`;
      }
    },
  },
  methods: {
    close() {
      this.visible = false;
    },
    onDownload() {
      window.open(
        'https://zhibi-share.oss-cn-shanghai.aliyuncs.com/B%E7%AB%99%E6%89%A7%E7%AC%94%E6%9C%AC%E5%9C%B0%E5%AE%A2%E6%88%B7%E7%AB%AF.zip',
      );
    },
  },
  mounted() {
    this.version = localStorage.getItem('version') || '';
    this.currentVersion = localStorage.getItem('currentVersion') || '';
  },
};
</script>

<style lang="scss"></style>
