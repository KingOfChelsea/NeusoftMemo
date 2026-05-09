<template>
  <div class="card-style">
    <div class="task-grid">
      <div
        v-for="task in props.tasks"
        :key="task.id"
        class="task-card"
        :class="{
          completed: task.completed,
          urgent: getPriorityType(task.priority) === 'danger',
          high: getPriorityType(task.priority) === 'warning'
        }"
      >
        <!-- 卡片顶部状态栏 -->
        <div class="card-status-bar" :class="getPriorityType(task.priority)">
          <div class="status-dot"></div>
          <span class="status-text">{{ task.completed ? '已完成' : '进行中' }}</span>
          <span class="task-id">#{{ task.id.toString().slice(-6) }}</span>
        </div>

        <!-- 卡片主体内容 -->
        <div class="card-body">
          <!-- 任务标题区域 -->
          <div class="card-title-section">
            <div class="title-row">
              <h3 class="task-title">
                <span :class="{ 'completed-text': task.completed }">{{ task.title }}</span>
                <el-tag
                  v-if="props.settings.displayOptions.includes('showPriority') && task.priority"
                  :type="getPriorityType(task.priority)"
                  size="small"
                  class="priority-tag"
                >
                  {{ task.priority }}
                </el-tag>
              </h3>

              <el-tag
                v-if="props.settings.displayOptions.includes('showProject') && task.project"
                type="success"
                class="project-tag"
                size="large"
              >
                <el-icon><Folder /></el-icon>
                {{ task.project }}
              </el-tag>
            </div>

            <!-- 任务描述 -->
            <div
              v-if="task.description && props.settings.displayOptions.includes('showDescription')"
              class="task-description"
            >
              <div class="description-text">{{ task.description }}</div>
            </div>
          </div>

          <!-- 任务元信息 -->
          <div class="card-meta-info">
            <!-- 截止日期 -->
            <div
              v-if="props.settings.displayOptions.includes('showDeadline') && task.deadline"
              class="meta-item deadline"
              :class="{ overdue: isOverdue(task.deadline) }"
            >
              <div class="meta-icon">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="meta-content">
                <div class="meta-label">截止日期</div>
                <div class="meta-value">{{ formatDate(task.deadline) }}</div>
              </div>
            </div>

            <!-- 子任务进度 -->
            <div
              v-if="task.subtasks && task.subtasks.length > 0"
              class="meta-item subtasks"
            >
              <div class="meta-icon">
                <el-icon><List /></el-icon>
              </div>
              <div class="meta-content">
                <div class="meta-label">子任务进度</div>
                <div class="progress-container">
                  <el-progress
                    :percentage="getSubtaskProgress(task.subtasks)"
                    :stroke-width="4"
                    :color="getProgressColor(getSubtaskProgress(task.subtasks))"
                    :show-text="false"
                    class="progress-bar"
                  />
                  <div class="progress-text">
                    {{ getCompletedSubtasks(task.subtasks) }}/{{ task.subtasks.length }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 标签 -->
            <div
              v-if="props.settings.displayOptions.includes('showTags') && task.tags && task.tags.length > 0"
              class="meta-item tags"
            >
              <div class="meta-icon">
                <el-icon><PriceTag /></el-icon>
              </div>
              <div class="meta-content">
                <div class="meta-label">标签</div>
                <div class="tags-container">
                  <el-tag
                    v-for="tag in task.tags.slice(0, 2)"
                    :key="tag"
                    size="small"
                    class="tag-item"
                    effect="plain"
                  >
                    {{ tag }}
                  </el-tag>
                  <span v-if="task.tags.length > 2" class="more-tags">
                    +{{ task.tags.length - 2 }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 子任务区域 -->
          <div
            v-if="props.settings.displayOptions.includes('showSubtasks') && task.subtasks && task.subtasks.length > 0"
            class="card-subtasks"
          >
            <div class="subtasks-header">
              <div class="header-left">
                <el-icon><List /></el-icon>
                <span class="subtasks-title">子任务 ({{ getCompletedSubtasks(task.subtasks) }}/{{ task.subtasks.length }})</span>
              </div>
              <div class="header-right">
                <span class="progress-rate">{{ getSubtaskProgress(task.subtasks) }}%</span>
              </div>
            </div>

            <div class="subtasks-list">
              <div
                v-for="(subtask, index) in task.subtasks.slice(0, 3)"
                :key="subtask.id"
                class="subtask-item"
                :class="{ completed: subtask.completed }"
              >
                <el-checkbox
                  :model-value="subtask.completed"
                  :label="subtask.title"
                  size="small"
                  class="subtask-checkbox"
                />
                <div
                  v-if="props.settings.displayOptions.includes('showAssignees') && subtask.assignees && subtask.assignees.length > 0"
                  class="subtask-assignee"
                >
                  <el-avatar :size="20" class="assignee-avatar">
                    {{ subtask.assignees[0].charAt(0) }}
                  </el-avatar>
                  <span class="assignee-name">{{ subtask.assignees[0] }}</span>
                  <span v-if="subtask.assignees.length > 1" class="more-assignees">
                    等{{ subtask.assignees.length }}人
                  </span>
                </div>
              </div>

              <div v-if="task.subtasks.length > 3" class="more-subtasks">
                <el-icon><More /></el-icon>
                还有 {{ task.subtasks.length - 3 }} 个子任务
              </div>
            </div>
          </div>
        </div>

        <!-- 卡片底部 -->
        <div class="card-footer">
          <div class="footer-left">
            <el-icon><Timer /></el-icon>
            <span class="create-time">{{ formatCreateTime(task.id) }}</span>
          </div>
          <div class="footer-right">
            <span class="task-actions">
              <el-button type="text" size="small" class="detail-btn">详情</el-button>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import {
  Calendar,
  PriceTag,
  List,
  User,
  Folder,
  Timer,
  More
} from '@element-plus/icons-vue'

const props = defineProps({
  tasks: Array,
  settings: Object,
  page: Number
})

const getPriorityType = (priority) => {
  if (!priority) return 'info'
  if (priority.includes('P1') || priority.includes('紧急')) return 'danger'
  if (priority.includes('P2') || priority.includes('高')) return 'warning'
  if (priority.includes('P3') || priority.includes('中')) return 'primary'
  return 'info'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  })
}

