<template>
  <view class="">
    <view class="tab-list-header" v-if="showTab">
      <u-tabs
        :list="tabs"
        :is-scroll="false"
        active-color="#6A88F3"
        inactive-color="#999999"
        :current="current"
        @change="tabChange"
      ></u-tabs>
    </view>
    <divider v-show="showTab" />
    <view class="tab-list-content">
      <view
        class="flex justify-between items-center list-item"
        v-for="item in listData"
        :key="item.title"
        @click="handleItemClick(item)"
      >
        <u-image
          :src="item.imgUrl"
          width="192"
          height="192"
          class="cover"
        ></u-image>
        <view class="content">
          <view class="font-medium text-blue-700 text-sm title">{{
            item.title
          }}</view>
          <view class="text-pink-400 text-xl subtitle">{{ item.desc }}</view>
        </view>
      </view>
    </view>
    <u-empty text="暂无数据" mode="list" v-if="!listData.length"></u-empty>
  </view>
</template>

<script>
export default {
  name: 'TabWithDataList',
  props: {
    showTab: {
      type: Boolean,
      default: true,
    },
    noStar: {
      type: Boolean,
      default: true,
    },
    listType: {
      type: String,
      default: '',
    },
    columnType: {
      type: String,
      default: '',
    },
    tabs: {
      type: Array,
      default: () => [],
    },
    listData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      current: 0,
    };
  },
  onLoad(options) {},
  methods: {
    tabChange(index, item) {
      this.current = index;
      this.$emit('tabChange', index, item);
    },
    handleItemClick(item) {
      this.$emit('itemClick', item);
    },
  },
};
</script>
<style lang="scss">
.tab-list-content {
  padding: 0 30upx;
  min-height: 400upx;
}
.list-item {
  padding: 30rpx 0;
  border-bottom: 2rpx solid #e4e4e4;
  margin-bottom: 22rpx;
  .cover {
    border-radius: 14upx;
  }
  .content {
    margin-left: 30upx;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
}
</style>
