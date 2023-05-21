<template>
  <view class="video-list-page">
    <view class="mb-2 layout-slide">
      <u-checkbox-group>
        <u-checkbox
          :checked="autoRefresh"
          label="自动刷新(10分钟)"
          name="autoRefresh"
          @change="changeAutoRefresh"
        ></u-checkbox>
      </u-checkbox-group>
      <view>
        <view class="text-12">共 {{ followList.length }} 个用户</view>
        <!--        <u-button @click="systemRing">测试系统铃声</u-button>-->
        <!--        <u-button @click="customRing">测试自定义铃声</u-button>-->
      </view>
    </view>
    <view class="layout-slide">
      <!--      <u-button type="success" @click="getVideoStatsList">获取视频列表</u-button>-->
      <u-button type="success" @click="addVideo"> 添加视频 </u-button>
    </view>
    <view class="mt-2">
      <u-button type="primary" @click="getVideoStatsList">
        查询视频热度
      </u-button>
    </view>
    <view class="text-12 video-length layout-slide">
      <view class="">共 {{ videoList.length }} 条视频</view>
      <view class="">
        上次刷新时间：{{ formatDate(lastUpdateTimeForVideo) }}
      </view>
    </view>
    <u-divider />
    <view class="video-list">
      <view class="video-item video-item-title layout-items-center">
        <view class="video-title"> 视频 </view>
        <view class="video-user-total"> 在线 </view>
        <view class="video-view"> 播放 </view>
        <view class="video-like"> 点赞 </view>
        <view class="video-coin"> 投币 </view>
        <view class="video-author"> 作者 </view>
        <view class="video-action"> 操作 </view>
      </view>
      <view
        v-for="(item, index) in videoList"
        :key="item.bvid"
        class="video-item"
      >
        <view class="user-item layout-items-center">
          <view class="video-title" @click="openLink(item)">
            {{ item.title }}
          </view>
          <view class="video-user-total text-overflow-hidden">
            {{ item.total }}
          </view>
          <view class="video-view">
            {{ item.stat && item.stat.view }}
          </view>
          <view class="video-like">
            {{ item.stat && item.stat.like }}
          </view>
          <view class="video-coin">
            {{ item.stat && item.stat.coin }}
          </view>
          <view class="video-author text-overflow-hidden">
            {{ item.owner && item.owner.name }}
          </view>
          <view class="video-action">
            <u-button
              type="error"
              size="mini"
              class="video-action-button"
              :plain="true"
              :hairline="true"
              @click="removeVideo(index)"
            >
              删除
            </u-button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import dayjs from 'dayjs';
import {
  checkLicense,
  fetchVideoOnlineTotalInfo,
  fetchVideosByUsers,
  getVideoInfo,
} from '@/api/bilibili';
import { DefaultCookie } from '@/utils/constant';
import { showLoading } from '@/utils';

