<template>
  <view class="">
    <u-button type="primary" @click="openDialog">私信账号列表</u-button>
    <el-dialog
      title="私信内容配置"
      :visible="visible"
      width="60%"
      @close="close"
    >
      <el-upload
        action=""
        accept="text/plain"
        :auto-upload="false"
        :show-file-list="false"
        :on-change="onFileChange"
      >
        <el-button slot="trigger" type="success"> 导入私信CK </el-button>
      </el-upload>
      <el-table :data="userList" style="width: 100%">
        <!--        <el-table-column type="selection" width="55"> </el-table-column>-->
        <el-table-column prop="mid" label="用户ID" />
        <el-table-column prop="sendMsgCountToday" label="今日私信次数">
          <template slot-scope="scope">
            {{ formatSendMsgCountToday(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column prop="cookieExpired" label="是否掉线">
          <template slot-scope="scope">
            <el-tag
              color="red"
              effect="dark"
              v-if="scope.row.cookieExpired === 'true'"
            >
              掉线
            </el-tag>
            <el-tag
              color="red"
              effect="dark"
              v-else-if="scope.row.isBan === 'true'"
            >
              封禁
            </el-tag>
            <el-tag color="green" effect="dark" v-else>正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="添加时间" />
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="danger" size="mini" @click="deleteUser(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </view>
</template>

<script>
import Cookie from 'cookie';
import { uniqBy } from 'lodash-es';
import { formatDate, formatTime } from '@/utils';
import dayjs from 'dayjs';

export default {
  data() {
    return {
      keywords: '',
      visible: false,
      maxWords: 30,
      importVisible: false,
      cookie: '',
      userList: [],
    };
  },
  methods: {
    openDialog() {
      this.visible = true;
      const userList = localStorage.getItem('userList') || '[]';
      this.userList = JSON.parse(userList);
    },
    deleteUser(row) {
      const userList = [...this.userList];
      const index = userList.findIndex((item) => item.mid === row.mid);
      userList.splice(index, 1);
      localStorage.setItem('userList', JSON.stringify(userList));
      this.userList = userList;
      this.$message.success('删除成功');
    },
    formatSendMsgCountToday(row) {
      const { sendMsgRecordMap = {} } = row;
      const today = dayjs().format('YYYY-MM-DD');
      const todaySendMsgCount = sendMsgRecordMap[today] || 0;
      return todaySendMsgCount === 10 ? '已上限' : todaySendMsgCount;
    },
    onFileChange(file) {
      const reader = new FileReader();
      reader.readAsText(file.raw);
      reader.onload = (readerEvt) => {
        const fileString = readerEvt.target.result;
        const accounts = fileString.replaceAll('\r', '').split('\n');
        const userList = [...this.userList];
        const newUsers = [];
        accounts.forEach((accountStr, index) => {
          if (accountStr.length > 5) {
            accountStr = accountStr.replace('cookie:', '');
            accountStr = accountStr.replace('卡号:', '');
            accountStr = accountStr.replace('卡号：', '');
            if (accountStr.includes('Mozilla')) {
              accountStr = `buvid3${accountStr.split(',buvid3')[1]}`;
            }
            let [account, password, cookie] = accountStr.split('----');
            if (!cookie) {
              cookie = accountStr;
            }
            const cookieObj = Cookie.parse(cookie);
            const accountObj = {
              mid: cookieObj.DedeUserID,
              csrf: cookieObj.bili_jct,
              originCookie: cookie,
              sendMsgCountToday: '0',
              statusToday: '正常',
              createTime: formatDate(),
              sendMsgRecordMap: {},
            };
            newUsers.push(accountObj);
          }
        });
        userList.push(...newUsers);
        this.userList = userList;
        localStorage.setItem(
          'userList',
          JSON.stringify(uniqBy(userList, (item) => item.mid)),
        );
        // getList();
        this.$message.success('导入成功');
      };
    },
    close() {
      this.visible = false;
    },
    onSubmit() {
      const keywords = this.keywords;
      localStorage.setItem('keywords', keywords);
      // const splitKeywords = lastKeywords.split(',');
      this.$message({
        message: `私信内容配置成功`,
        type: 'success',
      });
      this.close();
    },
  },
  mounted() {
    this.keywords = localStorage.getItem('keywords') || '';
    this.maxWords = localStorage.getItem('maxWords') || 30;
    const userList = localStorage.getItem('userList') || '[]';
    this.userList = JSON.parse(userList);
  },
};
</script>

<style lang="scss"></style>
