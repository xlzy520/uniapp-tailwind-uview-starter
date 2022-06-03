<template>
  <view class="layout-col-slide mt-3">
   <view class="">
     宽度：{{ss.screenWidth}}
     <view class="ml-2 mt-9 ">
       高度：{{ss.screenHeight}}
     </view>
     dpr：{{ss.devicePixelRatio}}
   </view>

    <u-input v-model="address"></u-input>

    <u-button class="" @click="tolzy">吕宗远</u-button>
    <u-button class="" @click="tojj">蒋晶</u-button>

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
      address: '',
      ss: {}
    };
  },
  onLoad() {
    console.log(333);
    const ss  = uni.getSystemInfoSync()
    this.ss  = ss
    console.log(ss);
    this.tabList = ActivityStatusEnum.map((v) => ({ name: v }));
    uni.request({
      url: 'http://ip-api.com/json?lang=zh-CN'
      // url: 'https://whois.pconline.com.cn/ipJson.jsp'
      // url: 'http://pv.sohu.com/cityjson?ie=utf-8'
      // url: 'http://ip.ws.126.net/ipquery'
    }).then(res => {
      console.log(res);
    })
  },
  methods: {
    tolzy (){
      uni.navigateTo({ url: `/pages/csm/lzy?address=`+this.address });
    },
    tojj (){
      uni.navigateTo({ url: `/pages/csm/jj?address=`+this.address});
    },
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
