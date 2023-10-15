<template>
  <view class="video-list-page">
    <view class="mb-2 layout-items-center">
      <video-add-dialog :video-list="videoList" />
      <video-import-dialog
        :video-list="videoList"
        @updateVideoList="addVideoList"
      />
      <set-keywords-dialog class="ml-1" />
      <update-dialog :hasUpdate="hasUpdate" />
      <el-tooltip
        content="根据视频数量，自动调整刷新间隔时间，视频越多，间隔时间越长，减少风控风险，超过100个视频，间隔时间为10分钟，超过60个视频，间隔时间为6分钟，以此类推"
      >
        <u-checkbox-group class="ml-1 font-bold text-black">
          <u-checkbox
            :checked="autoRefresh"
            :label="'定时刷新:' + intervalMinutes + '分钟'"
            name="autoRefresh"
            @change="changeAutoRefresh"
          ></u-checkbox>
        </u-checkbox-group>
      </el-tooltip>
      <div class="layout-items-center ml-1">
        <div class="text-[15px] font-bold">排序属性(↓)：</div>
        <el-select v-model="sortBy" @change="changeSortBy" class="w-6">
          <el-option
            v-for="item in sortFieldOptions"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
      <view class="layout-items-center ml-1">
        <view class="text-[15px] font-bold"> 在线人数提醒： </view>
        <u-input
          v-model="remindNum"
          class="w-4"
          type="number"
          :min="0"
          :max="100"
          :step="1"
          @change="changeRemindNum"
        />
      </view>
      <view class="" v-if="false">
        <el-button type="success">有更新(客户端有更新，立即下载)</el-button>
      </view>
      <import-and-export />
      <remove-record />
      <setting-dialog />
    </view>
    <div class="layout-items-center">
      <view
        class="text-[14px] font-bold text-pink-500 video-length layout-slide"
      >
        <view class=""> 共 {{ videoList.length }} 条视频 </view>
        <view class="ml-2">
          上次刷新时间：{{ formatDate(lastUpdateTimeForVideo) || '暂无' }}
        </view>
      </view>
    </div>
    <div class="layout-slide">
      <view class="layout-items-center">
        <el-button
          type="primary"
          :loading="searchLoading"
          @click="getVideoStatsList"
        >
          更新视频数据
        </el-button>
        <el-button
          :disabled="!selections.length"
          type="danger"
          @click="batchDeleteVideo"
        >
          批量删除
        </el-button>
        <!--        <el-button type="primary" @click="onProxySetting">-->
        <!--          IP代理配置(新增功能，预期：查询异常时，自动切换IP)-->
        <!--        </el-button>-->
      </view>

      <el-form :inline="true" :model="searchForm" class="flex search-form">
        <el-form-item label="视频标题">
          <el-input
            v-model="searchForm.title"
            placeholder="视频标题"
          ></el-input>
        </el-form-item>
        <el-form-item label="视频作者">
          <el-input
            v-model="searchForm.author"
            placeholder="视频作者"
          ></el-input>
        </el-form-item>
        <el-form-item label="投稿时间">
          <el-date-picker
            v-model="searchForm.ctime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">筛选</el-button>
          <el-button type="info" @click="onResetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <u-divider />
    <view class="video-list">
      <el-table
        :data="showVideoList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"> </el-table-column>
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
        <el-table-column label="置顶" width="160">
          <template slot-scope="{ row }">
            <div class="video-upper">
              <div
                v-if="row.upper"
                class="underline text-blue-500"
                @click="viewUpperDetail(row)"
              >
                存活(查看详情)
              </div>
              <div v-else>无</div>
              <div v-if="row.watchUpper" class="font-bold text-orange-500">
                【监控中】
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="在线" width="100" prop="total" sortable>
          <template slot-scope="{ row }">
            <div class="video-user-total">
              <div class="flex">
                <u-tag :text="row.total" plain></u-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="播放" width="120">
          <template slot-scope="{ row }">
            <div class="video-view">{{ row.stat && row.stat.view }}</div>
          </template>
        </el-table-column>
        <el-table-column label="点赞" width="120">
          <template slot-scope="{ row }">
            <div class="video-like">{{ row.stat && row.stat.like }}</div>
          </template>
        </el-table-column>
        <el-table-column label="投币" width="100">
          <template slot-scope="{ row }">
            <div class="video-coin">{{ row.stat && row.stat.coin }}</div>
          </template>
        </el-table-column>
        <el-table-column label="作者" width="120">
          <template slot-scope="{ row }">
            <div class="video-author">{{ row.owner && row.owner.name }}</div>
          </template>
        </el-table-column>
        <el-table-column label="投稿时间" width="120" sortable prop="ctime">
          <template slot-scope="{ row }">
            <div class="video-author">
              {{ row.ctime && formatDate(row.ctime * 1000) }}
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
                :type="row.watchUpper ? 'danger' : 'primary'"
                class="video-action-button"
                @click="watchUpper($index)"
              >
                {{ row.watchUpper ? '取消监控' : '监控置顶' }}
              </el-button>
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
              <el-button
                v-if="row.watchUpper || showUpdateSetTop"
                type="primary"
                size="mini"
                @click="showSetTopReplyConfig($index)"
              >
                补置顶
              </el-button>
              <el-button
                v-if="showUpdateSetTop"
                type="primary"
                size="mini"
                @click="updateSetTop($index)"
              >
                更新置顶
              </el-button>
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
    <set-top-reply-dialog
      v-if="setTopReplyVisible"
      :video="currentVideo"
      @close="setTopReplyVisible = false"
      @submit="onUpdateVideoConfig"
    />
  </view>
