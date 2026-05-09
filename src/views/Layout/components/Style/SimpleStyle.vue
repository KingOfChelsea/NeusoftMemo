<template>
  <div class="simple-style">
    <div
      v-for="(task, index) in props.tasks"
      :key="task.id"
      class="simple-task-item"
      :class="{ completed: task.completed }"
    >
      <div class="task-number">{{ index + 1 }}.</div>
      <div class="task-content">
        <div class="task-header">
          <h4 class="task-title">{{ task.title }}</h4>
          <div class="task-status-badge">
            <el-tag
              v-if="task.completed"
              type="success"
              size="small"
            >
              已完成
            </el-tag>
            <el-tag
              v-else
              :type="getPriorityType(task.priority)"
              size="small"
            >
              {{ task.priority }}
            </el-tag>
          </div>
        </div>

        <div v-if="task.description && props.settings.displayOptions.includes('showDescription')"
             class="task-description">
          {{ task.description }}
        </div>

        <div class="task-meta">
          <template v-if="props.settings.displayOptions.includes('showProject') && task.project">
            <span class="meta-item">
              <el-icon><Folder /></el-icon>
              {{ task.project }}
            </span>
          </template>

          <template v-if="props.settings.displayOptions.includes('showDeadline') && task.deadline">
            <span class="meta-item">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(task.deadline) }}
            </span>
          </template>
        </div>

        <div v-if="props.settings.displayOptions.includes('showSubtasks') && task.subtasks && task.subtasks.length > 0"
             class="subtasks-section">
          <div class="subtasks-title">子任务:</div>
          <div class="subtasks-list">
            <div
              v-for="subtask in task.subtasks"
              :key="subtask.id"
              class="subtask-item"
              :class="{ completed: subtask.completed }"
            >
              <el-checkbox
                :model-value="subtask.completed"
                :label="subtask.title"
                size="small"
              />
              <span v-if="props.settings.displayOptions.includes('showAssignees') && subtask.assignees && subtask.assignees.length > 0"
                    class="subtask-assignee">
                ({{ subtask.assignees.join(', ') }})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { Folder, Calendar } from '@element-plus/icons-vue'

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
</script>

<style lang="scss" scoped>
.simple-style {
  .simple-task-item {
    display: flex;
    padding: 16px;
    margin-bottom: 12px;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    background: white;
    transition: all 0.3s ease;

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
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
    }

    .task-number {
      flex-shrink: 0;
      width: 30px;
      font-weight: bold;
      color: #409eff;
      font-size: 16px;
      text-align: center;
    }

    .task-content {
      flex: 1;

      .task-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .task-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          flex: 1;
        }
      }

      .task-description {
        color: #606266;
        font-size: 14px;
        line-height: 1.6;
        margin: 8px 0;
        padding-left: 8px;
        border-left: 3px solid #e4e7ed;
      }

      .task-meta {
        display: flex;
        gap: 20px;
        margin-top: 12px;
        font-size: 12px;
        color: #909399;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }

      .subtasks-section {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px dashed #e4e7ed;

        .subtasks-title {
          font-size: 12px;
          color: #909399;
          margin-bottom: 8px;
        }

        .subtasks-list {
          .subtask-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 13px;

            &.completed {
              :deep(.el-checkbox__label) {
                text-decoration: line-through;
                color: #909399;
              }
            }

            .subtask-assignee {
              font-size: 11px;
              color: #909399;
            }
          }
        }
      }
    }
  }
}
</style>
