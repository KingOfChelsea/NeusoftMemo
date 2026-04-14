// utils/dateUtils.js

/**
 * 获取今天的日期（不包含时间）
 * @returns {Date} 今天的0点
 */
export const getToday = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

/**
 * 获取明天的日期
 * @returns {Date} 明天的0点
 */
export const getTomorrow = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow
}

/**
 * 获取本周的开始日期（周一）
 * @returns {Date} 本周一的0点
 */
export const getWeekStart = () => {
  const now = new Date()
  const day = now.getDay() // 0-6, 0是周日
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) // 调整到周一
  const weekStart = new Date(now.setDate(diff))
  weekStart.setHours(0, 0, 0, 0)
  return weekStart
}

/**
 * 获取本周的结束日期（周日）
 * @returns {Date} 本周日的23:59:59.999
 */
export const getWeekEnd = () => {
  const weekStart = getWeekStart()
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)
  return weekEnd
}

/**
 * 判断日期是否是今天
 * @param {Date} date - 要判断的日期
 * @returns {boolean} 是否是今天
 */
export const isToday = (date) => {
  if (!date) return false
  const today = getToday()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const targetDate = new Date(date)
  return targetDate >= today && targetDate < tomorrow
}

/**
 * 判断日期是否是明天
 * @param {Date} date - 要判断的日期
 * @returns {boolean} 是否是明天
 */
export const isTomorrow = (date) => {
  if (!date) return false
  const tomorrow = getTomorrow()
  const dayAfterTomorrow = new Date(tomorrow)
  dayAfterTomorrow.setDate(tomorrow.getDate() + 1)

  const targetDate = new Date(date)
  return targetDate >= tomorrow && targetDate < dayAfterTomorrow
}

/**
 * 判断日期是否在本周内
 * @param {Date} date - 要判断的日期
 * @returns {boolean} 是否在本周内
 */
export const isThisWeek = (date) => {
  if (!date) return false
  const weekStart = getWeekStart()
  const weekEnd = getWeekEnd()

  const targetDate = new Date(date)
  return targetDate >= weekStart && targetDate <= weekEnd
}

/**
 * 判断日期是否已过期
 * @param {Date} date - 要判断的日期
 * @returns {boolean} 是否已过期
 */
export const isOverdue = (date) => {
  if (!date) return false
  const targetDate = new Date(date)
  return targetDate < new Date()
}

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date|string} date - 日期
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 获取日期的相对描述
 * @param {Date|string} date - 日期
 * @returns {string} 相对描述（今天、明天、本周、具体日期）
 */
export const getRelativeDateDesc = (date) => {
  if (!date) return '无截止日期'

  if (isToday(date)) return '今天'
  if (isTomorrow(date)) return '明天'
  if (isThisWeek(date)) return '本周'
  if (isOverdue(date)) return '已过期'

  return formatDate(date)
}
