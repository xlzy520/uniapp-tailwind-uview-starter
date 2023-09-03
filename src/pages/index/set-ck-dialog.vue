<template>
  <el-dialog
    title="配置该视频的UP的CK"
    :visible="true"
    width="60%"
    @close="close"
  >
    <div class="">
      CK 获取方式：
      <div class="text-red-500">
        如果你安装了我的插件，那么可以直接点击【复制CK】按钮
      </div>
      <div class="text-red-500">
        如果没有安装，那么需要看下面的教程
        <a href="https://www.yuque.com/xlzy520/doc/ifqklkxxxf3cq8is?singleDoc#">
          《B站获取CK教程》
        </a>
      </div>
    </div>
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="200px"
      label-position="top"
    >
      <el-form-item label="cookie">
        <el-input
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 4 }"
          v-model.trim="form.cookie"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <div class="text-center">
          <el-button type="primary" @click="onSubmitCK">确定</el-button>
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
      addCkVisible: false,
      form: {
        cookie: '',
      },
      rules: {
        cookie: [
          {
            required: true,
            message: '请输入CK',
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
          } else {
            this.$message.error('配置的CK不是当前视频UP主的CK, 无法操作该视频');
          }
          return res;
        })
        .catch(() => {
          this.$message.error('CK不正确或者已过期, 请配置正确的CK');
        });
    },
    onSubmitCK() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          const cookie = this.form.cookie;
          const csrfMatches = cookie.match(/bili_jct=(.+?);/);
          if (!csrfMatches) {
            uni.showToast({
              title: 'cookie格式不正确',
              icon: 'none',
            });
            return;
          }
          const userInfo = await this.getSpaceInfo();
          if (!userInfo) {
            return;
          }

          this.$emit('submit', { cookie });
        }
      });
    },
  },
  mounted() {
    if (this.video) {
      this.form.cookie = this.video.cookie;
    }
  },
};
</script>

<style lang="scss"></style>
