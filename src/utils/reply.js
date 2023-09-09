import { getImgSize } from '@/utils/index';

export const getReplyData = async (topReply) => {
  let message = topReply.message;
  const sendTextType = topReply.sendTextType || 'fixed';
  debugger;
  if (sendTextType === 'random') {
    const messageList = message
      .replace(/\s+/g, '') // 替换所有空格
      .replace(/\s/g, '') // 替换单个空格
      .replace(/，/g, ',') // 替换所有逗号为英文逗号
      .split(',');
    message = messageList[Math.floor(Math.random() * messageList.length)];
  }
  const img1 = topReply.img1;
  const img2 = topReply.img2;
  if (!img1 && !img2) {
    return {
      message,
      pictures: undefined,
    };
  }
  const getImgText = (height, width, img, size) => {
    return `{"img_height":${height},"img_width":${width},"img_src":"${img}","img_size":${size}}`;
  };
  const img1Size = await getImgSize(img1);
  if (!img1Size) {
    alert('图片1加载失败, 请重新选择文件上传');
    return;
  }
  let pictures = `[${getImgText(
    img1Size.height,
    img1Size.width,
    img1,
    img1Size.size,
  )}]`;
  if (img2) {
    const img2Size = await getImgSize(img2);
    if (!img2Size) {
      alert('图片2加载失败, 请重新填写图片链接');
      return;
    }
    pictures = `[${getImgText(
      img1Size.height,
      img1Size.width,
      img1,
      img1Size.size,
    )},${getImgText(img2Size.height, img2Size.width, img2, img2Size.size)}]`;
  }

  return {
    message: randomMessage,
    pictures,
  };
};
