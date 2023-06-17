import dayjs from 'dayjs';
import { mockFollowList } from '@/api/mock';
import { sleep } from '@/utils';

const isDev = process.env.NODE_ENV === 'development';

const baseUrl = isDev
  ? 'http://localhost:5000/bili-watch/'
  : 'https://api.bilibili.com/x/';

const request = ({ url, data, method = 'GET', header }) =>
  new Promise((resolve, reject) => {
    uni.request({
      url: `${baseUrl}${url}`,
      method,
      data,
      header,
      success(res) {
        const data = res.data;
        if (data.code === 0) {
          resolve(data.data);
        } else {
          uni.showToast({ title: data.message, icon: 'none' });
          reject(data);
        }
      },
      fail(err) {
        reject(err);
      },
    });
  });

export const fetchFollowings = (mid = '7560113', cookie) => {
  const allData = [];
  return request({
    url: `relation/followings?vmid=${mid}&ps=50&order_type=attention`,
    method: isDev ? 'POST' : 'GET',
    header: {
      Cookie: cookie,
    },
    data: {
      mid: mid,
      pn: 1,
      cookie: cookie,
    },
  }).then((result) => {
    console.log(result, '===========打印的 ------ ');
    const total = result.total;
    const list = result.list;
    console.log(result, total, '===========打印的 ------ ');
    allData.push(...list);
    const pn = Math.ceil(total / 50);
    const allPromise = [];
    for (let i = 2; i < pn + 1; i++) {
      allPromise.push(
        request({
          url: `relation/followings?vmid=${mid}&pn=${i}&ps=50&order_type=attention`,
          method: isDev ? 'POST' : 'GET',
          header: {
            Cookie: cookie,
          },
          data: {
            mid: mid,
            pn: i,
            cookie: cookie,
          },
        }).then((result) => {
          const list = result.list;
          allData.push(...list);
        }),
      );
    }
    return Promise.all(allPromise).then(() => {
      return allData;
    });
  });
};

export const fetchUserVideos = (mid, cookie, pn) => {
  return new Promise((resolve, reject) => {
    uni.request({
      methods: 'GET',
      url: `${baseUrl}space/wbi/arc/search`,
      data: {
        mid: mid,
        ps: 50,
        tid: 0,
        pn: pn,
        keyword: '',
        order: 'pubdate',
        platform: 'web',
        web_location: '1550101',
        order_avoided: true,
        w_rid: '9468638126455b11cb2b1b2133598b48',
        wts: Math.round(new Date().getTime() / 1000),
      },
      header: {
        Cookie: cookie,
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.101 Safari/537.36',
      },
      success: (res) => {
        const data = res.data && res.data.data;
        if (data) {
          if (data.list && data.list.vlist) {
            return resolve(data.list.vlist);
          }
          return resolve([]);
        }
        // console.error(mid, pn, res.data.message, 'fetchUserVideos');
        resolve([{ error: res.data.message }]);
      },
      fail: (err) => {
        console.log(err, '===========打印的 ------ err');
        reject(err);
      },
    });
  });
};

// 获取视频在线观看人数
export const fetchVideoOnlineTotalInfo = (aid, cid) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${baseUrl}player/online/total?aid=${aid}&cid=${cid}`,
      success: (res) => {
        const data = res.data.data;
        if (data) {
          return resolve(data);
        }
        reject(res.data.message);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

function filterWeeksData(data, weeks = 2) {
  if (data && data.length === 1 && data[0].error) {
    return data;
  }
  const nowTime = dayjs();
  const twoWeeksAgo = nowTime.subtract(weeks, 'week');
  const filteredData = (data || []).filter((item) => {
    const createdAt = dayjs.unix(item.created);
    return createdAt.isAfter(twoWeeksAgo);
  });

  return filteredData;
}

export const getVideoInfoAndTotal = async (aid, cid) => {
  const videoInfo = await getVideoInfo(aid);
  const stat = videoInfo.stat;
  const total = await fetchVideoOnlineTotalInfo(aid, cid);
  return {
    videoInfo,
    stat,
    total,
  };
};

export const fetchUserVideosService = async (mid, cookie) => {
  try {
    const data = await fetchUserVideos(mid, cookie, 1);
    const filteredVideoList = filterWeeksData(data, 1);
    const promises = filteredVideoList.map(async (item) => {
      if (item.error) {
        return item;
      }
      const videoInfo = await getVideoInfo(item.bvid);
      const cid = videoInfo.cid;
      const stat = videoInfo.stat;
      item.videoInfo = videoInfo;
      item.stat = stat;
      item.cid = cid;
      // await sleep(100);
      // console.log(videoInfo, '===========打印的 ------ getVideoInfo');
      return fetchVideoOnlineTotalInfo(item.aid, cid).then((total) => {
        item.total = total;
        // console.log(total, '===========打印的 ------ total');
      });
    });
    await Promise.all(promises);
    return filteredVideoList;
  } catch (error) {
    console.log(error, '===========打印的 ------ error');
    return Promise.resolve([]);
  }
};

export const fetchVideosByUsers = async (users, cookie) => {
  const promises = users.map(async (item) => {
    return fetchUserVideosService(item.mid, cookie).then(
      (filteredVideoList) => {
        item.videos = filteredVideoList;
        return item;
      },
    );
  });
  const data = await Promise.all(promises);
  return data;
};

export const getVideoInfo = (id, type = 'bvid') => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${baseUrl}web-interface/view?${type}=${id}`,
      success: (res) => {
        const data = res.data.data;
        if (data) {
          return resolve(data);
        }
        reject(res.data.message);
      },
    });
  });
};

export const checkLicense = (license) => {
  // const license = uni.getStorageSync('license');
  let extId = uni.getDeviceInfo().deviceId;
  if (extId.length < 32) {
    extId = 'uFtmTHzNYzVAi' + extId;
  }
  console.log(extId, '===========打印的 ------ checkLicense');
  return new Promise((resolve, reject) => {
    let ip = '';
    let address = '';
    uni.request({
      url: 'https://ip.useragentinfo.com/json',
      complete: ({ data }) => {
        console.log(data, '===========打印的 ------ complete');
        if (data.code === 200) {
          ip = data.ip;
          address = data.province + data.city + data.area;
        }
        uni.request({
          url: `https://service-bekobsys-1253419200.gz.apigw.tencentcs.com/release/license/auth2?key=${license}&ip=${ip}&address=${address}&extId=${extId}&type=视频数据监控`,
          success: (res) => {
            console.log(res, '===========打印的 ------ success');
            if (res.data.success) {
              return resolve(res.data);
            } else {
              return reject(res);
            }
          },
          fail: (err) => {
            console.log(err, '===========打印的 ------ fail');
            return reject(err);
          },
        });
      },
    });
  });
};
