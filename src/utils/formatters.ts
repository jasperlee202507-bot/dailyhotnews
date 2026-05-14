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

export const formatHotScore = (num: number): string => {
  if (!Number.isFinite(num) || num <= 0) return '0';
  if (num >= 1e12) {
    const v = num / 1e12;
    const s = v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2);
    return `${parseFloat(s)}万亿`;
  }
  if (num >= 1e8) {
    const v = num / 1e8;
    const s = v >= 100 ? v.toFixed(0) : v.toFixed(1);
    return `${parseFloat(s)}亿`;
  }
  if (num >= 10000) {
    const s = (num / 10000).toFixed(1);
    return `${parseFloat(s)}万`;
  }
  return String(Math.round(num));
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
