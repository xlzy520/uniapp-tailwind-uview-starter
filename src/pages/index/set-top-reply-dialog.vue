<template>
  <el-dialog
    title="配置该视频的置顶评论"
    :visible="true"
    width="60%"
    @close="close"
  >
    <div class="text-red-500">
      <a
        href="https://service-8zqb5ngm-1253419200.gz.apigw.tencentcs.com/bilibili/upload.html"
        >图片上传点这里</a
      >
    </div>
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="200px"
      label-position="top"
    >
      <el-form-item label="文字" prop="message">
        <el-input
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 4 }"
          v-model.trim="form.message"
        ></el-input>
      </el-form-item>
      <el-form-item label="图片链接1">
        <el-input v-model.trim="form.img1"></el-input>
      </el-form-item>
      <el-form-item label="图片链接2">
        <el-input v-model.trim="form.img2"></el-input>
      </el-form-item>
      <el-form-item>
        <div class="text-center">
          <el-button type="primary" @click="onSubmit">确定</el-button>
        </div>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
export default {
  props: {
    video: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      form: {},
      rules: {
        message: [
          {
            required: true,
            message: '请输入文字',
            trigger: 'blur',
          },
        ],
      },
    };
  },
  methods: {
    close() {
      this.$emit('close');
    },
    onSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$emit('submit', {
            topReply: this.form,
          });
        }
      });
    },
  },
  mounted() {
    const video = { ...this.video };
    if (video) {
      this.form = video.topReply;
    }
  },
};
</script>

<style lang="scss"></style>
