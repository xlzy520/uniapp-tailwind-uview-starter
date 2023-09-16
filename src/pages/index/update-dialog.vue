<template>
  <view class="ml-1">
    <u-button v-if="hasNewVersion" type="error" @click="visible = true">
      更新客户端({{ currentVersion }} -> {{ version }})
    </u-button>
    <u-tag
      size="large"
      v-else
      :text="currentVersion + '更新内容'"
      @click="visible = true"
    ></u-tag>
    <el-dialog title="更新内容" :visible="visible" width="60%" @close="close">
      <div class="text-center mb-2" v-if="hasNewVersion || !currentVersion">
        <el-button type="primary" @click="onDownload">
          立即下载最新客户端(强烈推荐)
        </el-button>
      </div>
      <div class="max-h-[50vh] overflow-auto text-[18px]">
        <div class="text-[20px] font-bold text-black">
          v2.3.0(更新吧-2023-09-17)
        </div>
        <div class="text-red-500 font-bold mt-1">
          1. 修复删评版风控问题，删评间隔时间调到1分钟
        </div>
        <div class="text-red-500 font-bold mt-1">
          2.
          如果评论超过200条，那么会按热度读取100条，按时间读取100条，进行删除，减少风控风险
        </div>
        <div class="text-[20px] font-bold text-black mt-1">
          v2.2.0(更新吧-2023-09-15)
        </div>
        <div class="text-red-500 font-bold mt-1">
          1.
          修复风控问题，修复大量412问题，提升稳定性，减少风控风险，最好还是升级吧
        </div>
        <div class="text-[20px] font-bold text-black">
          v2.1.0(更新吧-2023-09-08)
        </div>
        <div class="text-red-500 font-bold mt-1">
          1. 增加清空失效稿件、清空全部稿件的功能
        </div>
        <div class="text-[20px] font-bold text-black">
          v2.1.0(更新吧-2023-09-03)
        </div>
        <div class="text-red-500 font-bold mt-1">
          1. 增加根据用户ID批量导入视频的功能，更加方便
        </div>
        <div class="text-[20px] font-bold text-black">
          v2.0.0(更新吧-2023-09-03)
        </div>
        <div class="text-red-500 mt-1 font-bold">
          1. 修复弹幕一直提示删除超时的问题
        </div>
        <div class="text-red-500 mt-1 font-bold">
          2. 增加自动补充置顶评论的功能，支持图片链接和随机话术配置
        </div>
        <div class="text-red-500 mt-1 font-bold">
          3. 增加配置CK时，CK的有效性检测
        </div>
        <div class="text-red-500 mt-1 font-bold">
          4. 稿件失效之后不再更新数据，不再删评、删弹幕
        </div>
        <div class="text-red-500 mt-1 font-bold">5. 其他体验性优化</div>

        <div class="text-[20px] font-bold text-black mt-1">1.1.3</div>
        <div class="text-red-500 mt-1 font-bold">1. 一些bug修复</div>
        <div class="text-[20px] font-bold text-black mt-1">
          1.1.0(增加弹幕删除)
        </div>
        <div class="text-red-500 mt-1 font-bold">
          1. 增加弹幕删除功能，与评论共用一套关键词
        </div>
        <div class="text-red-500 mt-1 font-bold">
          2.
          增加删评、删弹幕的日志记录功能，记录哪些评论和弹幕因为包含什么关键词而删除，日志文件保存在客户端目录中
        </div>
        <div class="text-red-500 mt-1 font-bold">
          3. 增加记录导入、导出功能，避免因为某些操作导致记录全无
        </div>
        <div class="text-red-500 mt-1 font-bold">4. 增加排序功能</div>
        <div class="text-red-500 mt-1 font-bold">5. 修复弹幕查询失败的问题</div>
        <div class="text-16 font-bold text-black mt-2">1.0.5</div>
        <div class="text-red-500 mt-1 font-bold">
          1. 优化查询评论列表的速度，减少超时情况
        </div>
        <div class="text-red-500 mt-1">2. 延长网页超时时间</div>

        <div class="text-16 font-bold text-black mt-2">1.0.4</div>
        <div class="text-red-500 mt-1">1. 跳过视频作者自己的评论</div>

        <div class="text-16 font-bold text-black mt-2">1.0.3</div>
        <div class="text-red-500 mt-1">1. 修复楼中楼删评不完整</div>
        <div class="text-red-500 mt-1">
          2. 当评论超过60条时，补充检查最新一页的评论
        </div>
        <div class="text-red-500 mt-1">3. 置顶没有检测在内</div>
        <div class="text-red-500 mt-1">
          4. 修复如果以逗号结尾，会删除全部评论的问题
        </div>
      </div>
      <div class="text-center">
        <el-button type="primary" @click="noNotice">本版本不再提醒</el-button>
      </div>
    </el-dialog>
  </view>
</template>

<script>
export default {
  data() {
    return {
      keywords: '',
      visible: false,
      version: '',
      currentVersion: '',
    };
  },
  computed: {
    hasNewVersion() {
      return this.version !== this.currentVersion;
    },
  },
  methods: {
    close() {
      this.visible = false;
    },
    noNotice() {
      localStorage.setItem('noticeVersion', this.version);
      this.visible = false;
    },
    onDownload() {
      window.open(
        'https://zhibi-share.oss-cn-shanghai.aliyuncs.com/B%E7%AB%99%E6%89%A7%E7%AC%94%E6%9C%AC%E5%9C%B0%E5%AE%A2%E6%88%B7%E7%AB%AF.exe',
      );
    },
  },
  mounted() {
    this.version = localStorage.getItem('version') || '';
    this.currentVersion = localStorage.getItem('currentVersion') || '';
    const noticeVersion = localStorage.getItem('noticeVersion');
    if (!this.currentVersion) {
      this.visible = true;
    }
    if (this.hasNewVersion) {
      if (noticeVersion !== this.version) {
        this.visible = true;
      }
    }
    const fktx1 = localStorage.getItem('fktx1');
    if (!fktx1) {
      this.$alert('解决监控的风控问题，建议升级', '重要提示', {
        type: 'success',
        confirmButtonText: '确定',
        callback: () => {
          localStorage.setItem('fktx1', 'true');
        },
      });
    }
  },
};
</script>

<style lang="scss"></style>
