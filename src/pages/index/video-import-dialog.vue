<template>
  <view class="add-video ml-1">
    <u-button type="success" @click="visible = true">批量导入</u-button>
    <el-dialog title="批量导入用户视频" :visible.sync="visible" width="60%">
      <el-form
        :model="form"
        label-position="top"
        label-width="100%"
        :border-bottom="false"
      >
        <el-form-item label="用户ID" prop="mid">
          <div class="layout-items-center">
            <el-input v-model="form.mid" placeholder="请输入用户的ID" />
            <el-button class="ml-2" type="primary" @click="getUserVideoList">
              查询视频列表
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <el-table
        :data="list"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column prop="aid" label="视频ID" width="180" />
        <el-table-column prop="title" label="视频标题" />
        <el-table-column prop="ctimeText" label="发布时间" width="180" />
      </el-table>
      <div class="w-full text-center">
        <el-button
          type="primary"
          @click="submitSelectVideos"
          class="u-button-submit"
        >
          提交
        </el-button>
      </div>
    </el-dialog>
  </view>
</template>

<script>
import {
  getVideoInfo,
  fetchVideoOnlineTotalInfo,
  getUserVideoList,
} from '@/api/bilibili';
import { formatDate, showLoading } from '@/utils';
import { pick, uniqBy } from 'lodash-es';
import { pickKeysFromVideo } from '@/utils/constant';

export default {
  props: {
    videoList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      form: {
        mid: '',
      },
      visible: false,
      list: [],
      selections: [],
    };
  },
  computed: {},
  methods: {
    getUserVideoList() {
      if (!this.form.mid) {
        this.$message.error('请输入用户ID');
        return;
      }
      return getUserVideoList(this.form.mid).then((res) => {
        if (res.list) {
          const videoList = res.list?.vlist;
          const list = videoList.map((item) => {
            return {
              aid: item.aid,
              bvid: item.bvid,
              title: item.title,
              owner: {
                name: item.author,
              },
              stat: {
                view: item.play,
              },
              cid: item.aid,
              ctime: item.created,
              ctimeText: formatDate(item.created * 1000),
              message: '',
              watchUpper: false,
              isCustom: true,
              deleteReply: false,
            };
          });
          this.list = list;
        } else {
          this.$message.error('获取视频列表失败');
        }
      });
    },
    handleSelectionChange(val) {
      this.selections = val;
    },
    submitSelectVideos() {
      const list = this.selections;
      if (!list.length) {
        this.$message.error('请选择视频');
        return;
      }
      const videoList = [...this.videoList];
      videoList.unshift(...list);
      const uniqVideoList = uniqBy(videoList, 'aid');
      uni.setStorageSync('videoList', uniqVideoList);
      this.$emit('updateVideoList', uniqVideoList);
      this.$message.success('添加成功');
      this.visible = false;
      this.list = [];
    },
    submit() {
      if (!this.form.url) {
        uni.showToast({
          title: '请输入链接',
          icon: 'none',
        });
        return;
      }
      const urls = this.form.url;
      const urlList = urls.split('\n');
      urlList.forEach((url, index) => {
        let aid = url.match(/av(\d+)/);
        let bvid = url.match(/BV(\w+)/);
        if (!aid && !bvid) {
          uni.showToast({
            title: '视频链接格式不正确',
            icon: 'none',
          });
          return;
        }
        showLoading('添加中...');
        aid = aid ? aid[1] : '';
        bvid = bvid ? bvid[1] : '';
        const type = aid ? 'aid' : 'bvid';
        const videoId = aid || bvid;
        getVideoInfo(videoId, type)
          .then((res) => {
            console.log(res, '===========打印的 ------ ');
            const data = pick(res, pickKeysFromVideo);
            if (!data) {
              uni.showToast({
                title: '视频不存在',
                icon: 'none',
              });
              return;
            }
            data.watchUpper = false;
            data.isCustom = true;
            data.deleteReply = false;
            return fetchVideoOnlineTotalInfo(data.aid, data.cid).then(
              (total) => {
                data.total = total.total;
                const index = this.videoList.findIndex((item) => {
                  return item.aid === aid;
                });
                if (index > -1) {
                  this.videoList.splice(index, 1, data);
                } else {
                  this.videoList.unshift(data);
                }
                const uniqVideoList = uniqBy(this.videoList, 'aid');
                uni.setStorageSync('videoList', uniqVideoList);
                uni.showToast({
                  title: '添加成功',
                  icon: 'none',
                });
              },
            );
          })
          .catch((error) => {
            uni.showToast({
              title: error,
              icon: 'none',
            });
          })
          .finally(() => {
            uni.hideLoading();
            if (index === urlList.length - 1) {
              this.form.url = '';
              this.visible = false;
            }
          });
      });
    },
  },
};
</script>

<style lang="scss"></style>
