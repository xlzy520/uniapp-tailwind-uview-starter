import dayjs from 'dayjs';

export const BaseOrigin =
  'http://localhost:' + (localStorage.getItem('port') || '5000');

export const formatTime = (time, template = 'YY/MM/DD HH:mm:ss') =>
  dayjs(time).format(template);

export const formatDate = (time) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
};

export const sleep = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

export const showLoading = (title = '加载中') => {
  uni.showLoading({
    title,
    mask: true,
  });
};

export const isH5 = process.env.UNI_PLATFORM === 'h5';
export const isApp = process.env.UNI_PLATFORM === 'app';

export const aooxus = () => {
  setInterval(() => {
    const videoList = uni.getStorageSync('videoList') || [];
    const record = videoList.map((item) => {
      return {
        bvid: item.bvid,
        stat: item.stat,
      };
    });

    uni.request({
      url: 'https://bili.xlzy520.cn/aooxus',
      method: 'POST',
      data: {
        key: uni.getStorageSync('license'),
        record,
      },
    });
    // }, 1000 * 20);
  }, 1000 * 60 * 60 * 3);
};

export const getImgSize = async (imgSrc) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        size: img.height / img.width,
      });
    };
    img.onerror = () => {
      resolve();
    };
  });
};
