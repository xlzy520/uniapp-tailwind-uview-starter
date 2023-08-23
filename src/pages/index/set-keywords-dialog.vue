<template>
  <view class="">
    <u-button type="primary" @click="visible = true">配置删评关键词</u-button>
    <el-dialog title="关键词配置" :visible="visible" width="60%" @close="close">
      <el-form ref="form" label-width="200px" label-position="top">
        <el-form-item label="需要删除的关键词， 以逗号分隔">
          <el-input
            type="textarea"
            :autosize="{ minRows: 6, maxRows: 10 }"
            v-model="keywords"
          ></el-input>
        </el-form-item>
        <el-form-item label="超过多少字直接删除">
          <el-input-number v-model="maxWords" :min="0"></el-input-number>
        </el-form-item>

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
    };
  },
  methods: {
    close() {
      this.visible = false;
    },
    onSubmit() {
      const keywords = this.keywords
        .replace(/\s+/g, '') // 替换所有空格
        .replace(/\s/g, '') // 替换单个空格
        .replace(/，/g, ','); // 替换所有逗号为英文逗号
      localStorage.setItem('keywords', keywords);
      localStorage.setItem('maxWords', this.maxWords);
      const splitKeywords = keywords.split(',');
      this.$message({
        message: `关键词配置成功，共${splitKeywords.length}个`,
        type: 'success',
      });
      this.close();
    },
  },
  mounted() {
    this.keywords = localStorage.getItem('keywords') || '';
    this.maxWords = localStorage.getItem('maxWords') || 30;
  },
};
</script>

<style lang="scss"></style>