const formatCreateTime = (taskId) => {
  const date = new Date(taskId)
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  })
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
  if (percentage >= 100) return '#67c232'
  if (percentage >= 80) return '#409eff'
  if (percentage >= 50) return '#e6a23c'
  return '#f56c6c'
}
</script>

<style lang="scss" scoped>
.card-style {
  .task-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 20px;
    padding: 5px;

    .task-card {
      background: white;
      border-radius: 10px;
      border: 1px solid #e8e8e8;
      // transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        border-color: #d4d4d4;
      }

      &.completed {
        background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
        border-color: #e8e8e8;

        .task-title .completed-text {
          text-decoration: line-through;
          color: #909399;
          opacity: 0.7;
        }

        .card-status-bar {
          height: 15px;
          background: linear-gradient(135deg, #a8a8a8 0%, #909399 100%);
        }
      }

      &.urgent {
        .card-status-bar {
          height: 15px;
          background: linear-gradient(135deg, #ff6b6b 0%, #f56c6c 100%);
        }
      }

      &.high {
        .card-status-bar {
          height: 15px;
          background: linear-gradient(135deg, #ffa726 0%, #e6a23c 100%);
        }
      }

      .card-status-bar {
        height: 10px;
        background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
        position: relative;

        .status-dot {
          position: absolute;
          top: 50%;
          left: 12px;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .status-text {
          position: absolute;
          top: 50%;
          left: 28px;
          transform: translateY(-50%);
          color: white;
          font-size: 11px;
          font-weight: 500;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .task-id {
          position: absolute;
          top: 50%;
          right: 12px;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.8);
          font-size: 10px;
          font-family: 'Courier New', monospace;
        }
      }

      .card-body {
        padding: 20px;
        flex: 1;

        .card-title-section {
          margin-bottom: 20px;

          .title-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;

            .task-title {
              flex: 1;
              margin: 0;
              font-size: 16px;
              font-weight: 600;
              color: #1a1a1a;
              line-height: 1.4;
              display: flex;
              align-items: center;
              gap: 8px;

              .priority-tag {
                flex-shrink: 0;
                font-size: 10px;
                padding: 1px 6px;
                border-radius: 10px;
              }
            }

            .project-tag {
              flex-shrink: 0;
              font-size: 11px;
              padding: 3px 8px;
              border-radius: 12px;
              .el-icon {
                font-size: 10px;
                margin-right: 4px;
              }
            }
          }

          .task-description {
            margin-top: 8px;

            .description-text {
              font-size: 13px;
              color: #606266;
              line-height: 1.6;
              display: -webkit-box;
              // -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
              padding-left: 4px;
              border-left: 2px solid #f0f2f5;
            }
          }
        }

        .card-meta-info {
          margin: 20px 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;

          .meta-item {
            display: flex;
            align-items: center;
            gap: 12px;

            &.deadline.overdue {
              .meta-icon {
                background: rgba(245, 108, 108, 0.1);
                color: #f56c6c;
              }

              .meta-label {
                color: #f56c6c;
              }

              .meta-value {
                color: #f56c6c;
                font-weight: 600;

                &::after {
                  content: ' (已过期)';
                  font-size: 11px;
                  opacity: 0.8;
                }
              }
            }

            .meta-icon {
              width: 36px;
              height: 36px;
              min-width: 36px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(64, 158, 255, 0.08);
              border-radius: 10px;
              color: #409eff;
              font-size: 16px;
            }

            .meta-content {
              flex: 1;

              .meta-label {
                font-size: 11px;
                color: #909399;
                margin-bottom: 2px;
                font-weight: 500;
              }

              .meta-value {
                font-size: 13px;
                color: #303133;
                font-weight: 500;
              }

              .progress-container {
                display: flex;
                align-items: center;
                gap: 8px;

                .progress-bar {
                  flex: 1;

                  :deep(.el-progress-bar__outer) {
                    border-radius: 4px;
                  }

                  :deep(.el-progress-bar__inner) {
                    border-radius: 4px;
                  }
                }

                .progress-text {
                  font-size: 12px;
                  color: #606266;
                  min-width: 40px;
                  text-align: right;
                }
              }

              .tags-container {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
                margin-top: 2px;

                .tag-item {
                  font-size: 10px;
                  padding: 1px 6px;
                  border-radius: 8px;
                  background: #f0f2f5;
                  color: #606266;
                  border: none;
                }

                .more-tags {
                  font-size: 10px;
                  color: #909399;
                  align-self: center;
                  margin-left: 2px;
                }
              }
            }
          }
        }

        .card-subtasks {
          margin-top: 20px;
          padding: 16px;
          background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
          border-radius: 10px;

          .subtasks-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            .header-left {
              display: flex;
              align-items: center;
              gap: 6px;

              .el-icon {
                color: #409eff;
                font-size: 14px;
              }

              .subtasks-title {
                font-size: 12px;
                color: #606266;
                font-weight: 500;
              }
            }

            .header-right {
              .progress-rate {
                font-size: 12px;
                font-weight: 600;
                color: #409eff;
                background: white;
                padding: 2px 8px;
                border-radius: 10px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
            }
          }

          .subtasks-list {
            .subtask-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 0;
              border-bottom: 1px solid rgba(224, 224, 224, 0.5);

              &:last-child {
                border-bottom: none;
              }

              &.completed {
                .subtask-checkbox {
                  :deep(.el-checkbox__label) {
                    text-decoration: line-through;
                    color: #909399;
                  }
                }
              }

              .subtask-checkbox {
                flex: 1;

                :deep(.el-checkbox__label) {
                  font-size: 12px;
                  color: #606266;
                }
              }

              .subtask-assignee {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 11px;
                color: #909399;

                .assignee-avatar {
                  background: linear-gradient(135deg, #a8d8ff 0%, #409eff 100%);
                  color: white;
                  font-size: 10px;
                  font-weight: bold;
                }

                .assignee-name {
                  max-width: 60px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }

                .more-assignees {
                  font-size: 10px;
                  opacity: 0.8;
                }
              }
            }

            .more-subtasks {
              display: flex;
              align-items: center;
              gap: 6px;
              padding: 8px 0 0 0;
              font-size: 11px;
              color: #909399;
              justify-content: center;

              .el-icon {
                font-size: 10px;
              }
            }
          }
        }
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 20px;
        border-top: 1px solid #f0f0f0;
        background: rgba(248, 249, 250, 0.5);

        .footer-left {
          display: flex;
          align-items: center;
          gap: 6px;

          .el-icon {
            color: #909399;
            font-size: 12px;
          }

          .create-time {
            font-size: 11px;
            color: #909399;
          }
        }

        .footer-right {
          .task-actions {
            .detail-btn {
              font-size: 12px;
              color: #409eff;
              padding: 0;
              height: auto;

              &:hover {
                color: #66b1ff;
              }
            }
          }
        }
      }
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .card-style {
    .task-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
}
</style>
