<template>
  <view class="add-video ml-1 inline-flex">
    <el-dropdown @command="handleCommand">
      <el-button type="danger">
        删除稿件
        <i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="invalid">清空失效稿件</el-dropdown-item>
        <el-dropdown-item command="all">清空全部稿件</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </view>
</template>

<script>
export default {
  props: {},
  data() {
    return {};
  },
  computed: {},
  methods: {
    handleCommand(command) {
      const videoList = uni.getStorageSync('videoList');
      if (command === 'invalid') {
        const validVideoList = videoList.filter((item) => {
          return !['稿件不可见', '啥都木有'].includes(item.message);
        });
        uni.setStorageSync('videoList', validVideoList);
      } else if (command === 'all') {
        uni.setStorageSync('videoList', []);
      }
      location.reload();
    },
  },
};
</script>

<style lang="scss"></style>
