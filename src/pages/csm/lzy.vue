<template>
  <view class="home">
    <view class="left-top">{{leftTop}}</view>
    <view class="center-time">{{centerTime}}</view>
    <view class="address">{{address}}</view>
    <view class="address-bg"></view>
    <view class="bottom-date">{{bottomDate}}</view>
<!--    <image src="/static/lzy.png" mode="aspectFit"  class="main-img"></image>-->
  </view>
</template>

<script>
import dayjs from "dayjs";
export default {
  name: 'lzy',
  data() {
    return {
      leftTop: '',
      centerTime: '',
      centerDate: '',
      bottomDate: '',
      address: ''
    }
  },
  onLoad(options) {
    console.log(options);
    const address = options.address || '星河内部打手';
    this.address = address;
    const handle = () => {
      const time = dayjs().format('HH:mm')
      const date = dayjs().format('DD')
      const bottomDate = 13
      this.leftTop= time
      this.centerTime = time
      this.centerDate = date
      this.bottomDate = bottomDate
    }
    handle()
    const interval = setInterval(() => {
      handle()
    }, 1000)
  },
}
</script>

<style lang="scss">
.home, {
  width: 100vw;
  height: 100vh;
  background-image: url("https://zhibi-common.oss-cn-shanghai.aliyuncs.com/Screenshot_2022-05-14-00-06-06-91.png");
  background-size: cover;
}
.main-img{
  width: 1080px;
  height: 2160px;
}
.left-top {
  width: 40px;
  position: absolute;
  z-index: 2;
  left: 14px;
  top: 8px;
  color: #c3ddfb;
  font-size: 12px;
  font-weight: 500;
  /* line-height: 47px; */
  background: #3b89ff;
}

.center-time {
  width: 40px;
  position: absolute;
  z-index: 2;
  color: #a3a3a3;
  top: 217.5px;
  font-size: 13px;
  height: 13px;
  line-height: 13px;
  left: 216px;
  display: inline-block;
  white-space: nowrap;
  //font-weight: bold;
  background: #fff;
}

.bottom-date {
  position: absolute;
  z-index: 2;
  left: 109px;
  top: 509px;
  color: #fff;
  font-size: 12px;
  background: #7b4ad9;
  height: 16px;
}

.address-bg{
  position: absolute;
  top: 182px;
  left: 0;
  right: 0;
  margin: auto;
  height: 30px;
  background: #fff;
  width: 200px;
  font-weight: 500;
  z-index: 1;
}
.address{
  color: #333;
  position: absolute;
  font-size: 21px;
  top: 182px;
  width: fit-content;
  left: 0;
  right: 0;
  margin: auto;
  height: 30px;
  font-weight: 500;
  z-index: 333;
}
</style>
