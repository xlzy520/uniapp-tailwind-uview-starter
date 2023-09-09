<template>
  <el-dialog
    title="配置该视频的置顶评论"
    :visible="true"
    width="60%"
    @close="close"
  >
    <div class="text-red-500">
      <el-link
        class="font-bold !text-[24px]"
        type="success"
        target="_blank"
        href="https://service-8zqb5ngm-1253419200.gz.apigw.tencentcs.com/bilibili/upload.html"
      >
        图片上传点这里
      </el-link>
    </div>
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="200px"
      label-position="top"
    >
      <el-form-item label="发置顶评论的CK">
        <el-radio-group v-model="form.ckType">
          <el-radio :label="1">当前视频UP主的CK</el-radio>
          <el-radio :label="2">其他账号的CK</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        v-if="form.ckType === 2"
        label="发置顶评论的CK"
        prop="cookie"
      >
        <el-input
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 6 }"
          v-model.trim="form.cookie"
        ></el-input>
      </el-form-item>
      <el-form-item label="文字发送模式" prop="message">
        <el-radio-group v-model="form.sendTextType">
          <el-radio label="fixed">固定(将整个输入框的内容发送)</el-radio>
          <el-radio label="random">
            随机(以逗号分隔，发布时会随机从里面取一句话)
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        :label="
          '需要发布的文字' +
          (form.sendTextType === 'fixed'
            ? '，输入框的内容为完整的一个评论'
            : '，以逗号分隔，发布时会随机从里面取一句话')
        "
        prop="message"
      >
        <el-input
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 6 }"
          v-model="form.message"
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
import { getSpaceInfo } from '@/api/bilibili';

export default {
  props: {
    video: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      form: {
        ckType: 1,
      },
      rules: {},
    };
  },
  methods: {
    close() {
      this.$emit('close');
    },
    getSpaceInfo() {
      return getSpaceInfo(this.form.cookie)
        .then((res) => {
          const ownerMid = this.video.owner.mid;
          if (ownerMid === res.mid) {
            this.$message.success('配置的CK是当前视频UP主的CK');
          }
          return res;
        })
        .catch(() => {
          this.$message.error('CK不正确或者已过期, 请配置正确的CK');
        });
    },
    onSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          if (this.form.ckType === 1) {
            const videoCookie = this.video.cookie;
            if (!videoCookie) {
              this.$message.error('当前视频没有CK，请先配置CK');
              return;
            }
            this.form.cookie = this.video.cookie;
          } else {
            this.form.cookie = this.form.cookie.trim();
          }
          const userInfo = await this.getSpaceInfo();
          if (!userInfo) {
            return;
          }
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
      const topReply = video.topReply || {};
      this.form = {
        ...video.topReply,
        ckType: topReply.ckType ?? 1,
        cookie: topReply.ckType === 1 ? video.cookie : topReply.cookie ?? '',
        sendTextType: topReply.sendTextType ?? 'fixed',
      };
    }
  },
};
</script>

<style lang="scss"></style>
