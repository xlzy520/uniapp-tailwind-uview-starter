<template>
  <view class="ml-2">
    <u-button type="primary" @click="visible = true" icon="setting">
      配置
    </u-button>
    <el-dialog title="配置" :visible="visible" width="60%" @close="close">
      <el-form
        ref="form"
        class="setting-form"
        :model="form"
        :rules="rules"
        label-width="200px"
        label-position="left"
      >
        <el-form-item label="自定义刷新时间间隔(分钟)">
          <el-input-number
            v-model="form.refreshInterval"
            :min="recommendInterval"
            :step="1"
          ></el-input-number>
          <div class="">不能小于推荐时间间隔{{ recommendInterval }}分钟</div>
        </el-form-item>
        <el-form-item label="音乐链接" prop="audioUrl">
          <div class="layout-items-center">
            <el-input
              clearable
              v-model="form.audioUrl"
              placeholder="请输入提醒音频链接"
            />
          </div>
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
import { getRecommendRefreshMinutes } from '@/utils';
export default {
  props: {},
  watch: {},
  data() {
    return {
      visible: false,
      form: {
        refreshInterval: 1,
        audioUrl: '',
      },
      rules: {
        audioUrl: [
          {
            required: true,
            message: '请输入提醒音频链接',
            trigger: 'blur',
          },
        ],
      },
      recommendInterval: 1,
    };
  },
  methods: {
    close() {
      this.visible = false;
    },
    onSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          console.log(this.recommendInterval);
          if (this.form.refreshInterval < this.recommendInterval) {
            this.$message.error(
              '刷新时间间隔不能小于推荐的' + this.recommendInterval + '分钟',
            );
            return;
          }
          if (this.form.audioUrl) {
            uni.setStorageSync('audioUrl', this.form.audioUrl);
          }
          localStorage.setItem('refreshInterval', this.form.refreshInterval);
          this.$message.success('配置保存成功');
          location.reload();
        }
      });
    },
  },
  mounted() {
    this.form.audioUrl = uni.getStorageSync('audioUrl');
    const videoList = uni.getStorageSync('videoList') || [];
    this.recommendInterval = getRecommendRefreshMinutes(videoList.length);
    const refreshInterval = localStorage.getItem('refreshInterval');
    if (refreshInterval >= this.recommendInterval) {
      this.form.refreshInterval = Number(refreshInterval);
    }
  },
};
</script>

<style lang="scss">
.setting-form {
  .el-form-item {
    display: block !important;
  }
}
</style>
