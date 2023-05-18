export const request = ({ url, data, method = 'GET', header }) =>
  new Promise((resolve, reject) => {
    uni.request({
      url,
      method,
      data,
      header,
      success(res) {
        if (res.success) {
          resolve(res.data);
        } else {
          uni.showToast({ title: res.msg, icon: 'none' });
          reject(res);
        }
      },
      fail(err) {
        reject(err);
      },
    });
  });
