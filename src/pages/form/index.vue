<template>
  <view class="page">
    <u-form
      :model="form"
      ref="uForm"
      label-position="top"
      class="lzy-form"
      :border-bottom="false"
    >
      <u-form-item label="姓名" required prop="name" :border-bottom="false">
        <u-input
          :disabled="readOnly"
          class="u-border-bottom"
          required
          v-model="form.name"
          placeholder="请输入您的姓名"
        />
      </u-form-item>
      <u-form-item label="性别" required prop="gender" :border-bottom="false">
        <u-radio-group :disabled="readOnly" v-model="form.gender">
          <u-radio :name="0">男</u-radio>
          <u-radio :name="1">女</u-radio>
        </u-radio-group>
      </u-form-item>
      <u-form-item label="身份证号" required prop="idCard">
        <u-input
          :disabled="readOnly"
          required
          v-model="form.idCard"
          placeholder="请输入您的身份证号"
          maxlength="18"
        />
      </u-form-item>
      <u-form-item label="联系电话" required prop="phone">
        <u-input
          :disabled="readOnly"
          placeholder="请输入您的联系电话"
          v-model="form.phone"
          type="number"
        ></u-input>
      </u-form-item>

      <u-form-item label="学历" required prop="education">
        <u-input
          :border="border"
          type="select"
          :select-open="educationShow"
          v-model="form.education"
          placeholder="请选择学历"
          @click="educationShow = true"
        ></u-input>
        <u-select
          v-model="educationShow"
          :list="educationOptions"
          @confirm="changeEducation"
        />
      </u-form-item>
      <u-row>
        <u-col span="6">
          <u-form-item label="电子邮箱" required prop="email">
            <u-input
              :disabled="readOnly"
              placeholder="请输入您的邮箱"
              v-model="form.email"
              type="mail"
            ></u-input>
          </u-form-item>
        </u-col>
        <u-col span="6">
          <u-form-item label="QQ" prop="qq">
            <u-input
              :disabled="readOnly"
              placeholder="请输入您的扣扣"
              v-model="form.qq"
              type="number"
            ></u-input>
          </u-form-item>
        </u-col>
      </u-row>
      <u-form-item label="资质证明" required prop="license">
        <view class="upload-item">
          <u-upload
            :action="action"
            :header="header"
            max-count="1"
            :custom-btn="true"
            :read-only="readOnly"
            :file-list="fileList"
            @on-choose-complete="uploadStart"
            :show-progress="false"
            @on-success="uploadSuccess"
          >
            <u-image
              slot="addBtn"
              src="/static/icon/camera.png"
              width="161"
              height="161"
            ></u-image>
          </u-upload>
          <view class="license-desc">学历证书</view>
        </view>
      </u-form-item>
      <u-form-item
        label="备注"
        prop="remark"
        :border-bottom="false"
        class="row-no-reverse"
      >
        <u-input
          :disabled="readOnly"
          type="textarea"
          border
          v-model="form.remark"
          placeholder="请输入您的备注信息……"
        />
      </u-form-item>
      <u-form-item>
        <u-button
          class="confirm-btn"
          :disabled="btnLoading"
          :loading="btnLoading"
          @click="submit"
        >
          确定
        </u-button>
      </u-form-item>
    </u-form>
  </view>
</template>

<script>
import listApi from '@/api/list';

export default {
  data() {
    return {
      action: this.$uploadUrl,
      header: {
        token: uni.getStorageSync('accessToken'),
      },
      form: {
        name: '',
        gender: 0,
        birthday: '',
        phone: '',
        email: '',
        address: '',
        qq: '',
        participateYears: '1',
        remark: '',
        education: '2',
        unit: '',
        profession: '',
        position: '',
      },
      cellTitles: {
        education: '请选择您的学历',
      },
      birthdayShow: false,
      educationShow: false,
      participateYearsShow: false,
      btnLoading: false,
      title: '申请专家',
      rules: {
        name: [this.$rules.required('请输入姓名')],
        email: [
          this.$rules.required('请输入邮箱'),
          {
            validator: (rule, value) => this.$u.test.email(value),
            message: '邮箱格式不正确',
            trigger: ['blur', 'change'],
          },
        ],
        address: [this.$rules.required('请输入联系地址')],
        idCard: [this.$rules.required('请输入身份证号'), this.$rules.idCard],
        phone: [
          {
            required: true,
            message: '请输入手机号',
            trigger: ['change', 'blur'],
          },
          {
            validator: (rule, value) => this.$u.test.mobile(value),
            message: '手机号码不正确',
            trigger: ['change', 'blur'],
          },
        ],
        education: [
          {
            validator: () => !!this.form.education,
            message: '请选择您的学历',
            trigger: ['blur', 'change'],
          },
        ],
        license: [
          {
            validator: () => !!this.form.diploma,
            message: '请上传学历证书',
            trigger: ['blur', 'change'],
          },
        ],
      },
      educationOptions: [
        {
          value: '电子产品',
          label: '电子产品',
        },
        {
          value: '服装',
          label: '服装',
        },
        {
          value: '工艺品',
          label: '工艺品',
        },
      ],
      fileList: [],
    };
  },
  computed: {
    readOnly() {
      return false;
    },
  },
  onLoad(options) {},
  onReady() {
    this.$refs.uForm.setRules(this.rules);
  },
  methods: {
    changeEducation(data) {
      console.log(data);
      this.form.education = data[0].label;
    },
    uploadSuccess(data) {
      this.form.diploma = data.data;
      this.$refs.uForm.validateField('diploma');
      uni.hideLoading();
    },
    uploadStart(data, prop) {
      uni.showLoading({ title: '图片上传中...' });
    },
    submit() {
      this.$refs.uForm.validate((valid) => {
        if (valid) {
          this.btnLoading = true;
          uni.showLoading({ title: '正在提交...' });
          listApi
            .save(this.form)
            .then((res) => {})
            .finally(() => {
              this.btnLoading = false;
              uni.hideLoading();
            });
        }
      });
    },
  },
};
</script>

<style lang="scss">
.lzy-form {
  display: block;
  padding: 25upx 30upx;
}
.upload-item {
  width: 161upx;
  margin-right: 30upx;
  .license-desc {
    font-size: 28upx;
    color: #666666;
    line-height: 40upx;
    margin-top: 25upx;
    text-align: center;
  }
  ::v-deep .u-preview-wrap {
    width: 161upx !important;
    height: 161upx !important;
    margin: 0;
  }
}
</style>
