import axios from 'axios';
import { BaseOrigin } from '@/utils/index';
import { Message } from 'element-ui';

const baseUrl = BaseOrigin + '/bili-watch/';

const service = axios.create({
  baseURL: baseUrl,
  timeout: 60 * 1000,
});

service.interceptors.response.use(
  (response) => {
    const res = response.data;
    const url = response.config.url;
    if (res.birthday || res.dialog === 0) {
      return res;
    }
    if (res.code !== 0) {
      uni.showToast({ title: res.message, icon: 'none' });
      return Promise.reject(res.message);
    }
    return res.data;
  },
  (err) => {
    // 如果是超时
    if (err.code === 'ECONNABORTED' && err.message.indexOf('timeout') !== -1) {
      // uni.showModal({
      //   title: '提示',
      //   content: '请求超时，确认是否需要重启客户端',
      // });
      Message({
        message: '请求超时',
        type: 'warning',
      });
    }
  },
);

export default service;
