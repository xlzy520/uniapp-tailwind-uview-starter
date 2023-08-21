<template>
  <view class="">
    <el-dialog
      title="评论删除日志列表"
      :visible="true"
      width="60%"
      @close="close"
    >
      <el-table :data="logList">
        <el-table-column prop="rpid" label="评论ID"></el-table-column>
        <el-table-column prop="content" label="评论内容"></el-table-column>
        <el-table-column prop="ctime" label="评论时间"></el-table-column>
      </el-table>
    </el-dialog>
  </view>
</template>

<script>
export default {
  props: {
    logList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {};
  },
  methods: {
    close() {
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss"></style>
