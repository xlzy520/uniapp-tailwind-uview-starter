<template>
  <view class="video-list-page">
    <view class="mb-2 layout-items-center">
      <video-add-dialog :video-list="videoList" />
      <set-keywords-dialog class="ml-2" />
      <update-dialog />
      <u-checkbox-group class="ml-2">
        <u-checkbox
          :checked="autoRefresh"
          label="自动刷新(1分钟)"
          name="autoRefresh"
          @change="changeAutoRefresh"
        ></u-checkbox>
      </u-checkbox-group>
      <div class="layout-items-center mx-2">
        <div class="text-[15px] mr-1">排序属性(从高到低)</div>
        <el-select v-model="sortBy" @change="changeSortBy">
          <el-option
            v-for="item in sortFieldOptions"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
      <view class="layout-items-center ml-1">
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
      <view class="" v-if="false">
        <el-button type="success">有更新(客户端有更新，立即下载)</el-button>
      </view>
      <import-and-export />

      <!--      <el-button @click="delReplyByVideoAndCookie">触发删评</el-button>-->

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
      <view class=""> 上次刷新时间：{{ lastUpdateTimeForVideo }} </view>
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
        <el-table-column label="置顶">
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
        <el-table-column label="在线">
          <template slot-scope="{ row }">
            <div class="video-user-total">
              <div class="flex">
                <u-tag :text="row.total" plain></u-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="播放">
          <template slot-scope="{ row }">
            <div class="video-view">{{ row.stat && row.stat.view }}</div>
          </template>
        </el-table-column>
        <el-table-column label="点赞">
          <template slot-scope="{ row }">
            <div class="video-like">{{ row.stat && row.stat.like }}</div>
          </template>
        </el-table-column>
        <el-table-column label="投币">
          <template slot-scope="{ row }">
            <div class="video-coin">{{ row.stat && row.stat.coin }}</div>
          </template>
        </el-table-column>
        <el-table-column label="作者">
          <template slot-scope="{ row }">
            <div class="video-author">{{ row.owner && row.owner.name }}</div>
          </template>
        </el-table-column>
        <el-table-column label="是否删评">
          <template slot-scope="{ row }">
            <div class="">
              {{ row.deleteReply ? '删评中' : '' }}
              <!--              {{ row.replyCount ? '(共' + row.replyCount + '条)' : '' }}-->
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="400">
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
              <el-button size="mini" type="primary" @click="setCK($index)">
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

              <!--              <el-button-->
              <!--                size="mini"-->
              <!--                class="!mt-[10px]"-->
              <!--                type="primary"-->
              <!--                @click="showDelReplyLog($index)"-->
              <!--              >-->
              <!--                删评日志-->
              <!--              </el-button>-->
              <!-- <u-button v-if="row.watchUpper" type="primary" size="mini" class="video-action-button !h-8" :plain="true" :hairline="true" @click="autoPost($index)">
                自动补置顶评论
              </u-button> -->
              <el-button
                size="mini"
                type="danger"
                class="video-action-button"
                @click="removeVideo($index)"
              >
                删除
              </el-button>
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
    <el-dialog
      title="配置该视频的UP的CK"
      :visible.sync="addCkVisible"
      width="60%"
    >
      <div class="">
        CK 获取方式：
        <div class="text-red-500">
          如果你安装了我的插件，那么可以直接点击【复制CK】按钮
        </div>
        <div class="text-red-500">
          如果没有安装，那么需要看下面的教程
          <a
            href="https://www.yuque.com/xlzy520/doc/ifqklkxxxf3cq8is?singleDoc#"
          >
            《B站获取CK教程》
          </a>
        </div>
      </div>
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="200px"
        label-position="top"
      >
        <el-form-item label="cookie">
          <el-input
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 4 }"
            v-model.trim="form.cookie"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmitCK">确定</el-button>
          <el-button @click="addCkVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <delReplyDialog
      v-if="delReplyLogVisible"
      :log-list="delLogList"
      @close="delReplyLogVisible = false"
    />
  </view>
</template>

<script>
import {
  checkLicense,
  delDm,
  delReplyByVideoAndCookie,
  fetchVideoOnlineTotalInfo,
  getReplyHot,
  getVideoInfo,
} from '@/api/bilibili';
import { DefaultCookie, pickKeysFromVideo } from '@/utils/constant';
import { formatDate, showLoading, sleep, aooxus } from '@/utils';
import { isEmpty, isString, pick, get } from 'lodash-es';
import VideoAddDialog from './video-add-dialog.vue';
import delReplyDialog from './del-reply-dialog.vue';
import setKeywordsDialog from './set-keywords-dialog.vue';
import updateDialog from './update-dialog.vue';
import ImportAndExport from '@/pages/index/importAndExport.vue';

