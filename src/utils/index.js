import dayjs from 'dayjs';

export const formatTime = (time, template = 'YY/MM/DD HH:mm:ss') =>
  dayjs(time).format(template);

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
