<template>
  <view class="ml-1">
    <u-button type="primary" @click="visible = true">
      日志列表
    </u-button>
    <el-dialog title="日志列表" :visible="visible" width="60%" @close="close">

      <div ref="log" class="h-[50vh] overflow-auto text-[18px]">
        <div v-for="item in list" :class="item.level" >
          【{{ item.time}}】 {{item.content}}
        </div>
      </div>
    </el-dialog>
  </view>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
      default: ()=> ([]),
    },
  },
  data() {
    return {
      keywords: '',
      visible: false,
      version: '',
      currentVersion: '',
      license: '',
    };
  },
  computed: {},
  methods: {
    close() {
      this.visible = false;
    },

  },
  mounted() {
    // 定时滚动到底部
  },
  watch: {
    list() {
      this.$nextTick(() => {
        if (this.$refs.log){
          this.$refs.log.scrollTop = this.$refs.log.scrollHeight;
        }
      });
    }
  }
};
</script>

<style lang="scss"></style>
