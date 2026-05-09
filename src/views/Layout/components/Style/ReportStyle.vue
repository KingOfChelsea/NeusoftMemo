<template>
  <div class="report-style">
    <div class="report-content">
      <div
        v-for="task in props.tasks"
        :key="task.id"
        class="report-task-item"
        :class="{ completed: task.completed }"
      >
        <!-- 任务标题区域 -->
        <div class="task-header">
          <div class="task-number">任务 {{ props.tasks.indexOf(task) + 1 }}</div>
          <div class="task-title-section">
            <h3 class="task-title">{{ task.title }}</h3>
            <div class="task-meta-badges">
              <template v-if="props.settings.displayOptions.includes('showProject') && task.project">
                <span class="meta-badge project">
                  <el-icon><Folder /></el-icon>
                  {{ task.project }}
                </span>
              </template>

              <template v-if="props.settings.displayOptions.includes('showPriority') && task.priority">
                <span class="meta-badge priority" :class="getPriorityClass(task.priority)">
                  <el-icon><Flag /></el-icon>
                  {{ task.priority }}
                </span>
              </template>

              <template v-if="props.settings.displayOptions.includes('showStatus')">
                <span class="meta-badge status" :class="task.completed ? 'completed' : 'pending'">
                  <el-icon><Check /></el-icon>
                  {{ task.completed ? '已完成' : '进行中' }}
                </span>
              </template>
            </div>
          </div>
        </div>

        <!-- 任务描述 -->
        <div v-if="task.description && props.settings.displayOptions.includes('showDescription')"
             class="task-description-section">
          <div class="section-title">
            <el-icon><Document /></el-icon>
            <span>任务描述</span>
          </div>
          <div class="description-content">
            {{ task.description }}
          </div>
        </div>

        <!-- 关键信息 -->
        <div class="key-info-section">
          <el-row :gutter="20">
            <el-col :span="8" v-if="props.settings.displayOptions.includes('showDeadline') && task.deadline">
              <div class="info-item deadline" :class="{ overdue: isOverdue(task.deadline) }">
                <div class="info-label">
                  <el-icon><Calendar /></el-icon>
                  截止日期
                </div>
                <div class="info-value">
                  {{ formatDate(task.deadline) }}
                  <span v-if="isOverdue(task.deadline)" class="overdue-indicator">已过期</span>
                </div>
              </div>
            </el-col>

            <el-col :span="8" v-if="props.settings.displayOptions.includes('showTags') && task.tags && task.tags.length > 0">
              <div class="info-item tags">
                <div class="info-label">
                  <el-icon><PriceTag /></el-icon>
                  标签
                </div>
                <div class="info-value">
                  <div class="tags-list">
                    <span
                      v-for="tag in task.tags"
                      :key="tag"
                      class="tag-item"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </el-col>

            <el-col :span="8" v-if="task.subtasks && task.subtasks.length > 0">
              <div class="info-item subtasks">
                <div class="info-label">
                  <el-icon><List /></el-icon>
                  子任务进度
                </div>
                <div class="info-value">
                  <div class="progress-container">
                    <el-progress
                      :percentage="getSubtaskProgress(task.subtasks)"
                      :stroke-width="8"
                      :color="getProgressColor(getSubtaskProgress(task.subtasks))"
                      :show-text="false"
                    />
                    <div class="progress-text">
                      {{ getCompletedSubtasks(task.subtasks) }}/{{ task.subtasks.length }} 完成
                      <span class="progress-percent">{{ getSubtaskProgress(task.subtasks) }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 子任务详情 -->
        <div v-if="props.settings.displayOptions.includes('showSubtasks') && task.subtasks && task.subtasks.length > 0"
             class="subtasks-details-section">
          <div class="section-title">
            <el-icon><List /></el-icon>
            <span>子任务详情</span>
            <span class="subtitle">(共 {{ task.subtasks.length }} 个子任务)</span>
          </div>

          <div class="subtasks-grid">
            <div
              v-for="(subtask, index) in task.subtasks"
              :key="subtask.id"
              class="subtask-card"
              :class="{ completed: subtask.completed }"
            >
              <div class="subtask-header">
                <div class="subtask-index">#{{ index + 1 }}</div>
                <div class="subtask-title">
                  <el-checkbox
                    :model-value="subtask.completed"
                    :label="subtask.title"
                  />
                </div>
                <div class="subtask-status">
                  <el-tag
                    :type="subtask.completed ? 'success' : 'info'"
                    size="small"
                  >
                    {{ subtask.completed ? '已完成' : '待完成' }}
                  </el-tag>
                </div>
              </div>

              <div v-if="props.settings.displayOptions.includes('showAssignees') && subtask.assignees && subtask.assignees.length > 0"
                   class="subtask-assignees">
                <div class="assignees-label">负责人:</div>
                <div class="assignees-list">
                  <el-tag
                    v-for="assignee in subtask.assignees"
                    :key="assignee"
                    size="small"
                    type="info"
                  >
                    {{ assignee }}
                  </el-tag>
                </div>
              </div>

              <div v-if="subtask.Link && subtask.Link.length > 0" class="subtask-links">
                <div class="links-label">相关链接:</div>
                <div class="links-list">
                  <el-tag
                    v-for="(link, linkIndex) in subtask.Link"
                    :key="linkIndex"
                    size="small"
                    type="warning"
                  >
                    链接 {{ linkIndex + 1 }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分隔线 -->
        <div class="task-divider">
          <el-divider />
        </div>
      </div>

      <!-- 报告总结 -->
      <div v-if="props.tasks.length > 0" class="report-summary">
        <div class="summary-title">
          <el-icon><DataAnalysis /></el-icon>
          <span>任务报告总结</span>
        </div>

        <div class="summary-stats">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-item total">
                <div class="stat-label">任务总数</div>
                <div class="stat-value">{{ props.tasks.length }}</div>
              </div>
            </el-col>

            <el-col :span="6">
              <div class="stat-item completed">
                <div class="stat-label">已完成</div>
                <div class="stat-value">
                  {{ getCompletedTasks(props.tasks) }}
                  <span class="stat-percent">({{ getCompletionRate(props.tasks) }}%)</span>
                </div>
              </div>
            </el-col>

            <el-col :span="6">
              <div class="stat-item pending">
                <div class="stat-label">进行中</div>
                <div class="stat-value">
                  {{ getPendingTasks(props.tasks) }}
                  <span class="stat-percent">({{ getPendingRate(props.tasks) }}%)</span>
                </div>
              </div>
            </el-col>

            <el-col :span="6">
              <div class="stat-item subtasks">
                <div class="stat-label">子任务总数</div>
                <div class="stat-value">{{ getTotalSubtasks(props.tasks) }}</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import {
  Folder, Flag, Check, Document, Calendar,
  PriceTag, List, DataAnalysis
} from '@element-plus/icons-vue'

const props = defineProps({
  tasks: Array,
  settings: Object,
  page: Number
})

const getPriorityClass = (priority) => {
  if (!priority) return ''
  if (priority.includes('P1') || priority.includes('紧急')) return 'priority-urgent'
  if (priority.includes('P2') || priority.includes('高')) return 'priority-high'
  if (priority.includes('P3') || priority.includes('中')) return 'priority-medium'
  if (priority.includes('P4') || priority.includes('低')) return 'priority-low'
  return ''
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const isOverdue = (deadline) => {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}

const getCompletedSubtasks = (subtasks) => {
  if (!subtasks) return 0
  return subtasks.filter(subtask => subtask.completed).length
}

const getSubtaskProgress = (subtasks) => {
  if (!subtasks || subtasks.length === 0) return 0
  return Math.round((getCompletedSubtasks(subtasks) / subtasks.length) * 100)
}

const getProgressColor = (percentage) => {
  if (percentage >= 100) return '#67c23a'
  if (percentage >= 80) return '#409eff'
  if (percentage >= 50) return '#e6a23c'
  return '#f56c6c'
}

const getCompletedTasks = (tasks) => {
  return tasks.filter(task => task.completed).length
}

const getPendingTasks = (tasks) => {
  return tasks.filter(task => !task.completed).length
}

const getCompletionRate = (tasks) => {
  if (tasks.length === 0) return 0
  return Math.round((getCompletedTasks(tasks) / tasks.length) * 100)
}

const getPendingRate = (tasks) => {
  if (tasks.length === 0) return 0
  return Math.round((getPendingTasks(tasks) / tasks.length) * 100)
}

const getTotalSubtasks = (tasks) => {
  return tasks.reduce((total, task) => {
    return total + (task.subtasks ? task.subtasks.length : 0)
  }, 0)
}
</script>

<style lang="scss" scoped>
.report-style {
  .report-content {
    .report-task-item {
      margin-bottom: 30px;
      padding: 20px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e4e7ed;

      &.completed {
        background: #f8f9fa;
        border-color: #e9ecef;

        .task-title {
          text-decoration: line-through;
          color: #909399;
        }
      }

      &:hover {
        border-color: #409eff;
        box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
      }

      .task-header {
        display: flex;
        align-items: flex-start;
        margin-bottom: 20px;

        .task-number {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #409eff, #67c23a);
          color: white;
          border-radius: 8px;
          font-size: 20px;
          font-weight: bold;
          flex-shrink: 0;
          margin-right: 20px;
        }

        .task-title-section {
          flex: 1;

          .task-title {
            margin: 0 0 12px 0;
            font-size: 20px;
            font-weight: 600;
            color: #303133;
            line-height: 1.4;
          }

          .task-meta-badges {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;

            .meta-badge {
              display: inline-flex;
              align-items: center;
              gap: 4px;
              padding: 4px 10px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;

              &.project {
                background: rgba(64, 158, 255, 0.1);
                color: #409eff;
                border: 1px solid rgba(64, 158, 255, 0.2);
              }

              &.priority {
                &.priority-urgent {
                  background: rgba(245, 108, 108, 0.1);
                  color: #f56c6c;
                  border: 1px solid rgba(245, 108, 108, 0.2);
                }

                &.priority-high {
                  background: rgba(230, 162, 60, 0.1);
                  color: #e6a23c;
                  border: 1px solid rgba(230, 162, 60, 0.2);
                }

                &.priority-medium {
                  background: rgba(64, 158, 255, 0.1);
                  color: #409eff;
                  border: 1px solid rgba(64, 158, 255, 0.2);
                }

                &.priority-low {
                  background: rgba(103, 194, 58, 0.1);
                  color: #67c23a;
                  border: 1px solid rgba(103, 194, 58, 0.2);
                }
              }

              &.status {
                &.completed {
                  background: rgba(103, 194, 58, 0.1);
                  color: #67c23a;
                  border: 1px solid rgba(103, 194, 58, 0.2);
                }

                &.pending {
                  background: rgba(245, 108, 108, 0.1);
                  color: #f56c6c;
                  border: 1px solid rgba(245, 108, 108, 0.2);
                }
              }
            }
          }
        }
      }

      .task-description-section {
        margin-bottom: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 6px;
        border-left: 4px solid #409eff;

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #409eff;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .description-content {
          color: #606266;
          line-height: 1.6;
          font-size: 14px;
        }
      }

      .key-info-section {
        margin-bottom: 20px;

        .info-item {
          padding: 15px;
          border-radius: 6px;
          background: white;
          border: 1px solid #e4e7ed;
          height: 100%;

          &.deadline {
            border-left: 4px solid #409eff;

            &.overdue {
              border-left-color: #f56c6c;

              .info-label {
                color: #f56c6c;
              }

              .overdue-indicator {
                display: inline-block;
                margin-left: 8px;
                padding: 2px 6px;
                background: #f56c6c;
                color: white;
                border-radius: 4px;
                font-size: 11px;
              }
            }
          }

          &.tags {
            border-left: 4px solid #e6a23c;
          }

          &.subtasks {
            border-left: 4px solid #67c23a;
          }

          .info-label {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #909399;
            margin-bottom: 8px;
            font-weight: 500;
          }

          .info-value {
            color: #303133;
            font-weight: 500;

            .tags-list {
              display: flex;
              flex-wrap: wrap;
              gap: 4px;

              .tag-item {
                padding: 3px 8px;
                background: #f0f2f5;
                border-radius: 12px;
                font-size: 11px;
                color: #606266;
              }
            }

            .progress-container {
              .el-progress {
                margin-bottom: 8px;
              }

              .progress-text {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                color: #909399;

                .progress-percent {
                  font-weight: bold;
                  color: #409eff;
                }
              }
            }
          }
        }
      }

      .subtasks-details-section {
        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 15px;
          font-size: 16px;

          .subtitle {
            font-size: 12px;
            color: #909399;
            font-weight: normal;
            margin-left: 4px;
          }
        }

        .subtasks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;

          .subtask-card {
            padding: 12px;
            border: 1px solid #e4e7ed;
            border-radius: 6px;
            background: white;

            &.completed {
              background: #f8f9fa;

              :deep(.el-checkbox__label) {
                text-decoration: line-through;
                color: #909399;
              }
            }

            .subtask-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;

              .subtask-index {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f0f2f5;
                color: #606266;
                border-radius: 50%;
                font-size: 12px;
                font-weight: bold;
              }

              .subtask-title {
                flex: 1;
                margin: 0 8px;
              }
            }

            .subtask-assignees {
              margin-top: 8px;
              font-size: 12px;

              .assignees-label {
                color: #909399;
                margin-bottom: 4px;
              }

              .assignees-list {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
              }
            }

            .subtask-links {
              margin-top: 8px;
              font-size: 12px;

              .links-label {
                color: #909399;
                margin-bottom: 4px;
              }

              .links-list {
                display: flex;
                gap: 4px;
              }
            }
          }
        }
      }

      .task-divider {
        margin-top: 20px;
      }
    }

    .report-summary {
      margin-top: 30px;
      padding: 20px;
      background: #f5f7fa;
      border-radius: 8px;
      border: 1px solid #e4e7ed;

      .summary-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 20px;
      }

      .summary-stats {
        .stat-item {
          padding: 20px;
          border-radius: 8px;
          background: white;
          text-align: center;
          border: 1px solid #e4e7ed;

          &.total {
            border-top: 4px solid #409eff;
          }

          &.completed {
            border-top: 4px solid #67c23a;
          }

          &.pending {
            border-top: 4px solid #e6a23c;
          }

          &.subtasks {
            border-top: 4px solid #909399;
          }

          .stat-label {
            font-size: 12px;
            color: #909399;
            margin-bottom: 8px;
          }

          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #303133;

            .stat-percent {
              font-size: 12px;
              color: #909399;
              font-weight: normal;
              margin-left: 4px;
            }
          }
        }
      }
    }
  }
}
</style>
