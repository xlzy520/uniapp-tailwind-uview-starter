<template>
  <view class="video-list-page">
    <view class="mb-2 layout-slide">
      <u-checkbox-group>
        <u-checkbox
          :checked="autoRefresh"
          label="自动刷新(1分钟)"
          name="autoRefresh"
          @change="changeAutoRefresh"
        ></u-checkbox>
      </u-checkbox-group>
      <view class="layout-items-center">
        <view class="text-12"> 在线人数提醒： </view>
        <u-input
          v-model="remindNum"
          class="w-8"
          type="number"
          :min="0"
          :max="100"
          :step="1"
          @change="changeRemindNum"
        />
      </view>
      <!--        <view class="text-12">共 {{ followList.length }} 个用户</view>-->
      <!--        <u-button @click="systemRing">测试系统铃声</u-button>-->
      <!--        <u-button @click="customRing">测试自定义铃声</u-button>-->
    </view>
    <view>
      <view class="layout-items-center">
        <view class="text-12"> 提醒音频链接： </view>
        <u-input
          class="u-border-bottom"
          required
          clearable
          v-model="audioUrl"
          placeholder="请输入提醒音频链接"
          @change="changeAudioUrl"
        />
      </view>
    </view>
    <view class="layout-slide">
      <!--      <u-button type="success" @click="getVideoStatsList">获取视频列表</u-button>-->
      <!--      <u-button type="success" @click="addVideo"> 添加视频 </u-button>-->
    </view>
    <view class="">
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
        <view class="video-upper"> 置顶 </view>
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
          <view
            class="video-title underline !text-blue-500"
            :class="item.message ? '!text-red-500' : ''"
            @click="openLink(item)"
          >
            {{
              item.message ? item.title + '(' + item.message + ')' : item.title
            }}
          </view>
          <view class="video-upper">
            <view
              v-if="item.upper"
              class="underline text-blue-500"
              @click="viewUpperDetail(item)"
            >
              存活(查看详情)
            </view>

            <view v-else>无</view>
            <view v-if="item.watchUpper" class="font-bold text-orange-500">
              【监控中】
            </view>
          </view>
          <view class="video-user-total text-overflow-hidden">
            <view class="flex">
              <u-tag :text="item.total" plain></u-tag>
            </view>
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
            <view class="layout-items-center">
              <view>
                <u-button
                  :type="item.watchUpper ? 'error' : 'primary'"
                  class="video-action-button"
                  :plain="true"
                  :hairline="true"
                  @click="watchUpper(index)"
                  :text="item.watchUpper ? '取消监控' : '监控置顶'"
                >
                </u-button>
              </view>

              <!--              <u-button-->
              <!--                v-if="item.watchUpper"-->
              <!--                type="primary"-->
              <!--                size="mini"-->
              <!--                class="video-action-button !h-8"-->
              <!--                :plain="true"-->
              <!--                :hairline="true"-->
              <!--                @click="autoPost(index)"-->
              <!--              >-->
              <!--                自动补置顶评论-->
              <!--              </u-button>-->
              <view class="ml-1">
                <u-button
                  type="error"
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
    </view>
    <u-modal
      :show="showUpperDetail"
      title="置顶评论详情"
      @confirm="showUpperDetail = false"
    >
      <view class="flex flex-col text-[18px]">
        <view class="break-all w-full">{{ currentUpper.message }}</view>
        <view v-if="currentUpper.pictures">
          <u-image
            v-for="imgSrc in currentUpper.pictures"
            :src="imgSrc"
            :key="imgSrc"
          ></u-image>
        </view>
      </view>
    </u-modal>
    <u-modal :show="!stopRing" title="警告" @confirm="stopRingNotice">
      <view class="flex flex-col text-[18px]">
        <view class="font-bold text-black">
          视频：【{{ warnVideoTitle }}】
        </view>
        <view class="font-bold text-red-600">
          {{ warnText }}
        </view>
      </view>
    </u-modal>
  </view>
</template>

