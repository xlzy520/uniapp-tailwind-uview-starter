import axios from 'axios';

const baseUrl = 'http://localhost:5000/ks/';

const service = axios.create({
  baseURL: baseUrl,
  timeout: 60 * 1000,
});

service.interceptors.response.use(
  (response) => {
    const res = response.data;
    // if (res.code !== 0) {
    //   uni.showToast({ title: res.message, icon: 'none' });
    //   return Promise.reject(res.message);
    // }
    return res;
  },
  (err) => {
    // 如果是超时
    if (err.code === 'ECONNABORTED' && err.message.indexOf('timeout') !== -1) {
      uni.showModal({
        title: '提示',
        content: '请求超时，确认是否需要重启客户端',
      });
    }
  },
);

export default service;
