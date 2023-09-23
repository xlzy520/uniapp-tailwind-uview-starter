<template>
  <view class="video-list-page">
    <view class="mb-2 layout-items-center">
      <video-import-dialog
        :video-list="videoList"
        @updateVideoList="addVideoList"
      />
      <set-keywords-dialog class="ml-1" />
      <update-dialog />
      <u-checkbox-group class="ml-1 font-bold text-black">
        <u-checkbox
          :checked="autoRefresh"
          label="自动刷新(1分钟)"
          name="autoRefresh"
          @change="changeAutoRefresh"
        ></u-checkbox>
      </u-checkbox-group>
      <import-and-export />
      <remove-record />
    </view>
    <view class="">
      <u-button type="primary" @click="getVideoStatsList">
        查询视频热度
      </u-button>
    </view>
    <view class="text-[14px] font-bold text-pink-500 video-length layout-slide">
      <view class=""> 共 {{ videoList.length }} 条视频 </view>
      <view class="">
        上次刷新时间：{{ formatDate(lastUpdateTimeForVideo) }}
      </view>
    </view>
    <u-divider />
    <view class="video-list">
      <el-table :data="videoList" style="width: 100%">
        <el-table-column label="视频" width="300">
          <template slot-scope="{ row }">
            <el-tooltip :content="formatVideoTitle(row)">
              <div
                class="video-title underline"
                :class="[row.message ? '!text-red-500' : '!text-blue-500']"
                @click="openLink(row)"
              >
                {{ formatVideoTitle(row) }}
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="播放" width="120">
          <template slot-scope="{ row }">
            <div class="video-view">{{ row.playCount }}</div>
          </template>
        </el-table-column>
        <el-table-column label="点赞" width="120">
          <template slot-scope="{ row }">
            <div class="video-like">{{ row.likeCount }}</div>
          </template>
        </el-table-column>
        <el-table-column label="评论数" width="120">
          <template slot-scope="{ row }">
            <div class="video-like">{{ row.commentCount }}</div>
          </template>
        </el-table-column>
        <!--        <el-table-column label="作者" width="120">-->
        <!--          <template slot-scope="{ row }">-->
        <!--            <div class="video-author">{{ row.owner && row.owner.name }}</div>-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <el-table-column label="投稿时间" width="120">
          <template slot-scope="{ row }">
            <div class="video-author">
              {{ row.uploadTimeText }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="删评" width="100">
          <template slot-scope="{ row }">
            <div class="">
              {{ row.deleteReply ? '删评中' : '' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="">
          <template slot-scope="{ row, $index }">
            <div class="video-action">
              <el-button
                size="mini"
                type="primary"
                @click="showCKConfigDialog($index)"
              >
                CK配置
              </el-button>
              <el-tooltip content="删除符合关键词的评论和弹幕">
                <el-button
                  size="mini"
                  :type="row.deleteReply ? 'danger' : 'primary'"
                  @click="changeDeleteReply($index)"
                >
                  {{ row.deleteReply ? '关闭删评' : '启动删评' }}
                </el-button>
              </el-tooltip>
              <el-popconfirm
                class="ml-[5px]"
                title="确定删除该视频吗？"
                @confirm="removeVideo($index)"
              >
                <el-button
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                ></el-button>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
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
    <set-ck-dialog
      v-if="addCkVisible"
      :video="currentVideo"
      @close="addCkVisible = false"
      @submit="onUpdateVideoConfig"
    />
  </view>
</template>

<script>
import { deleteCommentListByPhoto, getPhotoList } from '@/api/ks';
import { checkLicense } from '@/api/auth';
import { pickKeysFromVideo, sortFieldOptions } from '@/utils/constant';
import { formatDate, sleep, getImgSize } from '@/utils';
import { isEmpty, isString, pick, get, uniqBy } from 'lodash-es';
import VideoAddDialog from './video-add-dialog.vue';
import setKeywordsDialog from './set-keywords-dialog.vue';
import updateDialog from './update-dialog.vue';
import ImportAndExport from './importAndExport.vue';
import setCkDialog from './set-ck-dialog.vue';
import { getReplyData } from '@/utils/reply';
import videoImportDialog from './video-import-dialog.vue';
import removeRecord from './removeRecord.vue';

const innerAudioContext = uni.createInnerAudioContext();
export default {
  components: {
    ImportAndExport,
    VideoAddDialog,
    setKeywordsDialog,
    updateDialog,
    setCkDialog,
    videoImportDialog,
    removeRecord,
  },
  data() {
    return {
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
      currentVideoIndex: 0,
      addCkVisible: false,
      deleteReplyInterval: null,
      sortBy: 'total',
      sortFieldOptions,
      setTopReplyVisible: false,
    };
  },
  computed: {
    currentVideo() {
      return this.videoList[this.currentVideoIndex];
    },
  },
  methods: {
    addVideoList(videoList) {
      this.saveVideoList(videoList);
      this.getVideoStatsList();
    },
    startDeleteReply() {
      const run = () => {
        const validVideoList = this.videoList.filter((item) => {
          return true;
          return !['稿件不可见', '啥都木有'].includes(item.message);
        });
        console.log(validVideoList, '===========打印的 ------ validVideoList');
        validVideoList.forEach((video) => {
          if (video.deleteReply && video.cookie) {
            this.delReplyByVideoAndCookie(video);
          }
        });
      };
      run();
      clearInterval(this.deleteReplyInterval);
      this.deleteReplyInterval = null;
      this.deleteReplyInterval = setInterval(run, 1000 * 35);
    },
    delReplyByVideoAndCookie(video) {
      let keywords = localStorage.getItem('keywords');
      if (!keywords) {
        return;
      }
      keywords = keywords
        .split(',')
        .filter((item) => item)
        .join(',');
      const maxWords = localStorage.getItem('maxWords') || 30;
      return deleteCommentListByPhoto({
        ...video,
        keywords,
        maxWords,
      })
        .then((res) => {
          if (res.data.length) {
            this.$message.success('删除评论数：' + res.data.length);
          }
        })
        .catch((err) => {
          uni.showModal({
            title: '提示',
            content: '视频：【' + video.title + '】 出现错误，错误信息：' + err,
            showCancel: false,
          });
        });
    },
    changeSortBy() {
      localStorage.setItem('sortBy', this.sortBy);
      this.videoList = this.videoList.sort((a, b) => {
        const aProp = get(a, this.sortBy);
        const bProp = get(b, this.sortBy);
        return bProp - aProp;
      });
    },
    saveVideoList(videoList) {
      this.videoList = videoList;
      this.changeSortBy();
      uni.setStorageSync('videoList', videoList);
    },
    changeRemindNum() {
      uni.setStorageSync('remindNum', this.remindNum);
    },
    stopRingNotice() {
      this.stopRing = true;
      innerAudioContext.stop();
    },
    formatVideoTitle(video) {
      const title = video.title || '未填写标题';
      return video.message ? title + '(' + video.message + ')' : title;
    },
    openLink(item) {
      window.open(`https://www.kuaishou.com/short-video/${item.photoId}`);
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
    removeVideo(index) {
      this.videoList.splice(index, 1);
      this.saveVideoList(this.videoList);
    },
    startAutoRefresh() {
      clearInterval(this.interval);
      this.interval = setInterval(() => {
        this.getVideoStatsList();
      }, 1000 * 60);
    },
    changeAutoRefresh(val) {
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
      innerAudioContext.onError((res) => {
        alert('播放错误, 检查填写的音频链接能否正常打开');
        console.log(res);
      });
      innerAudioContext.onEnded(() => {
        console.log('播放结束');
        if (!this.stopRing) {
          this.customRing(count - 1);
        }
      });
    },
    formatDate,
    async getVideoStatsList() {
      const licenseError = uni.getStorageSync('licenseError');
      if (!this.license || licenseError) {
        return;
      }
      if (this.videoList.length === 0) {
        return;
      }
      const updateVideoData = async (photo) => {
        try {
          const { photoList } = await getPhotoList(photo.cookie);
          photoList.forEach((photo) => {
            const index = this.videoList.findIndex(
              (item) => photo.photoId === item.photoId,
            );
            if (index > -1) {
              this.videoList.splice(index, 1, {
                ...this.videoList[index],
                ...photoList[index],
              });
            }
          });
          await sleep(100);
        } catch (err) {
          const errMessage = isEmpty(err) ? '' : err;
          this.$set(photo, 'message', errMessage);
          this.saveVideoList(this.videoList);
        }
      };
      const validVideoList = this.videoList.filter((item) => {
        return item.cookie;
      });
      const uniqVideoCookieList = uniqBy(validVideoList, 'cookie');
      for (const photo of uniqVideoCookieList) {
        await updateVideoData(photo);
      }
      // this.changeSortBy();
      this.lastUpdateTimeForVideo = this.formatDate(new Date());
    },
    postUpperReply() {},
    changeDeleteReply(index) {
      const video = this.videoList[index];
      if (!video.deleteReply && !video.cookie) {
        uni.showToast({
          title: '请先配置该视频作者的CK',
          icon: 'none',
        });
        return;
      }
      const keywords = localStorage.getItem('keywords');
      if (!keywords) {
        uni.showToast({
          title: '请先设置删评关键词',
          icon: 'none',
        });
        return;
      }
      this.$set(video, 'deleteReply', !video.deleteReply);
      this.videoList.splice(index, 1, { ...video });
      this.saveVideoList(this.videoList);
      if (video.deleteReply) {
        this.startDeleteReply();
      }
    },
    showCKConfigDialog(index) {
      this.currentVideoIndex = index;
      this.addCkVisible = true;
    },
    onUpdateVideoConfig(config) {
      const video = {
        ...this.videoList[this.currentVideoIndex],
        ...config,
      };
      this.videoList.splice(this.currentVideoIndex, 1, video);
      this.saveVideoList(this.videoList);
      this.addCkVisible = false;
      this.setTopReplyVisible = false;
      this.$message.success('设置成功');
    },
  },
  mounted() {
    const license = uni.getStorageSync('license');
    const licenseError = uni.getStorageSync('licenseError');
    checkLicense(license)
      .then((res) => {
        this.license = true;
        this.getVideoStatsList();
      })
      .catch(() => {
        clearInterval(this.deleteReplyInterval);
        this.deleteReplyInterval = null;
        uni.setStorageSync('licenseError', 'true');
        uni.navigateTo({
          url: '/pages/index/license',
        });
      });
    const autoRefresh = uni.getStorageSync('autoRefresh');
    const remindNum = uni.getStorageSync('remindNum');
    const audioUrl = uni.getStorageSync('audioUrl');
    const sortBy = localStorage.getItem('sortBy');
    if (sortBy) {
      this.sortBy = sortBy;
    }
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
    let videoList = uni.getStorageSync('videoList');
    if (videoList) {
      this.videoList = videoList;
      this.startDeleteReply();
    }
  },
  onShow() {
    // this.startAutoRefresh();
  },
};
</script>

<style lang="scss">
@import 'index';
</style>
