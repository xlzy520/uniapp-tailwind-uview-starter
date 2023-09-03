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
      <el-form-item
        label="需要发布的文字，以逗号分隔，发布时会随机从里面取一句话"
        prop="message"
      >
        <el-input
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 6 }"
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
          this.form.message = this.form.message
            .replace(/\s+/g, '') // 替换所有空格
            .replace(/\s/g, '') // 替换单个空格
            .replace(/，/g, ','); // 替换所有逗号为英文逗号
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
      };
    }
  },
};
</script>

<style lang="scss"></style>
