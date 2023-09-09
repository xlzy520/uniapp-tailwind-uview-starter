<template>
  <view class="add-video">
    <u-button type="success" @click="visible = true">根据CK批量导入</u-button>
    <el-dialog title="批量导入用户视频" :visible.sync="visible" width="60%">
      <div class="text-center w-full mb-2">
        <el-link
          underline
          class="!font-bold !text-red-500 !text-[20px]"
          target="_blank"
          href="https://www.yuque.com/xlzy520/doc/sc7qpq4808b4x9fa?singleDoc#"
          >《快手获取CK教程》</el-link
        >
      </div>
      <el-form
        :model="form"
        label-position="top"
        label-width="100%"
        :border-bottom="false"
      >
        <el-form-item label="" prop="ID">
          <div class="layout-items-center">
            <el-input v-model="form.cookie" placeholder="请输入用户的CK" />
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
        <el-table-column prop="photoId" label="视频ID" width="180" />
        <el-table-column prop="title" label="视频标题" />
        <el-table-column prop="playCount" label="播放量" />
        <el-table-column prop="uploadTimeText" label="发布时间" width="180" />
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
import { getPhotoList } from '@/api/ks';
import { formatDate } from '@/utils';
import { uniqBy } from 'lodash-es';

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
        cookie: '',
      },
      visible: false,
      list: [],
      selections: [],
    };
  },
  computed: {},
  methods: {
    getUserVideoList() {
      if (!this.form.cookie) {
        this.$message.error('请输入用户ID');
        return;
      }
      return getPhotoList(this.form.cookie).then((res) => {
        if (res.photoList) {
          const videoList = res.photoList;
          this.list = videoList.map((item) => {
            return {
              ...item,
              uploadTimeText: formatDate(item.uploadTime),
              cookie: this.form.cookie,
            };
          });
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
      const uniqVideoList = uniqBy(videoList, 'photoId');
      uni.setStorageSync('videoList', uniqVideoList);
      this.$emit('updateVideoList', uniqVideoList);
      this.$message.success('添加成功');
      this.visible = false;
      this.list = [];
    },
  },
};
</script>

<style lang="scss"></style>
