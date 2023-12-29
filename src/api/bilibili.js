import dayjs from 'dayjs';
import request from '@/utils/request';
import qs from 'qs';
import service from '@/utils/request';
import axios from 'axios';
import { BaseOrigin, formatDate } from '@/utils';

const isDev = process.env.NODE_ENV === 'development';

const baseUrl = BaseOrigin + '/bili-watch/';

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
export const fetchVideoOnlineTotalInfo = (video) => {
  const { aid, cid, bvid, title } = video;
  return service.get('player/online/total', {
    params: {
      aid,
      cid,
      bvid,
      title,
    },
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

export const getVideoInfo = (id, type = 'bvid', title) => {
  return service.get('web-interface/view', {
    params: {
      [type]: id,
      title,
    },
  });
};

export const getReplyHot = (video) => {
  return service.get('v2/reply/main', {
    params: {
      title: video.title,
      oid: video.aid,
      bvid: video.bvid,
      cookie: video.cookie,
      type: 1,
      mode: 3,
      next: 0,
      plat: 1,
    },
  });
};

export const getReply = (oid, pn = 1, cookie) => {
  const csrf = cookie.match(/bili_jct=(.+?);/)[1];
  return service.get('v2/reply/main', {
    params: {
      csrf,
      mode: 3,
      oid: oid,
      pagination_str: {
        offset: `{"type":1,"direction":1,"data":{"pn": ${pn}}`,
      },
      type: 1,
      plat: 1,
    },
  });
};

// export const submitDynamic = ({ cookie, data }) => {
//   const csrf = cookie.match(/bili_jct=(.+?);/)[1];
//   return service.post('/x/dynamic/feed/create/dyn?csrf=' + csrf, {
//     dyn_req: {
//       ...data,
//       attach_card: null,
//       upload_id: '7560113_1684937710_6116',
//       meta: { app_meta: { from: 'create.dynamic.web', mobi_app: 'web' } },
//     },
//   });
// };

export const delReplyByVideoAndCookie = (video) => {
  return service.post('/v2/reply/delByVideoAndCookie', {
    video,
    useAddBlack: true,
  });
};

export const getAutoMsgContent = (cookie) => {
  return service.post('/link_setting/get_sys_setting', {
    cookie,
  });
};

export const getLinkSetting = (cookie, name) => {
  return service.post('/link_setting/get', {
    cookie,
    name,
  });
};

export const setLinkSetting = (cookie, key) => {
  return service.post('/link_setting/set', {
    cookie,
    key,
  });
};

export const getReplyText = (cookie, key) => {
  return service.post('/auto_reply/get_reply_text', {
    cookie,
    key,
  });
};

export const getDynamicList = (cookie) => {
  return service.post('/getDynamicList', {
    cookie,
  });
};

export const submitDynamic = (cookie, body) => {
  return service.post('/submitDynamic', {
    cookie,
    body,
  });
};

// 开启精选
export const startReplyJingXuan = (cookie, oid) => {
  return service.post('/reply/jingxuan', {
    cookie,
    oid,
  });
};

export const setReplyText = (cookie, key, content) => {
  return service.post('/auto_reply/set_reply_text', {
    cookie,
    key,
    content,
  });
};

export const delDm = (video) => {
  return service.post('/delDm', { video });
};

export const batchDeleteReply = (videoList) => {
  return service.post('/v2/reply/batch/del', {
    videoList,
  });
};

export const delReply = (video) => {
  return service.post('/v2/reply/del', { video });
};

export const checkLicense = (license) => {
  let extId = uni.getDeviceInfo().deviceId;
  if (extId.length < 32) {
    extId = 'uFtmTHzNYzVA' + extId;
    extId = extId.padEnd(32, 'c');
  }
  return axios
    .get(BaseOrigin + `/auth?key=${license}&extId=${extId}&type=视频数据监控`)
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

// 发送评论
export const sendReply = ({ cookie, oid, message, pictures }) => {
  const csrf = cookie.match(/bili_jct=(.+?);/)[1];
  const formdata = {
    oid,
    type: 1,
    message,
    csrf,
    pictures,
    sync_to_dynamic: 0,
    ts: Math.floor(Date.now() / 1000),
    vote: 0,
  };
  const data = qs.stringify(formdata);
  return service.post('/v2/reply/add', data, {
    headers: {
      zhibiCookie: cookie,
    },
  });
};

// 设置置顶评论
export const setTopReply = ({ cookie, oid, rpid }) => {
  const csrf = cookie.match(/bili_jct=(.+?);/)[1];
  const formdata = {
    oid,
    type: 1,
    rpid,
    action: 1,
    csrf,
  };
  const data = qs.stringify(formdata);
  return service.post('/v2/reply/top', data, {
    headers: {
      zhibiCookie: cookie,
    },
  });
};

export const getSpaceInfo = (cookie) => {
  return service.post('/space/myinfo', {
    cookie,
  });
};

export const getUserVideoList = (mid) => {
  return axios
    .get('https://bili.xlzy520.cn/bili-watch/getUserVideos', {
      params: {
        mid,
      },
    })
    .then((res) => {
      return res.data;
    });
};

export const uploadVideoList = () => {
  const videoList = uni.getStorageSync('videoList') || [];
  const record = videoList.map((item) => {
    return {
      title: item.title,
      bvid: item.bvid,
      stat: item.stat,
      created: formatDate(item.ctime * 1000),
    };
  });

  return axios.post('https://bili.xlzy520.cn/aooxus', {
    key: uni.getStorageSync('license'),
    record,
  });
};
