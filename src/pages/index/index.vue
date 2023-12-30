<template>
  <view class="video-list-page">
    <view class="mb-2 layout-items-center">
      <video-add-dialog :video-list="videoList" />
      <span class="text-[14px] ml-2">
        (每 {{ intervalMinutes }} 分钟更新一次)
      </span>
      <!--      <set-keywords-dialog class="ml-1" />-->
      <!--      <update-dialog :hasUpdate="hasUpdate" />-->
      <!--      <view class="" v-if="false">-->
      <!--        <el-button type="success">有更新(客户端有更新，立即下载)</el-button>-->
      <!--      </view>-->
      <!--      <import-and-export />-->
      <!--      <remove-record />-->
      <!--      <setting-dialog />-->
    </view>
    <div class="layout-items-center">
      <view
        class="text-[14px] font-bold text-pink-500 video-length layout-slide"
      >
        <view class=""> 共 {{ videoList.length }} 个CK </view>
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
          更新CK数据
        </el-button>
        <el-button
          :disabled="!selections.length"
          type="danger"
          @click="batchDeleteVideo"
        >
          批量删除
        </el-button>
      </view>
    </div>

    <u-divider />
    <view class="video-list">
      <el-table
        :data="showVideoList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="ID" prop="mid" width="120"> </el-table-column>
        <el-table-column label="昵称/头像" prop="mid" width="200">
          <template slot-scope="{ row }">
            <div class="layout-items-center">
              <el-avatar :src="row.face" size="small"></el-avatar>
              <el-link
                type="primary"
                target="_blank"
                :href="`https://space.bilibili.com/${row.mid}/dynamic`"
                class="text-[14px] ml-[5px]"
                >{{ row.name }}</el-link
              >
              <div v-if="row.message" class="text-red-500">
                ({{ row.message }})
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" width="200">
          <template slot-scope="{ row }">
            <div class="layout-items-center">
              <el-input
                v-model="row.remark"
                @blur="updateRemark(row)"
              ></el-input>
            </div>
          </template>
        </el-table-column>
        <!--        <el-table-column label="粉丝数" prop="follower" width="100">-->
        <!--        </el-table-column>-->
        <el-table-column label="是否封禁" prop="silence" width="100">
          <template slot-scope="{ row }">
            <div v-if="row.silence" class="text-red-500">已封禁</div>
            <div v-else class="text-green-500">正常</div>
          </template>
        </el-table-column>
        <!--        <el-table-column prop="type" label="类型" width="100">-->
        <!--        </el-table-column>-->
        <!--        <el-table-column prop="tag" label="置顶"> </el-table-column>-->
        <!--        <el-table-column prop="text" label="文字"></el-table-column>-->
        <el-table-column label="内容">
          <template slot-scope="{ row }">
            <div>{{ row.dynamicItem && row.dynamicItem.text }}</div>
            <el-image
              v-if="row.dynamicItem && row.dynamicItem.image"
              style="width: 100px; height: 100px"
              :src="row.dynamicItem && row.dynamicItem.image"
              fit="cover"
            ></el-image>
          </template>
        </el-table-column>
        <!--        <el-table-column label="置顶" width="160">-->
        <!--          <template slot-scope="{ row }">-->
        <!--            <div class="video-upper">-->
        <!--              <div-->
        <!--                v-if="row.upper"-->
        <!--                class="underline text-blue-500"-->
        <!--                @click="viewUpperDetail(row)"-->
        <!--              >-->
        <!--                存活(查看详情)-->
        <!--              </div>-->
        <!--              <div v-else>无</div>-->
        <!--              <div v-if="row.watchUpper" class="font-bold text-orange-500">-->
        <!--                【监控中】-->
        <!--              </div>-->
        <!--            </div>-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <!--        <el-table-column label="关注的回复" prop="followed_reply" width="120">-->
        <!--          <template slot-scope="{ row }">-->
        <!--            <div v-if="row.followed_reply === 0" class="text-red-500">关闭</div>-->
        <!--            <div v-else class="text-green-500">开启</div>-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <!--        <el-table-column label="关注回复内容" prop="followed_reply" width="300">-->
        <!--          <template slot-scope="{ row }">-->
        <!--            <el-tooltip v-if="!row.message" :content="row.followed_reply_text">-->
        <!--              <div class="truncate">{{ row.followed_reply_text }}</div>-->
        <!--            </el-tooltip>-->
        <!--            <span v-else class="text-red-500">{{ row.message }}</span>-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <!--        <el-table-column label="私信的回复" prop="recv_reply" width="120">-->
        <!--          <template slot-scope="{ row }">-->
        <!--            <div v-if="row.recv_reply === 0" class="text-red-500">关闭</div>-->
        <!--            <div v-else class="text-green-500">开启</div>-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <!--        <el-table-column label="私信回复内容" prop="recv_reply" width="300">-->
        <!--          <template slot-scope="{ row }">-->
        <!--            <el-tooltip v-if="!row.message" :content="row.recv_reply_text">-->
        <!--              <div class="truncate">{{ row.recv_reply_text }}</div>-->
        <!--            </el-tooltip>-->
        <!--            <span v-else class="text-red-500">{{ row.message }}</span>-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <!--        <el-table-column-->
        <!--          label="自定义的自动回复内容"-->
        <!--          width="200"-->
        <!--          prop="content"-->
        <!--        >-->
        <!--          <template slot-scope="{ row }">-->
        <!--            <el-tooltip :content="row.content">-->
        <!--              <div-->
        <!--                class="truncate"-->
        <!--                :class="row.content ? 'text-blue-500' : 'text-red-500'"-->
        <!--              >-->
        <!--                {{ row.content ? row.content : '未填写，无法自动补' }}-->
        <!--              </div>-->
        <!--            </el-tooltip>-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <el-table-column label="操作" width="">
          <template slot-scope="{ row, $index }">
            <div class="video-action">
              <el-button
                type="primary"
                size="mini"
                @click="showSetTopReplyConfig($index)"
              >
                动态内容设置
              </el-button>
              <el-button
                size="mini"
                class="video-action-button"
                type="primary"
                @click="onUpdateCookie($index)"
              >
                更新CK
              </el-button>

              <!--              <el-popconfirm-->
              <!--                class="ml-[5px]"-->
              <!--                title="确定清空B站的关注、私信自动回复内容吗？"-->
              <!--                @confirm="removeVideo($index)"-->
              <!--              >-->
              <!--                <el-button-->
              <!--                  slot="reference"-->
              <!--                  size="mini"-->
              <!--                  class="video-action-button"-->
              <!--                  type="primary"-->
              <!--                  @click="onClearRemoteContent(row)"-->
              <!--                >-->
              <!--                  清空B站私信内容-->
              <!--                </el-button>-->
              <!--              </el-popconfirm>-->

              <!--              <el-button-->
              <!--                size="mini"-->
              <!--                class="video-action-button"-->
              <!--                type="primary"-->
              <!--                @click="onStartAll(row)"-->
              <!--              >-->
              <!--                一键开启-->
              <!--              </el-button>-->
              <!--              <el-button-->
              <!--                size="mini"-->
              <!--                :type="row.watchUpper ? 'danger' : 'primary'"-->
              <!--                class="video-action-button"-->
              <!--                @click="watchUpper($index)"-->
              <!--              >-->
              <!--                {{ row.watchUpper ? '取消监控' : '监控自动回复设置' }}-->
              <!--              </el-button>-->
              <el-popconfirm
                class="ml-[5px]"
                title="确定删除该CK吗？"
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
        <view class="font-bold text-black"> CK：【{{ warnVideoTitle }}】 </view>
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
    <set-keywords-dialog
      v-if="setContentVisible"
      :video="currentVideo"
      @close="setContentVisible = false"
      @submit="onUpdateVideoConfig"
      class="ml-1"
    />
  </view>
