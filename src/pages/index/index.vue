<template>
  <view class="video-list-page">
    <view class="mb-2">
      <u-checkbox-group>
        <u-checkbox
          :checked="autoRefresh"
          label="自动刷新(10分钟)"
          name="autoRefresh"
          @change="changeAutoRefresh"
        ></u-checkbox>
      </u-checkbox-group>
    </view>
    <view>
      <!--        <u-button @click="systemRing">测试系统铃声</u-button>-->
      <!--        <u-button @click="customRing">测试自定义铃声</u-button>-->
    </view>
    <view class="">
      <u-button type="primary" @click="getVideoList">刷新视频数据</u-button>
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
      </view>
      <view
        v-for="(item, index) in videoList"
        :key="item.bvid"
        class="video-item"
      >
        <view class="user-item layout-items-center">
          <view class="video-title">
            {{ item.title }}
          </view>
          <view class="video-user-total text-overflow-hidden">
            {{ item.onlineTotal }}
          </view>
          <view class="video-view">
            {{ item.view }}
          </view>
          <view class="video-like">
            {{ item.like }}
          </view>
          <view class="video-coin">
            {{ item.coin }}
          </view>
          <view class="video-author text-overflow-hidden">
            {{ item.uname }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import dayjs from 'dayjs';
import { checkLicense, fetchVideosByUsers } from '@/api/bilibili';
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
      this.getVideoList();
    });
    const autoRefresh = uni.getStorageSync('autoRefresh');
    console.log(autoRefresh, '===========打印的 ------ onShow');
    this.autoRefresh = !!autoRefresh;
    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
  },
  onShow() {
    const followList = uni.getStorageSync('followList');
    if (followList) {
      this.followList = JSON.parse(followList);
      this.updateVideoList();
    }
    const lastUpdateTimeForVideo = uni.getStorageSync('lastUpdateTimeForVideo');
    if (lastUpdateTimeForVideo) {
      this.lastUpdateTimeForVideo = lastUpdateTimeForVideo;
    }
    console.log(this.videoList, this.followList);
  },
  methods: {
    startAutoRefresh() {
      this.interval = setInterval(() => {
        this.getVideoList();
        // }, 1000 * 20);
      }, 1000 * 60 * 10);
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
        'https://zhibi-share.oss-cn-shanghai.aliyuncs.com/1638.mp3'; //铃声文件的路径
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
    fetchUserVideos(users) {
      return fetchVideosByUsers(users, this.cookie)
        .then((data) => {
          console.log(data, '===========打印的 ------ ');
          uni.showToast({
            title: '获取视频列表成功',
            icon: 'none',
          });
          const list = data || [];
          list.forEach((v) => {
            const index = this.followList.findIndex(
              (item) => item.mid === v.mid,
            );
            if (index > -1) {
              this.$set(this.followList[index], 'videos', v.videos || []);
            }
          });
          this.updateVideoList();
        })
        .catch((err) => {
          uni.showToast({
            title: err.msg || `获取视频列表失败`,
            icon: 'none',
          });
          throw new Error(err.message);
        });
    },
    async getVideoList() {
      if (!this.license) {
        return;
      }
      if (!this.cookie) {
        uni.showModal({
          title: '提示',
          content: '请先填写cookie',
          showCancel: false,
        });
        return;
      }
      if (this.followList.length === 0) {
        uni.showModal({
          title: '提示',
          content: '请先填写关注列表',
          showCancel: false,
        });
        return;
      }
      const now = new Date();
      const lastUpdateTime = new Date(this.lastUpdateTimeForVideo);
      if (
        this.lastUpdateTimeForVideo &&
        now.getTime() - lastUpdateTime.getTime() < 60 * 1000
      ) {
        uni.showToast({
          title: '一分钟内不重复获取视频列表',
          icon: 'none',
        });
        return;
      }
      showLoading('获取视频列表中...');
      const users = this.followList
        .map((v) => {
          return {
            mid: v.mid,
            uname: v.uname,
          };
        })
        .slice(0, 100);
      this.fetchUserVideos(users)
        .then((res) => {
          uni.showToast({
            title: '获取视频列表成功',
            icon: 'none',
          });
          uni.setStorageSync('followList', JSON.stringify(this.followList));
          this.updateVideoList();
          this.lastUpdateTimeForVideo = Date.now();
          uni.setStorageSync(
            'lastUpdateTimeForVideo',
            this.lastUpdateTimeForVideo,
          );
        })
        .finally(() => {
          uni.hideLoading();
        });
    },
    updateVideoList() {
      const list = [];
      let hasHotVideo = false;
      this.followList.forEach((v) => {
        if (v.videos) {
          v.videos.forEach((video) => {
            const onlineTotal = video.total && video.total.total;
            if (onlineTotal > 30) {
              hasHotVideo = true;
            }
            list.push({
              ...video,
              onlineTotal: video.total && video.total.total,
              view: video.stat && video.stat.view,
              like: video.stat && video.stat.like,
              reply: video.stat && video.stat.reply,
              coin: video.stat && video.stat.coin,
              favorite: video.stat && video.stat.favorite,
              mid: v.mid,
              uname: v.uname,
            });
          });
        }
      });
      if (hasHotVideo) {
        this.stopRing = false;
        this.customRing(30);
      }
      if (this.isVideoSort) {
        this.videoList = list.sort((a, b) => {
          const aTotal = Number(String(a.onlineTotal).replace('+', ''));
          const bTotal = Number(String(b.onlineTotal).replace('+', ''));
          if (aTotal > bTotal) {
            return -1;
          } else if (aTotal < bTotal) {
            return 1;
          } else {
            return 0;
          }
        });
      }
      this.videoList = list;
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
.video-coin {
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
</style>
