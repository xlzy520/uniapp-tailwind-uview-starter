<template>
  <view class="page">
    <u-form
      :model="form"
      ref="uForm"
      label-position="top"
      class="lzy-form"
      :border-bottom="false"
    >
      <u-form-item label="昵称" required prop="uname" :border-bottom="false">
        <u-input
          class="u-border-bottom"
          required
          v-model="form.uname"
          placeholder="请输入昵称"
        />
      </u-form-item>
      <u-form-item label="UID" required prop="mid" :border-bottom="false">
        <u-input
          class="u-border-bottom"
          required
          v-model="form.mid"
          placeholder="请输入UID"
        />
      </u-form-item>
      <u-form-item>
        <u-button type="primary" @click="submit" class="u-button-submit">
          提交
        </u-button>
        <u-button
          v-if="mid"
          type="primary"
          @click="onRemove"
          class="u-button-submit"
        >
          删除
        </u-button>
      </u-form-item>
    </u-form>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: {
        mid: '',
        uname: '',
      },
      mid: '',
      followList: [],
    };
  },
  computed: {},
  onLoad(options) {
    const mid = options.mid;
    const uname = options.uname;
    if (mid) {
      this.mid = mid;
      this.form.mid = mid;
      this.form.uname = uname;
    }
    const followList = uni.getStorageSync('followList');
    if (followList) {
      this.followList = JSON.parse(followList);
    }
  },
  methods: {
    submit() {
      if (!this.form.mid) {
        uni.showToast({
          title: '请输入UID',
          icon: 'none',
        });
        return;
      }
      if (!this.form.uname) {
        uni.showToast({
          title: '请输入昵称',
          icon: 'none',
        });
        return;
      }
      const index = this.followList.findIndex((item) => item.mid === this.mid);
      if (index > -1) {
        this.followList[index] = this.form;
      } else {
        this.followList.push(this.form);
      }
      uni.setStorageSync('followList', JSON.stringify(this.followList));
      uni.showToast({
        title: '设置成功',
        icon: 'none',
      });
      uni.switchTab({
        url: '/pages/users/index',
      });
    },
    onRemove() {
      const index = this.followList.findIndex((item) => item.mid === this.mid);
      this.followList.splice(index, 1);
      uni.setStorageSync('followList', JSON.stringify(this.followList));
      uni.showToast({
        title: '删除成功',
        icon: 'none',
      });
      uni.switchTab({
        url: '/pages/users/index',
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
</style>