</template>

<script>
import {
  checkLicense,
  delDm,
  delReply,
  delReplyByVideoAndCookie,
  fetchVideoOnlineTotalInfo,
  getReplyHot,
  getVideoInfo,
  sendReply,
  setTopReply,
  uploadVideoList,
} from '@/api/bilibili';
import { pickKeysFromVideo, sortFieldOptions } from '@/utils/constant';
import { formatDate, sleep, getRecommendRefreshMinutes, isDev } from '@/utils';
import { isEmpty, isString, pick, get, isObject } from 'lodash-es';
import VideoAddDialog from './video-add-dialog.vue';
import delReplyDialog from './del-reply-dialog.vue';
import setKeywordsDialog from './set-keywords-dialog.vue';
import updateDialog from './update-dialog.vue';
import ImportAndExport from './importAndExport.vue';
import setCkDialog from './set-ck-dialog.vue';
import setTopReplyDialog from './set-top-reply-dialog.vue';
import { getReplyData } from '@/utils/reply';
import videoImportDialog from './video-import-dialog.vue';
import removeRecord from './removeRecord.vue';
import settingDialog from './setting-dialog.vue';

const innerAudioContext = uni.createInnerAudioContext();
export default {
  components: {
    ImportAndExport,
    VideoAddDialog,
    delReplyDialog,
    setKeywordsDialog,
    updateDialog,
    setCkDialog,
    setTopReplyDialog,
    videoImportDialog,
    removeRecord,
    settingDialog,
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
      intervalMinutes: 1,
      selections: [],
      searchForm: {},
      searchLoading: false,
      hasUpdate: false,
    };
  },
  computed: {
    currentVideo() {
      return this.videoList[this.currentVideoIndex];
    },
    showVideoList() {
      const searchForm = this.searchForm;
      console.log(searchForm, '===========打印的 ------ showVideoList');
      const title = searchForm.title;
      const author = searchForm.author;
      return this.videoList.filter((item) => {
        return (
          (!title || item.title.includes(title)) &&
          (!author || item.owner.name.includes(author)) &&
          (!searchForm.ctime ||
            (item.ctime >= searchForm.ctime[0].valueOf() / 1000 &&
              item.ctime <= searchForm.ctime[1].valueOf() / 1000))
        );
      });
    },
    showUpdateSetTop() {
      if (isDev) {
        return true;
      }
      return (
        this.license ===
        'b6c020b3131f66e314a3eb39d030c74bf7c0163336d7281726df28503961e796'
      );
    },
  },
  methods: {
    onResetSearch() {
      this.searchForm = {};
    },
    handleSelectionChange(val) {
      this.selections = val;
      console.log(val, '===========打印的 ------ handleSelectionChange');
    },
    onProxySetting() {
      this.$message.warning('开发中');
    },
    batchDeleteVideo() {
      const videoList = this.videoList;
      const selections = this.selections;
      const newVideoList = videoList.filter((item) => {
        return !selections.includes(item);
      });
      this.saveVideoList(newVideoList);
      this.$message.success('批量删除成功');
    },
    addVideoList(videoList) {
      this.saveVideoList(videoList);
      this.getVideoStatsList();
    },
    startDeleteReply() {
      const run = () => {
        const hour = new Date().getHours();
        // 如果是晚上12点到早上8点，30%的概率不删
        if (hour > 0 && hour <= 8) {
          const random = Math.random();
          if (random < 0.3) {
            return;
          }
        }
        const validVideoList = this.videoList.filter((item) => {
          return !['稿件不可见', '啥都木有'].includes(item.message);
        });
        validVideoList.forEach((video) => {
          if (video.deleteReply && video.cookie) {
            this.delReplyByVideoAndCookie(video);
            this.delDm(video);
          }
        });
      };
      run();
      clearInterval(this.deleteReplyInterval);
      this.deleteReplyInterval = null;
      this.deleteReplyInterval = setInterval(run, 1000 * 60);
    },
    delDm(video) {
      let keywords = localStorage.getItem('keywords');
      if (!keywords) {
        return;
      }
      keywords = keywords
        .split(',')
        .filter((item) => item)
        .join(',');
      const maxWords = localStorage.getItem('maxWords') || 30;
      return delDm({
        ...video,
        keywords,
        maxWords,
      })
        .then((res) => {
          console.log(res, '===========打印的 ------ ');
          if (res) {
            const { allCount, delCount } = res;
            if (allCount && delCount) {
              this.$message.success(
                '总弹幕数：' + allCount + '，删除弹幕数：' + delCount,
              );
            }
          }
        })
        .catch((err) => {
          console.log(err, '===========打印的 ------ ');
          const errMsg = String(err);
          if (errMsg.includes('激活失败')) {
            return;
          }
          uni.showModal({
            title: '提示',
            content: '视频：【' + video.title + '】 出现错误，错误信息：' + err,
            showCancel: false,
          });
        });
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
      return delReplyByVideoAndCookie({
        ...video,
        keywords,
        maxWords,
      })
        .then((res) => {
          const fullReplyList = res.fullReplyList;
          const successDelResult = res.delResult
            .filter((item) => {
              return item && item.code === 0;
            })
            .map((v) => {
              return {
                bvid: video.bvid,
                rpid: v.item.rpid,
                content: v.item.content.message,
                ctime: formatDate(v.item.ctime * 1000),
              };
            });
          if (successDelResult.length) {
            this.$message.success(
              '总评论数：' +
                fullReplyList.length +
                '，删除评论数：' +
                successDelResult.length,
            );
          }
          const index = this.videoList.findIndex((item) => {
            return item.aid === video.aid;
          });
          this.videoList.splice(index, 1, {
            ...video,
            replyCount: fullReplyList.length,
          });
        })
        .catch((err) => {
          const errMsg = String(err);
          if (errMsg.includes('激活失败')) {
            return;
          }
          uni.showModal({
            title: '提示',
            content: '视频：【' + video.title + '】 出现错误，错误信息：' + err,
            showCancel: false,
          });
        });
    },
    changeSortBy() {
      localStorage.setItem('sortBy', this.sortBy);
      if (this.sortBy === 'upper') {
        this.videoList = this.videoList.sort((a, b) => {
          const aValue = a.watchUpper ? (a.upper ? -1 : 1) : -1;
          const bValue = b.watchUpper ? (b.upper ? -1 : 1) : -1;
          return bValue - aValue;
        });
        return;
      }
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
    viewUpperDetail(item) {
      this.currentUpper = item.upper;
      this.showUpperDetail = true;
    },
    formatVideoTitle(video) {
      return video.message
        ? video.title + '(' + video.message + ')'
        : video.title;
    },
    openLink(item) {
      window.open(`https://www.bilibili.com/video/${item.bvid}`);
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
      const videoListLength = this.videoList.length;
      let minutes = getRecommendRefreshMinutes(videoListLength);
      const refreshInterval = localStorage.getItem('refreshInterval');
      if (refreshInterval > minutes) {
        minutes = refreshInterval;
      }
      this.intervalMinutes = minutes;
      this.interval = setInterval(() => {
        this.getVideoStatsList();
      }, 1000 * 60 * minutes);
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
    async getVideoStatsList(defaultVideo) {
      const licenseError = uni.getStorageSync('licenseError');
      if (!this.license || licenseError) {
        return;
      }
      if (this.videoList.length === 0) {
        return;
      }
      let errorVideoCount = 0;
      const updateVideoData = async (video) => {
        try {
          const videoInfo = await getVideoInfo(video.bvid, 'bvid', video.title);
          Object.assign(video, pick(videoInfo, pickKeysFromVideo));
          if (video.message) {
            video.message = '';
            this.saveVideoList(this.videoList);
          }
          await getReplyHot(video).then((hotReply) => {
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
                rpid: upper.rpid,
                message,
                pictures,
              });
            } else {
              this.$set(video, 'upper', null);
              if (video.watchUpper) {
                this.stopRing = false;
                this.warnVideoTitle = video.title;
                this.warnText = `置顶丢失`;
                this.customRing(30);
                if (!defaultVideo) {
                  this.addTopReply(video);
                }
              }
            }
          });

          // this.$message.success(`更新视频数据：${video.title} 成功`);

          return fetchVideoOnlineTotalInfo(video).then((totalInfo) => {
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
          });
        } catch (err) {
          let errMessage = isEmpty(err) ? '' : err;
          if (isObject(err)) {
            errMessage = '查询异常';
            errorVideoCount += 1;
            this.$set(video, 'upper', null);
          }
          if (errMessage === '查询异常' && errorVideoCount > 3) {
            errMessage =
              '多个视频查询异常，检查请求是否被拦截，请使用爱加速切换IP';
            this.stopRing = false;
            this.warnVideoTitle = '多个视频查询异常';
            this.warnText = `多个视频查询异常，检查请求是否被拦截，请使用爱加速切换IP`;
            this.customRing(3);
          }
          this.$set(video, 'message', errMessage);
          this.saveVideoList(this.videoList);
        }
      };
      const validVideoList = this.videoList.filter((item) => {
        if (defaultVideo) {
          return item.aid === defaultVideo.aid;
        }
        return !['稿件不可见', '啥都木有'].includes(item.message);
      });
      console.log(validVideoList, '===========打印的 ------ getVideoStatsList');
      this.searchLoading = true;
      for (const video of validVideoList) {
        await updateVideoData(video);
        await sleep(300);
      }
      this.changeSortBy();
      this.searchLoading = false;
      this.lastUpdateTimeForVideo = this.formatDate(new Date());
    },
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
      video.deleteReply = !video.deleteReply;
      this.videoList.splice(index, 1, video);
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
    showSetTopReplyConfig(index) {
      this.currentVideoIndex = index;
      this.setTopReplyVisible = true;
    },
    async addTopReply(video) {
      const topReply = video.topReply;
      if (!topReply) {
        return;
      }
      if (!topReply.message) {
        const message = `【${video.title}】请先配置该视频需要补充的置顶内容，否则无法自动补置顶`;
        this.$alert(message, '提示');
        return;
      }
      const cookie = video.cookie;
      if (!cookie) {
        const message = `【${video.title}】请先配置该视频作者的CK，否则无法自动补置顶`;
        this.$alert(message, '提示');
        return;
      }
      const { message, pictures } = await getReplyData(topReply);
      return sendReply({
        oid: video.aid,
        cookie: topReply.cookie,
        message,
        pictures,
      })
        .then(async (res) => {
          await sleep(1000);
          setTopReply({
            ...video,
            oid: video.aid,
            rpid: res.rpid,
          }).then((res) => {
            this.$alert(`【${video.title}】补置顶成功`, '提示');
            this.stopRing = true;
            this.getVideoStatsList(video);
          });
        })
        .catch((err) => {
          console.log(err, '===========打印的 ------ ');
        });
    },
    updateSetTop(index) {
      const video = this.videoList[index];
      const cookie = video.cookie;
      if (!cookie) {
        const message = `【${video.title}】请先配置该视频作者的CK，否则无法自动补置顶`;
        this.$message.error(message);
        return;
      }
      const upper = video.upper;
      if (!upper) {
        this.$message.error('该视频没有置顶');
        return;
      }
      delReply(video).then(() => {
        this.$message.success('删除置顶成功');
        this.addTopReply(video);
      });
    },
  },
  mounted() {
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
    let videoList = uni.getStorageSync('videoList');
    if (videoList) {
      this.videoList = videoList;
    }
    const license = uni.getStorageSync('license');
    const licenseError = uni.getStorageSync('licenseError');
    checkLicense(license)
      .then((res) => {
        this.license = license;
        const version = res.version;
        const currentVersion = res.currentVersion;
        if (version !== currentVersion) {
          this.hasUpdate = true;
        }
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
    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
    this.startDeleteReply();
    setInterval(() => {
      uploadVideoList();
    }, 1000 * 60 * 60 * 2);
  },
  onShow() {
    // this.startAutoRefresh();
  },
};
</script>

<style lang="scss">
@import 'index';
</style>
