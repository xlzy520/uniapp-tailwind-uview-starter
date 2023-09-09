<template>
  <view class="user-page">
    <view class="mb-2">
      <view class="w-full mb-2">
        <u-button type="success" size="small" @click="addCookie">
          添加CK
        </u-button>
      </view>
      <view class="layout-items-center">
        <u-button type="primary" size="small" @click="addUser">
          添加用户
        </u-button>
        <u-button
          type="primary"
          size="small"
          class="ml-4"
          :loading="loading"
          @click="getList"
        >
          拉取关注的UP
        </u-button>
        <u-button type="error" size="small" class="ml-4" @click="onClear">
          清空
        </u-button>
      </view>
    </view>
    <view class="">
      <view class="">共 {{ followList.length }} 条观测用户</view>
    </view>
    <u-divider />
    <u-list>
      <u-list-item v-for="(item, index) in followList" :key="item.mid">
        <view class="user-item layout-items-center" @click="editUser(index)">
          <view class="user-mid text-overflow-hidden">
            {{ item.mid }}
          </view>
          <view class="user-name text-overflow-hidden">
            {{ item.uname }}
          </view>
          <!--          <view class="video-count">-->
          <!--            {{ getVideoCount(item) }}-->
          <!--          </view>-->
        </view>
      </u-list-item>
    </u-list>
  </view>
</template>

<script>
import { showLoading } from '@/utils';
import { DefaultCookie } from '@/utils/constant';

export default {
  data() {
    return {
      cookie: DefaultCookie,
      followList: [],
      mid: '',
      lastUpdateTime: '',
      loading: false,
    };
  },
  computed: {},
  onLoad(options) {
    if (options.getUp) {
      this.getList();
    }
  },
  onShow() {
    showLoading('加载中...');
    const followList = uni.getStorageSync('followList');
    if (followList) {
      this.followList = JSON.parse(followList);
    }
    const cookie = uni.getStorageSync('cookie');
    if (cookie) {
      this.cookie = cookie;
    }
    this.mid = uni.getStorageSync('mid');
    uni.hideLoading();
  },
  methods: {
    getList() {
      if (!this.mid) {
        uni.showToast({
          title: '请添加cookie',
          icon: 'none',
        });
        return;
      }
      this.loading = true;
      showLoading();
      fetchFollowings(this.mid, this.cookie)
        .then((res) => {
          this.followList = res || [];
          uni.setStorageSync('followList', JSON.stringify(this.followList));
        })
        .finally(() => {
          uni.hideLoading();
          this.loading = false;
        });
    },
    addCookie() {
      uni.navigateTo({
        url: '/pages/cookie/index',
      });
    },
    addUser() {
      uni.navigateTo({
        url: '/pages/users/user',
      });
    },
    editUser(index) {
      uni.navigateTo({
        url: `/pages/users/user?index=${index}`,
      });
    },
    onClear() {
      uni.showModal({
        title: '提示',
        content: '确定清空全部用户吗？',
        success: (result) => {
          if (result.confirm) {
            this.followList = [];
            uni.setStorageSync('followList', JSON.stringify(this.followList));
          }
        },
      });
    },
    getVideoCount(item) {
      return 0;
    },
  },
};
</script>

<style lang="scss">
.user-page {
  padding: 10px;
  margin-right: 10px;
}
.test {
  overflow: auto;
}
.user-item {
  //line-height: 30px;
  padding: 10px 0;
  border-bottom: 1px solid #ccc;
}
.user-mid {
  width: 200px;
}
.user-name {
  padding-left: 20px;
  width: 220px;
}
.video-count {
  padding-left: 20px;
  width: 80px;
}
.text-button {
}
.ml-4 {
  margin-left: 20px;
}
.edit-button {
  color: #60a5fa;
}
.remove-button {
  color: #f87171;
}
.w-full {
  width: 100%;
}
</style>
