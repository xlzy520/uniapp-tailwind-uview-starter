<template>
  <view class="ml-2">
    <u-button v-if="hasNewVersion" type="success" @click="visible = true">
      更新客户端({{ currentVersion }} -> {{ version }})
    </u-button>
    <u-tag
      v-else
      :text="currentVersion + '更新内容'"
      @click="visible = true"
    ></u-tag>
    <el-dialog title="更新内容" :visible="visible" width="60%" @close="close">
      <div class="">
        <div class="text-16 font-bold text-black mt-2">1.0.5</div>
        <div class="text-red-500 mt-1 font-bold">
          1. 优化查询评论列表的速度，减少超时情况
        </div>
        <div class="text-red-500 mt-1">2. 延长网页超时时间</div>

        <div class="text-16 font-bold text-black mt-2">1.0.4</div>
        <div class="text-red-500 mt-1">1. 跳过视频作者自己的评论</div>

        <div class="text-16 font-bold text-black mt-2">1.0.3</div>
        <div class="text-red-500 mt-1">1. 修复楼中楼删评不完整</div>
        <div class="text-red-500 mt-1">
          2. 当评论超过60条时，补充检查最新一页的评论
        </div>
        <div class="text-red-500 mt-1">3. 置顶没有检测在内</div>
        <div class="text-red-500 mt-1">
          4. 修复如果以逗号结尾，会删除全部评论的问题
        </div>
      </div>
      <div class="mt-4 text-center mb-2" v-if="hasNewVersion">
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
    hasNewVersion() {
      return this.version !== this.currentVersion;
    },
  },
  methods: {
    close() {
      this.visible = false;
      localStorage.setItem('noticeVersion', this.version);
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
    const noticeVersion = localStorage.getItem('noticeVersion');
    if (this.hasNewVersion) {
      if (noticeVersion !== this.version) {
        this.visible = true;
      }
    }
  },
};
</script>

<style lang="scss"></style>