<script>
import dayjs from 'dayjs';
import NoticeUtil from '@/utils/notice';
import {
  checkLicense,
  fetchVideoOnlineTotalInfo,
  fetchVideosByUsers,
  getReplyHot,
  getVideoInfo,
} from '@/api/bilibili';
import { DefaultCookie, pickKeysFromVideo } from '@/utils/constant';
import { isApp, showLoading, sleep } from '@/utils';
import { isEmpty, isString, pick } from 'lodash-es';

const innerAudioContext = uni.createInnerAudioContext();
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
      showUpperDetail: false,
      currentUpper: {},
      warnText: '',
      warnVideoTitle: '',
      remindNum: 30,
      audioUrl:
        'https://zhibi-share.oss-cn-shanghai.aliyuncs.com/bili-video-watch.mp3',
    };
  },
  onLoad() {
    const license = uni.getStorageSync('license');
    const licenseError = uni.getStorageSync('licenseError');
    if (!license || licenseError) {
      uni.navigateTo({
        url: '/pages/index/license',
      });
    } else {
      checkLicense(license)
        .then((res) => {
          this.license = true;
          this.getVideoStatsList();
        })
        .catch(() => {
          uni.setStorageSync('licenseError', 'true');
        });
    }
    const autoRefresh = uni.getStorageSync('autoRefresh');
    const remindNum = uni.getStorageSync('remindNum');
    const audioUrl = uni.getStorageSync('audioUrl');
    if (remindNum) {
      this.remindNum = remindNum;
    }
    if (audioUrl) {
      this.audioUrl = audioUrl;
    }
    if (autoRefresh !== '') {
      this.autoRefresh = autoRefresh;
    }
    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
  },
  onShow() {
    let videoList = uni.getStorageSync('videoList');
    if (videoList) {
      this.saveVideoList(videoList);
      if (isApp) {
        this.getVideoStatsList();
      }
    }
    if (!this.interval && this.autoRefresh) {
      this.startAutoRefresh();
    }
  },
  onHide() {
    clearInterval(this.interval);
    this.interval = null;
  },
  methods: {
    saveVideoList(videoList) {
      this.videoList = videoList;
      uni.setStorageSync('videoList', videoList);
    },
    changeRemindNum() {
      uni.setStorageSync('remindNum', this.remindNum);
    },
    stopRingNotice() {
      this.stopRing = true;
      innerAudioContext.stop();
    },
    viewUpperDetail(item) {
      this.currentUpper = item.upper;
      this.showUpperDetail = true;
    },
    openLink(item) {
      if (process.env.UNI_PLATFORM === 'h5') {
        window.open(`https://www.bilibili.com/video/${item.bvid}`);
        return;
      }
      // plus.runtime.openURL(`https://www.bilibili.com/video/${item.bvid}`);
      plus.runtime.openURL(`bilibili://video/${item.bvid}`);
    },
    watchUpper(index) {
      const item = this.videoList[index];
      if (item) {
        uni.showToast({
          title: item.watchUpper ? '取消监控成功' : '监控置顶成功',
          icon: 'none',
        });
      }
      item.watchUpper = !item.watchUpper;
      this.$set(this.videoList, index, item);
      this.saveVideoList(this.videoList);
    },
    autoPost(index) {
      uni.navigateTo({
        url: '/pages/cookie/index?videoIndex=' + index,
      });
    },
    removeVideo(index) {
      uni.showModal({
        title: '提示',
        content: '确定删除该视频吗？',
        success: (res) => {
          if (res.confirm) {
            this.videoList.splice(index, 1);
            this.saveVideoList(this.videoList);
          }
        },
      });
    },
    startAutoRefresh() {
      this.interval = setInterval(() => {
        this.getVideoStatsList();
        // }, 1000 * 20);
      }, 1000 * 60);
    },
    changeAutoRefresh(val) {
      console.log(val, '===========打印的 ------ changeAutoRefresh');
      this.autoRefresh = !this.autoRefresh;
      if (val) {
        this.startAutoRefresh();
      } else {
        clearInterval(this.interval);
        this.interval = null;
      }
      uni.setStorageSync('autoRefresh', this.autoRefresh);
    },
    changeAudioUrl() {
      uni.setStorageSync('audioUrl', this.audioUrl);
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
      innerAudioContext.autoplay = true;
      innerAudioContext.src = this.audioUrl; //铃声文件的路径
      innerAudioContext.onPlay(() => {
        console.log('开始播放');
      });
      innerAudioContext.play();
      NoticeUtil.aOSNotify('B站数据监控', '有新的警告，请前往APP查看');
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
      const promises = this.videoList.map(async (video, index) => {
        try {
          const videoInfo = await getVideoInfo(video.bvid, 'bvid');
          Object.assign(video, pick(videoInfo, pickKeysFromVideo));
          const hotReply = await getReplyHot(video.aid);
          const upper = hotReply.top.upper;
          if (upper) {
            const content = upper.content;
            const message = content.message;
            const pictures =
              content.pictures &&
              content.pictures.map((item) => {
                return item.img_src;
              });
            this.$set(video, 'upper', {
              mid: upper.mid,
              uname: upper.uname,
              avatar: upper.avatar,
              message,
              pictures,
            });
          } else {
            this.$set(this.videoList[index], 'upper', null);
            if (video.watchUpper) {
              this.stopRing = false;
              this.warnVideoTitle = video.title;
              this.warnText = `置顶丢失`;
              this.customRing(30);
            }
          }
          const totalInfo = await fetchVideoOnlineTotalInfo(
            video.aid,
            video.cid,
          );
          let total = totalInfo.total;
          if (isString(total) && total.includes('+')) {
            total = 1000;
          }
          video.total = total;
          if (video.total > Number(this.remindNum)) {
            this.stopRing = false;
            this.warnVideoTitle = video.title;
            this.warnText = `有 ${video.total} 人在线`;
            this.customRing(30);
          }
          await sleep(100);
          return video;
        } catch (err) {
          return {
            ...video,
            message: isEmpty(err) ? '' : err,
          };
        }
      });

      Promise.all(promises)
        .then((videoList) => {
          this.videoList = this.videoList
            .map((item, index) => {
              return {
                ...item,
                ...videoList[index],
              };
            })
            .sort((a, b) => {
              return b.total - a.total;
            });
          console.log(
            this.videoList,
            videoList,
            '===========打印的 ------ res',
          );
          // this.videoList = videoList;
          this.lastUpdateTimeForVideo = this.formatDate(new Date());
          this.saveVideoList(this.videoList);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          console.log(1, '===========打印的 ------ ');
          uni.hideLoading();
        });
    },
    addVideo() {
      uni.switchTab({
        url: '/pages/index/video-add',
      });
    },
    postUpperReply() {},
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

.video-length {
  margin-top: 5px;
}
.video-list-page {
  padding: 10px;
  margin-right: 10px;
}
.video-list {
  width: 96vw;
  overflow: auto;
  min-height: 80vh;
}
.video-item {
}
.video-item-title {
  font-size: 32upx;
  color: #333;
  font-weight: 500;
}

//#ifdef APP-PLUS
.video-title,
.video-author,
.video-view,
.video-user-total,
.video-upper,
.video-like,
.video-coin,
.video-action {
  font-size: 28upx;
  color: #666;
  margin-bottom: 20upx;
  padding-left: 20upx;
  width: 160upx;
  min-width: 160upx;
  flex: 0;
}
.video-view,
.video-user-total,
.video-like,
.video-coin {
  width: 120upx;
  min-width: 120upx;
}

.video-upper {
  width: 160upx;
  min-width: 160upx;
  flex: 0;
}

.video-title {
  width: 200upx;
  max-height: 200upx;
  overflow: hidden;
  text-overflow: ellipsis;
}
//#endif

// #ifdef H5

.video-title,
.video-author,
.video-view,
.video-user-total,
.video-upper,
.video-like,
.video-coin,
.video-action {
  font-size: 28upx;
  color: #666;
  margin-bottom: 20upx;
  padding-left: 20upx;
  flex: 2;
}

.video-like,
.video-coin {
  flex: 1;
}

.video-title {
  width: 10rem;
  max-height: 200upx;
  overflow: hidden;
  text-overflow: ellipsis;
}
//#endif
</style>
