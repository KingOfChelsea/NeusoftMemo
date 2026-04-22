// utils/formatters.js
/**
 * 格式化日期时间
 * @param {string|Date} date - 日期时间
 * @returns {string} 格式化后的字符串
 */
export const formatDateTime = (date) => {
  if (!date) return ''

  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 生成随机ID
 * @returns {number} 随机ID
 */
export const generateRandomId = () => {
  return Math.floor(Math.random() * 1000000)
}
