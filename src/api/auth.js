import axios from 'axios';

export const checkLicense = (license) => {
  let extId = uni.getDeviceInfo().deviceId;
  if (extId.length < 32) {
    extId = 'uFtmTHzNYzVA' + extId;
    extId = extId.padEnd(32, 'c');
  }
  return axios
    .get(
      `http://localhost:5000/auth?key=${license}&extId=${extId}&type=视频数据监控`,
    )
    .then((res) => {
      if (res.data.success) {
        uni.setStorageSync('licenseError', '');
        localStorage.setItem('version', res.data.version || '');
        localStorage.setItem('currentVersion', res.data.currentVersion || '');
        return res.data;
      } else {
        uni.setStorageSync('licenseError', 'true');
        return Promise.reject(res);
      }
    });
};
