<template>
  <div class="detailed-style">
    <div
      v-for="task in props.tasks"
      :key="task.id"
      class="detailed-task-item"
      :class="{ completed: task.completed }"
    >
      <div class="task-header">
        <div class="task-title-section">
          <h3 class="task-title">{{ task.title }}</h3>
          <div class="task-tags">
            <template v-if="props.settings.displayOptions.includes('showProject') && task.project">
              <el-tag type="info" size="small">
                {{ task.project }}
              </el-tag>
            </template>
            <template v-if="props.settings.displayOptions.includes('showPriority') && task.priority">
              <el-tag :type="getPriorityType(task.priority)" size="small" effect="dark">
                {{ task.priority }}
              </el-tag>
            </template>
            <template v-if="props.settings.displayOptions.includes('showStatus')">
              <el-tag :type="task.completed ? 'success' : 'danger'" size="small">
                {{ task.completed ? '已完成' : '进行中' }}
              </el-tag>
            </template>
          </div>
        </div>
        <div class="task-id">#{{ task.id.toString().slice(-6) }}</div>
      </div>

      <div v-if="task.description && props.settings.displayOptions.includes('showDescription')"
           class="task-description">
        <div class="description-label">任务描述</div>
        <div class="description-content">{{ task.description }}</div>
      </div>

      <div class="task-details">
        <el-row :gutter="20">
          <el-col :span="6" v-if="props.settings.displayOptions.includes('showDeadline') && task.deadline">
            <div class="detail-item">
              <div class="detail-label">截止日期</div>
              <div class="detail-value">
                {{ formatDate(task.deadline) }}
                <span v-if="isOverdue(task.deadline)" class="overdue-badge">已过期</span>
              </div>
            </div>
          </el-col>

          <el-col :span="6" v-if="props.settings.displayOptions.includes('showTags') && task.tags && task.tags.length > 0">
            <div class="detail-item">
              <div class="detail-label">标签</div>
              <div class="detail-value">
                <el-tag
                  v-for="tag in task.tags"
                  :key="tag"
                  size="small"
                  class="tag-item"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </el-col>

          <el-col :span="6" v-if="task.subtasks && task.subtasks.length > 0">
            <div class="detail-item">
              <div class="detail-label">子任务进度</div>
              <div class="detail-value">
                <el-progress
                  :percentage="getSubtaskProgress(task.subtasks)"
                  :stroke-width="6"
                  :color="getProgressColor(getSubtaskProgress(task.subtasks))"
                  :show-text="false"
                />
                <span class="progress-text">{{ getCompletedSubtasks(task.subtasks) }}/{{ task.subtasks.length }}</span>
              </div>
            </div>
          </el-col>

          <el-col :span="6">
            <div class="detail-item">
              <div class="detail-label">创建时间</div>
              <div class="detail-value">
                {{ new Date(task.id).toLocaleDateString('zh-CN') }}
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <div v-if="props.settings.displayOptions.includes('showSubtasks') && task.subtasks && task.subtasks.length > 0"
           class="subtasks-section">
        <div class="section-title">子任务详情</div>
        <div class="subtasks-list">
          <div
            v-for="(subtask, idx) in task.subtasks"
            :key="subtask.id"
            class="subtask-item"
            :class="{ completed: subtask.completed }"
          >
            <div class="subtask-content">
              <div class="subtask-header">
                <el-checkbox
                  :model-value="subtask.completed"
                  :label="`${idx + 1}. ${subtask.title}`"
                />
                <span v-if="props.settings.displayOptions.includes('showAssignees') && subtask.assignees && subtask.assignees.length > 0"
                      class="subtask-assignee">
                  <el-icon><User /></el-icon>
                  {{ subtask.assignees.join(', ') }}
                </span>
              </div>

              <div v-if="subtask.Link && subtask.Link.length > 0" class="subtask-links">
                <el-tag
                  v-for="link in subtask.Link"
                  :key="link"
                  size="small"
                  type="info"
                >
                  链接
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { User } from '@element-plus/icons-vue'

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
</script>

<style lang="scss" scoped>
.detailed-style {
  .detailed-task-item {
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    background: white;

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
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid #f0f2f5;

      .task-title-section {
        flex: 1;

        .task-title {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 600;
          color: #303133;
        }

        .task-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
      }

      .task-id {
        font-size: 12px;
        color: #909399;
        background: #f0f2f5;
        padding: 4px 8px;
        border-radius: 4px;
      }
    }

    .task-description {
      margin-bottom: 20px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 4px;
      border-left: 4px solid #409eff;

      .description-label {
        font-weight: 600;
        color: #409eff;
        margin-bottom: 4px;
        font-size: 12px;
      }

      .description-content {
        color: #606266;
        line-height: 1.6;
      }
    }

    .task-details {
      margin-bottom: 20px;

      .detail-item {
        .detail-label {
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;
        }

        .detail-value {
          color: #606266;
          font-weight: 500;

          .overdue-badge {
            display: inline-block;
            margin-left: 8px;
            padding: 1px 6px;
            background: #f56c6c;
            color: white;
            border-radius: 4px;
            font-size: 11px;
          }

          .tag-item {
            margin-bottom: 4px;
            margin-right: 4px;
          }

          .el-progress {
            width: 80%;
            display: inline-block;
            margin-right: 8px;
          }

          .progress-text {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }

    .subtasks-section {
      .section-title {
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #e4e7ed;
      }

      .subtasks-list {
        .subtask-item {
          padding: 12px;
          background: white;
          border-radius: 4px;
          border: 1px solid #e4e7ed;
          margin-bottom: 8px;

          &.completed {
            opacity: 0.7;
            background: #f8f9fa;

            :deep(.el-checkbox__label) {
              text-decoration: line-through;
              color: #909399;
            }
          }

          .subtask-content {
            .subtask-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;

              .subtask-assignee {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                color: #909399;
              }
            }

            .subtask-links {
              .el-tag {
                margin-right: 4px;
                margin-bottom: 4px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
