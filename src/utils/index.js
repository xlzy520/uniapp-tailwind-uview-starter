import dayjs from 'dayjs';

export const formatTime = (time, template = 'YY/MM/DD HH:mm:ss') =>
  dayjs(time).format(template);