export default {
  components: {},
  data() {
    return {
      list: [],
      followList: [],
      isVideoSort: true,
      cookie: DefaultCookie,
      lastUpdateTimeForVideo: '',
      videoList: [],
      autoRefresh: true,
      interval: null,
      license: false,
      stopRing: true,
    };
  },
  computed: {},
  onLoad() {
    checkLicense().then((res) => {
      this.license = true;
      this.getVideoStatsList();
    });
    const autoRefresh = uni.getStorageSync('autoRefresh');
    console.log(autoRefresh, '===========打印的 ------ onShow');
    this.autoRefresh = !!autoRefresh;
    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
  },
  onShow() {
    const videoList = uni.getStorageSync('videoList');
    if (videoList) {
      this.videoList = JSON.parse(videoList);
    }
  },
  methods: {
    openLink(item) {
      plus.runtime.openURL(`https://www.bilibili.com/video/${item.bvid}`);
    },
    removeVideo(index) {
      this.videoList.splice(index, 1);
      uni.setStorageSync('videoList', JSON.stringify(this.videoList));
    },
    startAutoRefresh() {
      this.interval = setInterval(() => {
        this.getVideoStatsList();
        // }, 1000 * 20);
      }, 1000 * 30 * 10);
    },
    changeAutoRefresh(val) {
      console.log(val, '===========打印的 ------ changeAutoRefresh');
      this.autoRefresh = !this.autoRefresh;
      if (!this.autoRefresh) {
        this.startAutoRefresh();
      } else {
        clearInterval(this.interval);
        this.interval = null;
      }
      uni.setStorageSync('autoRefresh', this.autoRefresh);
    },
    systemRing() {
      let main = plus.android.runtimeMainActivity();
      let RingtoneManager = plus.android.importClass(
        'android.media.RingtoneManager',
      );
      let uri = RingtoneManager.getActualDefaultRingtoneUri(
        main,
        RingtoneManager.TYPE_NOTIFICATION,
      );
      let MediaPlayer = plus.android.importClass('android.media.MediaPlayer');
      let player = MediaPlayer.create(main, uri);
      player.setLooping(false);
      player.prepare();
      player.start();
    },
    customRing(count) {
      if (count === 0) {
        return;
      }
      const innerAudioContext = uni.createInnerAudioContext();
      innerAudioContext.autoplay = true;
      innerAudioContext.src =
        'https://zhibi-share.oss-cn-shanghai.aliyuncs.com/bili-video-watch.mp3'; //铃声文件的路径
      innerAudioContext.onPlay(() => {
        console.log('开始播放');
      });
      innerAudioContext.onError((res) => {
        console.log(res.errMsg);
        console.log(res.errCode);
      });
      innerAudioContext.onEnded(() => {
        console.log('播放结束');
        if (!this.stopRing) {
          this.customRing(count - 1);
        }
      });
    },
    formatDate(time) {
      if (time) {
        return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
      }
      return '';
    },
    async getVideoStatsList() {
      if (!this.license) {
        return;
      }
      if (this.videoList.length === 0) {
        return;
      }
      showLoading('获取数据中...');
      const videoList = this.videoList;
      videoList.forEach((video, index) => {
        getVideoInfo(video.bvid, 'bvid').then((res) => {
          Object.assign(video, res);
        });
        fetchVideoOnlineTotalInfo(video.aid, video.cid)
          .then((total) => {
            video.total = total.total;
            if (video.total > 30) {
              console.log(1, '===========打印的 ------ ');
              this.stopRing = false;
              this.customRing(30);
            }
            if (this.isVideoSort) {
              this.videoList = this.videoList.sort((a, b) => {
                return b.total - a.total;
              });
            }
          })
          .finally(() => {
            if (index === videoList.length - 1) {
              uni.hideLoading();
              this.lastUpdateTimeForVideo = this.formatDate(new Date());
            }
          });
      });
    },
    addVideo() {
      uni.navigateTo({
        url: '/pages/index/video-add',
      });
    },
    updateVideoList() {
      const list = this.videoList;

      this.videoList = list;
      uni.setStorageSync('videoList', JSON.stringify(this.videoList));
    },
  },
};
</script>

<style lang="scss">
.test-header {
  background: #3b89ff;
  color: #fff;
  font-size: 20px;
  text-align: center;
  line-height: 50px;
}
.text-12 {
  font-size: 12px;
}
.text-16 {
  font-size: 16px;
}
.video-length {
  margin-top: 5px;
}
.video-list-page {
  padding: 10px;
  margin-right: 10px;
}
.video-list {
  width: 100vw;
  overflow: auto;
  min-height: 600px;
}
.video-item {
}
.video-item-title {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.video-title,
.video-author,
.video-view,
.video-user-total,
.video-like,
.video-coin,
.video-action {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  padding-left: 10px;
  width: 80px;
  min-width: 80px;
  flex: 0;
}
.video-view,
.video-user-total,
.video-like,
.video-coin {
  width: 60px;
  min-width: 60px;
}

.video-title {
  width: 100px;
}
.video-action {
  width: 400px;
}
.video-action-button {
  width: 100upx;
  padding-left: 0;
  margin-left: 0;
}
</style>