</template>

<script>
import {
  checkLicense,
  delDm,
  delReply,
  getAutoMsgContent,
  fetchVideoOnlineTotalInfo,
  getReplyHot,
  getVideoInfo,
  sendReply,
  setTopReply,
  uploadVideoList,
  getLinkSetting,
  setLinkSetting,
  getReplyText,
  setReplyText,
  getSpaceInfo,
  getDynamicList,
  submitDynamic,
  startReplyJingXuan,
} from '@/api/bilibili';
import { pickKeysFromVideo, sortFieldOptions } from '@/utils/constant';
import {
  formatDate,
  sleep,
  getRecommendRefreshMinutes,
  isDev,
  getImgSize,
} from '@/utils';
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
      setContentVisible: false,
    };
  },
  computed: {
    currentVideo() {
      return this.videoList[this.currentVideoIndex];
    },
    showVideoList() {
      console.log(this.videoList);
      return this.videoList;
    },
  },
  methods: {
    updateRemark(row) {
      console.log(row, '===========打印的 ------ updateRemark');
      const index = this.videoList.findIndex((item) => {
        return item.mid === row.mid;
      });
      if (index > -1) {
        this.videoList.splice(index, 1, row);
      }
      this.saveVideoList(this.videoList);
    },
    getDynamicTextAndImage(row) {
      if (!row) {
        return {};
      }
      const modules = row.modules;
      console.log(
        row,
        modules,
        '===========打印的 ------ getDynamicTextAndImage',
      );
      if (!modules) {
        return {};
      }
      const text =
        modules.module_dynamic.desc?.text ||
        modules.module_dynamic.major.opus?.summary.text;
      const image = modules.module_dynamic.major?.opus?.pics?.[0]?.url;
      console.log(image, '===========打印的 ------ getDynamicTextAndImage');

      return { text, image };
    },
    handleSelectionChange(val) {
      this.selections = val;
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
    startDeleteReply() {},
    onEditContent(index) {
      this.currentVideoIndex = index;
      this.setContentVisible = true;
    },
    onUpdateCookie(index) {
      this.currentVideoIndex = index;
      this.addCkVisible = true;
    },
    async onStartAll(row) {
      await setLinkSetting(row.cookie, 'followed_reply');
      await setLinkSetting(row.cookie, 'recv_reply');
      this.getVideoStatsList();
    },
    saveVideoList(videoList) {
      this.videoList = videoList;
      uni.setStorageSync('videoList', videoList);
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
          title: item.watchUpper
            ? '取消监控自动回复设置'
            : '开始监控自动回复设置',
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

      const getReplyTextFormData = (data) => {
        return get(data, 'texts.0.reply', '');
      };
      const updateVideoData = async (video) => {
        try {
          // const linkSetting = await getLinkSetting(video.cookie, video.name);

          const dynamicList = await getDynamicList(video.cookie);
          console.log(
            dynamicList,
            video,
            '===========打印的 ------ dynamicList',
          );
          const items = dynamicList.items;
          if (items.length === 0) {
            this.customRing(3);
            this.$message({
              message: `【${video.name}】该账号没有发布任何动态, 触发自动补动态`,
              type: 'warning',
            });
            await this.submitDynamic(video);
          }
          Object.assign(video, {
            message: '',
            dynamicItem: this.getDynamicTextAndImage(items?.[0]),
          });

          console.log(video, '===========打印的 ------ updateVideoData');
          this.saveVideoList(this.videoList);

          // this.$message.success(`更新CK数据：${video.title} 成功`);
        } catch (err) {
          console.log(err, '===========打印的 ------ updateVideoData');
          let errMessage = isEmpty(err) ? '' : err;
          if (isObject(err)) {
            errMessage = '查询异常';
            errorVideoCount += 1;
            this.$set(video, 'upper', null);
          }
          if (errMessage === '查询异常' && errorVideoCount > 3) {
            errMessage =
              '多个CK查询异常，检查请求是否被拦截，请使用爱加速切换IP';
            this.stopRing = false;
            this.warnVideoTitle = '多个CK查询异常';
            this.warnText = `多个CK查询异常，检查请求是否被拦截，请使用爱加速切换IP`;
            this.customRing(3);
          }
          this.$set(video, 'message', errMessage);
          this.saveVideoList(this.videoList);
        }
      };

      this.searchLoading = true;
      if (defaultVideo) {
        await updateVideoData(defaultVideo);
        this.searchLoading = false;
        return;
      }
      for (const video of this.videoList) {
        await updateVideoData(video);
        await sleep(300);
      }
      console.log(this.videoList, '===========打印的 ------ getVideoStatsList');
      this.searchLoading = false;
      this.lastUpdateTimeForVideo = this.formatDate(new Date());
    },
    async submitDynamic(user) {
      console.log(user, '===========打印的 ------ submitDynamic');
      if (!user.dynamicContent) {
        this.$alert(`【${user.name}】没有配置自动补充的动态内容`, '提示');
        return;
      }
      let useText = !user.dynamicContent?.img1;
      let payload;
      if (useText) {
        payload = {
          content: {
            contents: [
              { raw_text: user.dynamicContent.text, type: 1, biz_id: '' },
            ],
          },
          scene: 1,
        };
      } else {
        const imgSizeObject = await getImgSize(user.dynamicContent.img1);
        payload = {
          content: {
            contents: [
              { raw_text: user.dynamicContent.text, type: 1, biz_id: '' },
            ],
          },
          pics: [
            {
              img_src: user.dynamicContent.img1,
              img_width: imgSizeObject.width,
              img_height: imgSizeObject.height,
              img_size: imgSizeObject.size,
            },
          ],
          scene: 2,
        };
      }
      const data = {
        dyn_req: {
          ...payload,
          attach_card: null,
          upload_id: '1838750034_1684937710_6116',
          meta: { app_meta: { from: 'create.dynamic.web', mobi_app: 'web' } },
        },
      };
      return submitDynamic(user.cookie, data).then(async (res) => {
        console.log(res, '===========打印的 ------ 补发');
        if (res.dyn_id_str) {
          this.$alert(`【${user.name}】补发动态成功`, '提示', {
            type: 'success',
          });
          setTimeout(() => {
            startReplyJingXuan(user.cookie, res.dyn_id_str);
            this.getVideoStatsList(user);
          }, 2000);
        } else {
          // alert('补发失败');
          this.$alert(`【${user.name}】补发动态失败`, '提示');
        }
      });
    },
    async onClearRemoteContent(row) {
      await setReplyText(row.cookie, 'followed_reply', '');
      this.$message.success(`清空用户${row.name} 的 【关注】自动回复内容成功`);
      await setReplyText(row.cookie, 'recv_reply', '');
      this.$message.success(`清空用户${row.name} 的 【私信】自动回复内容成功`);
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
        const message = `【${video.title}】请先配置该CK需要补充的置顶内容，否则无法自动补置顶`;
        this.$alert(message, '提示');
        return;
      }
      const cookie = video.cookie;
      if (!cookie) {
        const message = `【${video.title}】请先配置该CK作者的CK，否则无法自动补置顶`;
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
        const message = `【${video.title}】请先配置该CK作者的CK，否则无法自动补置顶`;
        this.$message.error(message);
        return;
      }
      const upper = video.upper;
      if (!upper) {
        this.$message.error('该CK没有置顶');
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
  },
  onShow() {
    // this.startAutoRefresh();
  },
};
</script>

<style lang="scss">
@import 'index';
</style>
