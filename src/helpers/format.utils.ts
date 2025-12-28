import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export const helpFormatDate = (dayObject: string): string => {
  try {
    if (!dayObject) return 'N/A';
    const formatDate = dayjs(dayObject).format('DD/MM/YYYY');
    return formatDate;
  } catch (err: any) {
    throw new Error('Lỗi', { cause: err });
  }
};

export const helpFormatTime = (timeObject: string): string => {
  try {
    if (!timeObject) return 'N/A';
    const formatTime = dayjs.utc(timeObject).format('HH:mm');
    return formatTime;
  } catch (err: any) {
    throw new Error('Lỗi', { cause: err });
  }
};
