<template>
  <div class="table-style">
    <el-table
      :data="props.tasks"
      style="width: 100%"
      :show-header="true"
      :border="true"
      size="small"
      :row-class-name="tableRowClassName"
    >
      <el-table-column prop="id" label="序号" width="80" align="center">
        <template #default="{ $index }">
          {{ $index + 1 }}
        </template>
      </el-table-column>

      <el-table-column prop="title" label="任务标题" min-width="150">
        <template #default="{ row }">
          <div class="table-cell-title">
            <span :class="{ 'completed-text': row.completed }">
              {{ row.title }}
            </span>
            <div v-if="row.description && props.settings.displayOptions.includes('showDescription')"
                 class="table-cell-description">
              {{ row.description }}
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        v-if="props.settings.displayOptions.includes('showProject')"
        prop="project"
        label="项目"
        width="100"
        align="center"
      >
        <template #default="{ row }">
          <el-tag v-if="row.project" size="small" type="info">
            {{ row.project }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        v-if="props.settings.displayOptions.includes('showPriority')"
        prop="priority"
        label="优先级"
        width="100"
        align="center"
      >
        <template #default="{ row }">
          <el-tag
            v-if="row.priority"
            :type="getPriorityType(row.priority)"
            size="small"
            effect="dark"
          >
            {{ row.priority }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        v-if="props.settings.displayOptions.includes('showDeadline')"
        prop="deadline"
        label="截止日期"
        width="120"
        align="center"
      >
        <template #default="{ row }">
          {{ row.deadline ? formatDate(row.deadline) : '-' }}
          <span v-if="isOverdue(row.deadline)" class="overdue-badge">!</span>
        </template>
      </el-table-column>

      <el-table-column
        v-if="props.settings.displayOptions.includes('showTags')"
        prop="tags"
        label="标签"
        width="150"
      >
        <template #default="{ row }">
          <div v-if="row.tags && row.tags.length > 0" class="table-cell-tags">
            <el-tag
              v-for="tag in row.tags.slice(0, 2)"
              :key="tag"
              size="small"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
            <span v-if="row.tags.length > 2" class="more-tags">
              +{{ row.tags.length - 2 }}
            </span>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        v-if="props.settings.displayOptions.includes('showSubtasks')"
        prop="subtasks"
        label="子任务"
        width="100"
        align="center"
      >
        <template #default="{ row }">
          <span v-if="row.subtasks && row.subtasks.length > 0">
            {{ getCompletedSubtasks(row.subtasks) }}/{{ row.subtasks.length }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column
        v-if="props.settings.displayOptions.includes('showStatus')"
        prop="completed"
        label="状态"
        width="100"
        align="center"
      >
        <template #default="{ row }">
          <el-tag
            :type="row.completed ? 'success' : 'danger'"
            size="small"
            effect="plain"
          >
            {{ row.completed ? '已完成' : '未完成' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        v-if="props.settings.displayOptions.includes('showAssignees')"
        prop="assignees"
        label="负责人"
        width="150"
      >
        <template #default="{ row }">
          <div v-if="getAllAssignees(row).length > 0" class="table-cell-assignees">
            <el-tag
              v-for="assignee in getAllAssignees(row).slice(0, 2)"
              :key="assignee"
              size="small"
              type="info"
            >
              {{ assignee }}
            </el-tag>
            <span v-if="getAllAssignees(row).length > 2" class="more-assignees">
              +{{ getAllAssignees(row).length - 2 }}
            </span>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  tasks: Array,
  settings: Object,
  page: Number
})

const tableRowClassName = ({ row }) => {
  if (row.completed) {
    return 'completed-row'
  }
  return ''
}

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

const getAllAssignees = (task) => {
  const assignees = new Set()
  if (task.subtasks) {
    task.subtasks.forEach(subtask => {
      if (subtask.assignees) {
        subtask.assignees.forEach(assignee => assignees.add(assignee))
      }
    })
  }
  return Array.from(assignees)
}
</script>

<style lang="scss" scoped>
.table-style {
  :deep(.el-table) {
    .el-table__header-wrapper {
      th {
        background: #f5f7fa;
        font-weight: 600;
        color: #606266;
        padding: 8px 0;
      }
    }

    .el-table__body-wrapper {
      .completed-row {
        background: #f8f9fa;

        td {
          .completed-text {
            text-decoration: line-through;
            color: #909399;
          }
        }
      }

      .el-table__row {
        &:hover {
          background: #f5f7fa;
        }
      }

      td {
        padding: 8px 0;

        .table-cell-title {
          .completed-text {
            text-decoration: line-through;
            color: #909399;
          }

          .table-cell-description {
            font-size: 12px;
            color: #909399;
            margin-top: 4px;
            line-height: 1.4;
            max-height: 40px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2; /* 新增标准属性 */
            -webkit-box-orient: vertical;
          }
        }

        .overdue-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          background: #f56c6c;
          color: white;
          border-radius: 50%;
          font-size: 10px;
          font-weight: bold;
          margin-left: 4px;
        }

        .table-cell-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;

          .tag-item {
            margin-bottom: 2px;
          }

          .more-tags {
            font-size: 11px;
            color: #909399;
            align-self: center;
          }
        }

        .table-cell-assignees {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;

          .more-assignees {
            font-size: 11px;
            color: #909399;
            align-self: center;
          }
        }
      }
    }
  }
}
</style>
