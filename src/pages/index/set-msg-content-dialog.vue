<template>
  <view class="">
    <u-button type="primary" @click="visible = true">配置私信内容</u-button>
    <el-dialog
      title="私信内容配置"
      :visible="visible"
      width="60%"
      @close="close"
    >
      <el-form ref="form" label-width="200px" label-position="top">
        <el-form-item label="私信内容">
          <el-input
            type="textarea"
            :autosize="{ minRows: 6, maxRows: 10 }"
            v-model="keywords"
          ></el-input>
        </el-form-item>
        <el-form-item label="匹配评论的关键词，用逗号分隔">
          <el-input
            type="textarea"
            :autosize="{ minRows: 6, maxRows: 10 }"
            v-model="matchKeywords"
          ></el-input>
        </el-form-item>
        <!--        <el-form-item label="超过多少字直接删除">-->
        <!--          <el-input-number v-model="maxWords" :min="0"></el-input-number>-->
        <!--        </el-form-item>-->

        <el-form-item>
          <el-button type="primary" @click="onSubmit">确定</el-button>
          <el-button @click="close">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </view>
</template>

<script>
export default {
  data() {
    return {
      keywords: '',
      visible: false,
      maxWords: 30,
      matchKeywords: '',
    };
  },
  methods: {
    close() {
      this.visible = false;
    },
    onSubmit() {
      const keywords = this.keywords;
      localStorage.setItem('keywords', keywords);
      const matchKeywords = this.matchKeywords.replace(/，/g, ',');
      localStorage.setItem('matchKeywords', matchKeywords);
      this.$message({
        message: `私信内容配置成功`,
        type: 'success',
      });
      this.close();
    },
  },
  mounted() {
    this.keywords = localStorage.getItem('keywords') || '';
    this.matchKeywords = localStorage.getItem('matchKeywords') || '';
    this.maxWords = localStorage.getItem('maxWords') || 30;
  },
};
</script>

<style lang="scss"></style>
