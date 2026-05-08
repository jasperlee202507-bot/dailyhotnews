export const formatTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  
  if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else {
    const d = new Date(date);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  }
};

export const formatNumber = (num: number): string => {
  if (num >= 10000) {
    const result = (num / 10000).toFixed(1);
    return `${parseFloat(result)}万`;
  }
  return num.toString();
};

export const getHotLevel = (score: number): { label: string; color: string } => {
  if (score >= 80000) {
    return { label: '爆', color: 'text-red-500' };
  } else if (score >= 50000) {
    return { label: '热', color: 'text-orange-500' };
  } else if (score >= 20000) {
    return { label: '新', color: 'text-yellow-500' };
  }
  return { label: '', color: '' };
};
