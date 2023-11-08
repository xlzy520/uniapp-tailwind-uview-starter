<template>
  <view class="layout-items-center">
    <u-button type="primary" class="ml-1" @click="importData">
      导入记录
    </u-button>
    <u-button type="success" class="ml-1" @click="exportData">
      导出记录
    </u-button>
  </view>
</template>

<script>
export default {
  methods: {
    importData() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';

      input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target.result);
            const keywords = importedData.keywords;
            const videoList = importedData.videoList;
            const userList = importedData.userList;
            localStorage.setItem('keywords', keywords);
            uni.setStorageSync('videoList', videoList);
            localStorage.setItem('userList', JSON.stringify(userList));
            this.$message.success('导入数据成功');
            location.reload();
            // Use the importedData as needed
            console.log(importedData);
          } catch (error) {
            console.error('Error parsing JSON file:', error);
          }
        };

        reader.readAsText(file);
      };

      input.click();
    },

    exportData() {
      const videoList = uni.getStorageSync('videoList') || [];
      let keywords = localStorage.getItem('keywords');
      const userList = localStorage.getItem('userList') || '[]';
      const data = {
        videoList: videoList,
        keywords,
        userList: JSON.parse(userList),
      };
      const fileName = '执笔-私信配置.json';
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;

      link.click();
      URL.revokeObjectURL(url);
    },
  },
};
</script>

<style lang="scss" scoped></style>
