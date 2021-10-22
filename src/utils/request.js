import setting from '../setting';

let devUrl = setting.baseUrl;

const isDev = process.env.NODE_ENV === 'development';

// #ifdef H5
devUrl = '';
// #endif

const baseUrl = devUrl;

const POST = 'POST';
const UPLOAD = 'UPLOAD';
const SUCCESS_CODES = 200;
const RefreshCode = 506;
const LogoutCode = 503;

const getHeader = () => {
  const accessToken = uni.getStorageSync('accessToken') || '';
  return {
    token: accessToken,
  };
};
/**
 *
 * @param {string} method 请求方法
 * @param {string} url api地址
 * @param {string} data 入参
 */

const request = (url, data, method = POST) =>
  new Promise((resolve, reject) => {
    if (method !== UPLOAD) {
      uni.request({
        url: `${baseUrl}/api${url}`,
        method,
        data,
        header: getHeader(),
        success(res) {
          // 请求成功
          const data = res.data;
          if (data.code === SUCCESS_CODES) {
            resolve(data.data);
          } else {
            // 其他异常
            console.log(data);
            if (data.code === RefreshCode) {
            } else if (data.code === LogoutCode) {
              reject(data);
              return;
              // uni.navigateTo({ url: '/pages/login/index' })
            } else {
              uni.showToast({ title: data.msg, icon: 'none' });
            }
            uni.showToast({ title: data.msg, icon: 'none' });
            reject(data);
          }
        },

        fail(err) {
          console.log(err);
          // 请求失败
          reject(new Error('请检查网络'));
        },
      });
    } else {
      console.log(data, url);
      uni.uploadFile({
        file: data,
        filePath: data.path,
        name: 'file',
        url: `${baseUrl}/api/${url}`,
        header: getHeader(method, url, true),
        success: (resObj) => {
          const res = JSON.parse(resObj.data);
          if (res.code === SUCCESS_CODES) {
            resolve(res.data);
          } else {
            // 其他异常
            reject(res.msg);
          }
        },
        fail: (err) => {
          reject(new Error('上传失败:' + JSON.stringify(err)));
        },
      });
    }
  });

export default request;