const innerAudioContext = uni.createInnerAudioContext();
export default {
  components: {
    ImportAndExport,
    VideoAddDialog,
    delReplyDialog,
    setKeywordsDialog,
    updateDialog,
  },
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
      currentVideoIndex: {},
      addCkVisible: false,
      form: {},
      rules: {
        cookie: [
          {
            required: true,
            message: '请输入CK',
            trigger: 'blur',
          },
        ],
      },
      deleteReplyInterval: null,
      delReplyLogVisible: false,
      delReplyLog: {},
      sortBy: 'total',
      sortFieldOptions: [
        { text: '在线人数', value: 'total' },
        { text: '播放量', value: 'stat.view' },
        { text: '点赞数', value: 'stat.like' },
        { text: '投币数', value: 'stat.coin' },
      ],
    };
  },
  computed: {
    delLogList() {
      const video = this.videoList[this.currentVideoIndex];
      return this.delReplyLog[video.aid] || [];
    },
  },
  methods: {
    startDeleteReply() {
      const run = () => {
        this.videoList.forEach((video) => {
          if (video.deleteReply && video.cookie) {
            this.delReplyByVideoAndCookie(video);
            this.delDm(video);
          }
        });
      };
      run();
      clearInterval(this.deleteReplyInterval);
      this.deleteReplyInterval = null;
      this.deleteReplyInterval = setInterval(run, 1000 * 15);
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
          const { allCount, delCount } = res;

          if (allCount && delCount) {
            this.$message.success(
              '总弹幕数：' + allCount + '，删除弹幕数：' + delCount,
            );
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
            if (!this.delReplyLog[video.aid]) {
              this.delReplyLog[video.aid] = [];
            }
            this.delReplyLog[video.aid].push(...successDelResult);
          }
          console.log(this.delReplyLog, '===========打印的 ------ ');
          const index = this.videoList.findIndex((item) => {
            return item.aid === video.aid;
          });
          this.videoList.splice(index, 1, {
            ...video,
            replyCount: fullReplyList.length,
          });
          console.log(this.videoList);
          console.log(res, '===========打印的 ------ ');
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
      const updateVideoData = async (video) => {
        try {
          const videoInfo = await getVideoInfo(video.bvid, 'bvid');
          Object.assign(video, pick(videoInfo, pickKeysFromVideo));
          getReplyHot(video.aid).then((hotReply) => {
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
              this.$set(video, 'upper', null);
              if (video.watchUpper) {
                this.stopRing = false;
                this.warnVideoTitle = video.title;
                this.warnText = `置顶丢失`;
                this.customRing(30);
              }
            }
          });

          fetchVideoOnlineTotalInfo(video.aid, video.cid).then((totalInfo) => {
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
          await sleep(100);
          // this.$set(this.videoList, index, video);
        } catch (err) {
          this.$set(video, 'message', isEmpty(err) ? '' : err);
        }
      };
      for (const video of this.videoList) {
        await updateVideoData(video);
      }
      this.changeSortBy();
      this.lastUpdateTimeForVideo = this.formatDate(new Date());
      // showLoading('获取数据中...');
      // const promises = this.videoList.map(async (video, index) => {
      //   return await updateVideoData(video);
      // });
      // promises 顺序执行就行

      // Promise.all(promises)
      //   .then((videoList) => {
      //     this.videoList = this.videoList
      //       .map((item, index) => {
      //         return {
      //           ...item,
      //           ...videoList[index],
      //         };
      //       })
      //       .sort((a, b) => {
      //         return b.total - a.total;
      //       });
      //     console.log(
      //       this.videoList,
      //       videoList,
      //       '===========打印的 ------ videoList',
      //     );
      //     // this.videoList = videoList;
      //     this.lastUpdateTimeForVideo = this.formatDate(new Date());
      //     // this.saveVideoList(this.videoList);
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //   })
      //   .finally(() => {
      //     console.log(1, '===========打印的 ------ ');
      //     uni.hideLoading();
      //   });
    },
    addVideo() {
      uni.switchTab({
        url: '/pages/index/video-add',
      });
    },
    postUpperReply() {},
    setCK(index) {
      this.currentVideoIndex = index;
      this.addCkVisible = true;
      this.form = {
        cookie: this.videoList[index].cookie,
      };
    },
    onSubmitCK() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const cookie = this.form.cookie;
          const csrfMatches = cookie.match(/bili_jct=(.+?);/);
          if (!csrfMatches) {
            uni.showToast({
              title: 'cookie格式不正确',
              icon: 'none',
            });
            return;
          }

          const video = {
            ...this.videoList[this.currentVideoIndex],
            ...this.form,
          };
          this.videoList.splice(this.currentVideoIndex, 1, video);
          this.saveVideoList(this.videoList);
          this.addCkVisible = false;
          this.$message.success('设置成功');
        }
      });
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
      this.startDeleteReply();
    },
    showDelReplyLog(index) {
      this.currentVideoIndex = index;
      this.delReplyLogVisible = true;
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
    this.startDeleteReply();
    let videoList = uni.getStorageSync('videoList');
    if (videoList) {
      this.videoList = videoList;
    }
    aooxus();
  },
  onShow() {
    // this.startAutoRefresh();
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
.video-item-title {
  font-size: 32upx;
  color: #333;
  font-weight: 500;
}

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
  flex: 2;
}

.video-like,
.video-coin {
  flex: 1;
}

.video-title {
  max-height: 200upx;
  overflow: hidden;
  text-overflow: ellipsis;
}
//#endif
</style>
