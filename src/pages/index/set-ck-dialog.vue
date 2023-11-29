<template>
  <el-dialog
    title="更新CK"
    :visible="true"
    width="60%"
    :close-on-click-modal="false"
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
import { getReplyText, getSpaceInfo, setReplyText } from '@/api/bilibili';
import { get, uniqBy } from 'lodash-es';

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
          console.log(res, '===========打印的 ------ ');
          const follower = res.follower;
          if (follower > 1000) {
            this.$message.success('配置的CK是千粉CK');
          } else {
            this.$message.error('配置的CK不是千粉CK, 无法操作该视频');
          }
          return res;
        })
        .catch(() => {
          this.$message.error('CK不正确或者已过期, 请配置正确的CK');
        });
    },
    onSubmitCK() {
      const getReplyTextFormData = (data) => {
        return get(data, 'texts.0.reply', '');
      };
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
          userInfo.cookie = cookie;
          let followReplyTextData = await getReplyText(
            cookie,
            'followed_reply',
          );
          const followed_reply_text = getReplyTextFormData(followReplyTextData);
          userInfo.followed_reply_text = followed_reply_text;

          const recvReplyTextData = await getReplyText(cookie, 'recv_reply');
          const recv_reply_text = getReplyTextFormData(recvReplyTextData);
          userInfo.recv_reply_text = recv_reply_text;

          console.log(userInfo, '===========打印的 ------ ');
          const videoList = uni.getStorageSync('videoList') || [];
          const index = videoList.findIndex((item) => {
            return item.mid === String(userInfo.mid);
          });
          if (index > -1) {
            videoList.splice(index, 1, userInfo);
          } else {
            videoList.unshift(userInfo);
          }
          const uniqVideoList = uniqBy(videoList, 'mid');
          uni.setStorageSync('videoList', uniqVideoList);
          uni.showToast({
            title: '添加成功',
            icon: 'none',
          });
          location.reload();
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
