<template>
  <view class="layout-col-slide mt-3">
    <view class="w-1_3 px-3 m-auto text-center text-pink-400 font-medium"
      >百分比宽度</view
    >
    <view class="w-24 m-auto truncate text-2xl bg-blue-300">文字溢出省略</view>
    <tab-with-data-list
      :tabs="tabList"
      list-type="appoint-activity"
      :list-data="list"
      @tabChange="tabChange"
      @itemClick="goDetail"
    />
  </view>
</template>

<script>
import TabWithDataList from '@/components/TabWithDataList';
import { ActivityStatusEnum } from '@/utils/enum';
import listApi from '@/api/list';
import { getList } from '@/utils/mixins';

export default {
  mixins: [getList],
  components: {
    TabWithDataList,
  },
  data() {
    return {
      current: 0,
      tabList: [
        { name: '标题1' },
        { name: '标题2' },
        { name: '标题3' },
        { name: '标题4' },
      ],
      list: [],
    };
  },
  onLoad() {
    this.tabList = ActivityStatusEnum.map((v) => ({ name: v }));
  },
  methods: {
    tabChange(index) {
      this.current = index;
      this.pageOption.pageNum = 1;
      this.getList(true);
    },
    getList(isRefresh) {
      uni.showLoading({ title: '数据加载中...' });
      listApi
        .list({
          status: this.current,
          ...this.pageOption,
        })
        .then((res) => {
          this.handleResFromMixin(
            res,
            (v) => ({
              ...v,
              imgUrl: v.img, // 主要是格式化列表字段，比如时间、图片链接、转换的统一处理
            }),
            isRefresh,
          );
        })
        .finally(() => {
          uni.hideLoading();
          uni.stopPullDownRefresh();
        });
    },
    goDetail(item) {
      uni.navigateTo({ url: `/pages/active-detail/index?id=${item.id}` });
    },
  },
};
</script>

<style lang="scss"></style>
