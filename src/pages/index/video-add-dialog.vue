<template>
  <view class="add-video">
    <u-button type="success" @click="visible = true">添加CK</u-button>
    <el-dialog
      title="添加CK"
      :visible.sync="visible"
      width="60%"
      @close="close"
    >
      <div class="font-bold text-16">
        CK 获取方式：
        <div class="text-red-500">
          如果你安装了我的插件，那么可以直接点击【复制CK】按钮
        </div>
        <div class="text-red-500">
          如果没有安装，那么需要看下面的教程
          <a
            href="https://www.yuque.com/xlzy520/doc/ifqklkxxxf3cq8is?singleDoc#"
          >
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
  </view>
</template>

<script>
import { getReplyText, getSpaceInfo, setReplyText } from '@/api/bilibili';
import { get, uniqBy } from 'lodash-es';

export default {
  props: {
    videoList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      visible: false,
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
      this.visible = false;
      this.$emit('close');
    },
    getSpaceInfo() {
      return getSpaceInfo(this.form.cookie)
        .then((res) => {
          console.log(res, '===========打印的 ------ ');
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
          console.log(userInfo, '===========打印的 ------ ');
          const index = this.videoList.findIndex((item) => {
            return item.mid === String(userInfo.mid);
          });
          if (index > -1) {
            this.videoList.splice(index, 1, userInfo);
          } else {
            this.videoList.unshift(userInfo);
          }
          const uniqVideoList = uniqBy(this.videoList, 'mid');
          uni.setStorageSync('videoList', uniqVideoList);
          uni.showToast({
            title: '添加成功',
            icon: 'none',
          });
          this.form.cookie = '';
          this.visible = false;
          location.reload();
        }
      });
    },
  },
  mounted() {
    this.form.cookie = '';
  },
};
</script>

<style lang="scss"></style>
