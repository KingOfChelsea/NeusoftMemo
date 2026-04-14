// utils/taskUtils.js
import { isToday, isTomorrow, isThisWeek, isOverdue } from './dateUtils'

/**
 * 统计基于时间的任务数量
 * @param {Array} tasks - 任务数组
 * @returns {Object} 各种分类的任务数量
 */
export const getTaskStatsByTime = (tasks) => {
  if (!tasks || !tasks.length) {
    return {
      today: 0,
      tomorrow: 0,
      thisWeek: 0,
      overdue: 0,
      total: 0,
      completed: 0,
    }
  }

  const stats = {
    today: 0,
    tomorrow: 0,
    thisWeek: 0,
    overdue: 0,
    total: tasks.length,
    completed: 0,
  }

  tasks.forEach((task) => {
    // 统计已完成的任务
    if (task.completed) {
      stats.completed++
      return // 已完成的任务不计入时间统计
    }

    if (!task.deadline) return // 无截止日期的不计入

    if (isToday(task.deadline)) stats.today++
    if (isTomorrow(task.deadline)) stats.tomorrow++
    if (isThisWeek(task.deadline)) stats.thisWeek++
    if (isOverdue(task.deadline)) stats.overdue++
  })

  return stats
}

/**
 * 按项目统计任务
 * @param {Array} tasks - 任务数组
 * @returns {Object} 按项目分组的统计
 */
export const getTaskStatsByProject = (tasks) => {
  if (!tasks || !tasks.length) return {}

  const projectStats = {}

  tasks.forEach((task) => {
    const project = task.project || '未分类'

    if (!projectStats[project]) {
      projectStats[project] = {
        total: 0,
        completed: 0,
        uncompleted: 0,
      }
    }

    projectStats[project].total++
    if (task.completed) {
      projectStats[project].completed++
    } else {
      projectStats[project].uncompleted++
    }
  })

  return projectStats
}

/**
 * 按优先级统计任务
 * @param {Array} tasks - 任务数组
 * @returns {Object} 按优先级分组的统计
 */
export const getTaskStatsByPriority = (tasks) => {
  if (!tasks || !tasks.length) return {}

  const priorityStats = {}

  tasks.forEach((task) => {
    const priority = task.priority || '无'

    if (!priorityStats[priority]) {
      priorityStats[priority] = {
        total: 0,
        completed: 0,
        uncompleted: 0,
      }
    }

    priorityStats[priority].total++
    if (task.completed) {
      priorityStats[priority].completed++
    } else {
      priorityStats[priority].uncompleted++
    }
  })

  return priorityStats
}
