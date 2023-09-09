<template>
  <el-dialog
    title="配置该视频的UP的CK"
    :visible="true"
    width="60%"
    @close="close"
  >
    <div class="text-center w-full mb-2">
      <el-link
        underline
        class="!font-bold !text-red-500 !text-[20px]"
        target="_blank"
        href="https://www.yuque.com/xlzy520/doc/sc7qpq4808b4x9fa?singleDoc#"
        >《快手获取CK教程》
      </el-link>
    </div>
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="200px"
      label-position="top"
    >
      <el-form-item label="cookie" prop="cookie">
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
import { getCommentList } from '@/api/ks';

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
        __NS_sig3: '',
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
          this.$emit('submit', this.form);
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
