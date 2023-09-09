import service from '@/utils/request';

export const getPhotoList = (cookie) => {
  return service.post('/getPhotoList', {
    cookie,
  });
};

export const getCommentList = (cookie, photoId) => {
  return service.post('/getCommentList', {
    cookie,
    photoId,
  });
};

export const deleteCommentList = (cookie, commentIdList) => {
  return service.post('/deleteCommentList', {
    cookie,
    commentIdList,
  });
};

export const deleteCommentListByPhoto = (photo) => {
  return service.post('/deleteCommentListByPhoto', { photo });
};
