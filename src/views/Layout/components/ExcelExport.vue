<template>
  <el-dropdown
    v-if="!hideDropdown"
    @command="handleExportCommand"
    trigger="click"
    placement="bottom"
  >
    <el-button
      :type="buttonType"
      :size="buttonSize"
      :loading="exporting"
    ><template #icon>
        <ExcelIcon />
      </template>
      <span v-if="!mini">{{ buttonText }}</span>
    </el-button>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="excel">
          <el-icon><Document /></el-icon>
          Excel (.xlsx)
        </el-dropdown-item>
        <el-dropdown-item command="excel-detailed">
          <el-icon><DocumentChecked /></el-icon>
          详细版 Excel
        </el-dropdown-item>
        <el-dropdown-item command="excel-simple">
          <el-icon><DocumentRemove /></el-icon>
          简洁版 Excel
        </el-dropdown-item>
        <el-dropdown-item command="excel-with-subtasks">
          <el-icon><DocumentCopy /></el-icon>
          包含子任务
        </el-dropdown-item>
        <el-dropdown-item command="excel-by-project" v-if="hasProjects">
          <el-icon><Folder /></el-icon>
          按项目拆分
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <el-button
    v-else
    :type="buttonType"
    :size="buttonSize"
    :loading="exporting"
    :icon="Excel"
    @click="handleExport"
  >
    <span v-if="!mini">{{ buttonText }}</span>
  </el-button>

  <!-- 导出设置对话框 -->
  <el-dialog
    v-model="dialogVisible"
    title="Excel导出设置"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form
      :model="exportSettings"
      label-width="100px"
      label-position="left"
      :rules="rules"
      ref="settingsForm"
    >
      <el-form-item label="文件名" prop="fileName">
        <el-input
          v-model="exportSettings.fileName"
          placeholder="请输入导出文件名"
          clearable
        />
      </el-form-item>

      <el-form-item label="导出范围">
        <el-radio-group v-model="exportSettings.range">
          <el-radio-button value="all">全部任务</el-radio-button>
          <el-radio-button value="filtered">筛选后任务</el-radio-button>
          <el-radio-button value="current">当前页</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="包含子任务">
        <el-switch
          v-model="exportSettings.includeSubtasks"
          active-text="包含"
          inactive-text="不包含"
        />
      </el-form-item>

      <el-form-item label="包含负责人">
        <el-switch
          v-model="exportSettings.includeAssignees"
          active-text="包含"
          inactive-text="不包含"
        />
      </el-form-item>

      <el-form-item label="文件格式">
        <el-radio-group v-model="exportSettings.format">
          <el-radio-button label="xlsx">.xlsx (Excel 2007+)</el-radio-button>
          <el-radio-button label="xls">.xls (Excel 97-2003)</el-radio-button>
          <el-radio-button label="csv">.csv (逗号分隔)</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="日期格式">
        <el-select v-model="exportSettings.dateFormat" style="width: 100%">
          <el-option label="YYYY-MM-DD" value="yyyy-mm-dd" />
          <el-option label="YYYY/MM/DD" value="yyyy/mm/dd" />
          <el-option label="YYYY年MM月DD日" value="chinese" />
          <el-option label="DD/MM/YYYY" value="dd/mm/yyyy" />
        </el-select>
      </el-form-item>

      <el-form-item label="工作表名称">
        <el-input
          v-model="exportSettings.sheetName"
          placeholder="工作表名称"
          clearable
        />
      </el-form-item>

      <el-form-item label="列选项">
        <el-checkbox-group v-model="exportSettings.columns">
          <el-row>
            <el-col :span="8">
              <el-checkbox value="title">任务标题</el-checkbox>
            </el-col>
            <el-col :span="8">
              <el-checkbox value="description">任务描述</el-checkbox>
            </el-col>
            <el-col :span="8">
              <el-checkbox value="project">项目</el-checkbox>
            </el-col>
            <el-col :span="8">
              <el-checkbox value="priority">优先级</el-checkbox>
            </el-col>
            <el-col :span="8">
              <el-checkbox value="status">状态</el-checkbox>
            </el-col>
            <el-col :span="8">
              <el-checkbox value="deadline">截止日期</el-checkbox>
            </el-col>
            <el-col :span="8">
              <el-checkbox value="tags">标签</el-checkbox>
            </el-col>
            <el-col :span="8">
              <el-checkbox value="createdAt">创建时间</el-checkbox>
            </el-col>
            <el-col :span="8">
              <el-checkbox value="subtasks">子任务数</el-checkbox>
            </el-col>
          </el-row>
        </el-checkbox-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmExport" :loading="exporting">
          确认导出
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, onMounted } from 'vue'
// 修改图标导入
import { Document, DocumentChecked, DocumentRemove, DocumentCopy, Folder } from '@element-plus/icons-vue'
import ExcelIcon from '@/components/icons/ExcelIcon.vue'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

// Props
const props = defineProps({
  // 数据
  tasks: {
    type: Array,
    default: () => []
  },
  filteredTasks: {
    type: Array,
    default: null
  },
  currentPageTasks: {
    type: Array,
    default: null
  },

  // 按钮配置
  buttonType: {
    type: String,
    default: 'success'
  },
  buttonSize: {
    type: String,
    default: 'small'
  },
  buttonText: {
    type: String,
    default: '导出Excel'
  },
  mini: {
    type: Boolean,
    default: false
  },
  hideDropdown: {
    type: Boolean,
    default: false
  },

  // 导出配置
  defaultFileName: {
    type: String,
    default: '任务列表'
  },
  sheetName: {
    type: String,
    default: '任务清单'
  },
  includeSubtasks: {
    type: Boolean,
    default: false
  },
  includeAssignees: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['export-start', 'export-complete', 'export-error'])

// Refs
const dialogVisible = ref(false)
const exporting = ref(false)
const settingsForm = ref(null)

// 导出设置
const exportSettings = ref({
  fileName: props.defaultFileName,
  range: 'filtered',
  includeSubtasks: props.includeSubtasks,
  includeAssignees: props.includeAssignees,
  format: 'xlsx',
  dateFormat: 'yyyy-mm-dd',
  sheetName: props.sheetName,
  columns: ['title', 'description', 'project', 'priority', 'status', 'deadline', 'tags', 'createdAt', 'subtasks']
})

// 表单验证规则
const rules = {
  fileName: [
    { required: true, message: '请输入文件名', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  sheetName: [
    { max: 31, message: '工作表名称不能超过31个字符', trigger: 'blur' }
  ]
}

// 计算属性
const hasProjects = computed(() => {
  const allTasks = props.filteredTasks || props.tasks
  return allTasks.some(task => task.project)
})

// 获取要导出的数据
const getExportData = () => {
  let data
  switch (exportSettings.value.range) {
    case 'all':
      data = props.tasks
      break
    case 'filtered':
      data = props.filteredTasks || props.tasks
      break
    case 'current':
      data = props.currentPageTasks || props.tasks
      break
    default:
      data = props.tasks
  }
  return [...data] // 返回副本
}

// 日期格式化
const formatDate = (dateString, format) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  switch (format) {
    case 'yyyy/mm/dd':
      return `${year}/${month}/${day}`
    case 'chinese':
      return `${year}年${month}月${day}日`
    case 'dd/mm/yyyy':
      return `${day}/${month}/${year}`
    default: // yyyy-mm-dd
      return `${year}-${month}-${day}`
  }
}

// 获取优先级数值
const getPriorityValue = (priority) => {
  if (!priority) return 0
  if (priority.includes('P1') || priority.includes('紧急')) return 1
  if (priority.includes('P2') || priority.includes('高')) return 2
  if (priority.includes('P3') || priority.includes('中')) return 3
  if (priority.includes('P4') || priority.includes('低')) return 4
  return 5
}

// 生成Excel数据
const generateExcelData = (tasks) => {
  const data = tasks.map((task, index) => {
    const row = {
      '序号': index + 1,
      '任务ID': task.id
    }

    if (exportSettings.value.columns.includes('title')) {
      row['任务标题'] = task.title || ''
    }

    if (exportSettings.value.columns.includes('description')) {
      row['任务描述'] = task.description || ''
    }

    if (exportSettings.value.columns.includes('project')) {
      row['所属项目'] = task.project || ''
    }

    if (exportSettings.value.columns.includes('priority')) {
      row['优先级'] = task.priority || ''
      row['优先级数值'] = getPriorityValue(task.priority)
    }

    if (exportSettings.value.columns.includes('status')) {
      row['状态'] = task.completed ? '已完成' : '未完成'
      row['状态数值'] = task.completed ? 1 : 0
    }

    if (exportSettings.value.columns.includes('deadline')) {
      row['截止日期'] = formatDate(task.deadline, exportSettings.value.dateFormat)
    }

    if (exportSettings.value.columns.includes('tags')) {
      row['标签'] = task.tags ? task.tags.join(', ') : ''
    }

    if (exportSettings.value.columns.includes('createdAt')) {
      row['创建时间'] = formatDate(task.id, exportSettings.value.dateFormat)
    }

    if (exportSettings.value.columns.includes('subtasks')) {
      const subtaskCount = task.subtasks ? task.subtasks.length : 0
      const completedCount = task.subtasks ? task.subtasks.filter(st => st.completed).length : 0
      row['子任务总数'] = subtaskCount
      row['已完成子任务'] = completedCount
      row['子任务进度'] = subtaskCount > 0 ? `${Math.round((completedCount / subtaskCount) * 100)}%` : '0%'
    }

    // 包含子任务详情
    if (exportSettings.value.includeSubtasks && task.subtasks && task.subtasks.length > 0) {
      task.subtasks.forEach((subtask, subIndex) => {
        row[`子任务${subIndex + 1}标题`] = subtask.title || ''
        row[`子任务${subIndex + 1}状态`] = subtask.completed ? '已完成' : '未完成'

        if (exportSettings.value.includeAssignees && subtask.assignees) {
          row[`子任务${subIndex + 1}负责人`] = subtask.assignees.join(', ')
        }
      })
    }

    return row
  })

  return data
}

// 生成详细版Excel数据
const generateDetailedExcelData = (tasks) => {
  const data = tasks.map((task, index) => {
    return {
      '序号': index + 1,
      '任务ID': task.id,
      '任务标题': task.title || '',
      '任务描述': task.description || '',
      '所属项目': task.project || '',
      '优先级': task.priority || '',
      '优先级数值': getPriorityValue(task.priority),
      '状态': task.completed ? '已完成' : '未完成',
      '状态数值': task.completed ? 1 : 0,
      '截止日期': formatDate(task.deadline, exportSettings.value.dateFormat),
      '标签': task.tags ? task.tags.join(', ') : '',
      '创建时间': formatDate(task.id, exportSettings.value.dateFormat),
      '最后更新时间': formatDate(task.updatedAt || task.id, exportSettings.value.dateFormat),
      '子任务总数': task.subtasks ? task.subtasks.length : 0,
      '已完成子任务': task.subtasks ? task.subtasks.filter(st => st.completed).length : 0,
      '子任务进度': task.subtasks && task.subtasks.length > 0
        ? `${Math.round((task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100)}%`
        : '0%',
      '备注': '',
      '负责人': task.subtasks && exportSettings.value.includeAssignees
        ? [...new Set(task.subtasks.flatMap(st => st.assignees || []))].join(', ')
        : ''
    }
  })

  return data
}

// 生成简洁版Excel数据
const generateSimpleExcelData = (tasks) => {
  const data = tasks.map((task, index) => {
    return {
      '序号': index + 1,
      '任务标题': task.title || '',
      '项目': task.project || '',
      '优先级': task.priority || '',
      '状态': task.completed ? '已完成' : '未完成',
      '截止日期': formatDate(task.deadline, exportSettings.value.dateFormat),
      '标签': task.tags ? task.tags.slice(0, 3).join(', ') : ''
    }
  })

  return data
}

// 按项目拆分导出
const exportByProject = (tasks) => {
  const projects = {}

  // 按项目分组
  tasks.forEach(task => {
    const project = task.project || '未分类'
    if (!projects[project]) {
      projects[project] = []
    }
    projects[project].push(task)
  })

  // 创建workbook
  const wb = XLSX.utils.book_new()

  // 为每个项目创建工作表
  Object.keys(projects).forEach(projectName => {
    const projectTasks = projects[projectName]
    const wsData = generateExcelData(projectTasks)
    const ws = XLSX.utils.json_to_sheet(wsData)

    // 添加工作表
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      projectName.length > 31 ? projectName.substring(0, 28) + '...' : projectName
    )
  })

  // 创建汇总工作表
  const summaryData = Object.keys(projects).map(projectName => {
    const tasks = projects[projectName]
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.completed).length
    const pendingTasks = totalTasks - completedTasks
    const totalSubtasks = tasks.reduce((sum, t) => sum + (t.subtasks ? t.subtasks.length : 0), 0)

    return {
      '项目名称': projectName,
      '任务总数': totalTasks,
      '已完成任务': completedTasks,
      '未完成任务': pendingTasks,
      '完成率': totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : '0%',
      '子任务总数': totalSubtasks
    }
  })

  const wsSummary = XLSX.utils.json_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, wsSummary, '项目汇总')

  return wb
}

// 导出Excel文件
const exportToExcel = async (type = 'excel') => {
  try {
    exporting.value = true
    emit('export-start')

    const tasks = getExportData()

    if (tasks.length === 0) {
      ElMessage.warning('没有可导出的数据')
      exporting.value = false
      emit('export-complete', { success: false, message: '没有数据' })
      return
    }

    let wb, ws, wsData

    switch (type) {
      case 'excel-detailed':
        wsData = generateDetailedExcelData(tasks)
        ws = XLSX.utils.json_to_sheet(wsData)
        wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, exportSettings.value.sheetName)
        break

      case 'excel-simple':
        wsData = generateSimpleExcelData(tasks)
        ws = XLSX.utils.json_to_sheet(wsData)
        wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, exportSettings.value.sheetName)
        break

      case 'excel-with-subtasks':
        exportSettings.value.includeSubtasks = true
        wsData = generateExcelData(tasks)
        ws = XLSX.utils.json_to_sheet(wsData)
        wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, exportSettings.value.sheetName)
        break

      case 'excel-by-project':
        wb = exportByProject(tasks)
        break

      default: // 普通excel
        wsData = generateExcelData(tasks)
        ws = XLSX.utils.json_to_sheet(wsData)
        wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, exportSettings.value.sheetName)
    }

    // 设置列宽
    if (ws) {
      const colWidths = []
      const headers = Object.keys(wsData[0] || {})

      headers.forEach(header => {
        const maxLength = Math.max(
          header.length,
          ...wsData.map(row => (row[header] || '').toString().length)
        )
        colWidths.push({ wch: Math.min(Math.max(maxLength, 10), 50) })
      })

      ws['!cols'] = colWidths
    }

    // 生成文件名
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    const ext = exportSettings.value.format
    const fileName = `${exportSettings.value.fileName}_${timestamp}.${ext}`

    // 导出文件
    let fileData
    switch (ext) {
      case 'xls':
        fileData = XLSX.write(wb, { bookType: 'xls', type: 'array' })
        saveAs(new Blob([fileData], { type: 'application/vnd.ms-excel' }), fileName)
        break

      case 'csv':
        fileData = XLSX.write(wb, { bookType: 'csv', type: 'string' })
        saveAs(new Blob([fileData], { type: 'text/csv;charset=utf-8' }), fileName)
        break

      default: // xlsx
        fileData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        saveAs(new Blob([fileData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fileName)
    }

    ElMessage.success(`Excel导出成功，共导出 ${tasks.length} 个任务`)
    emit('export-complete', {
      success: true,
      count: tasks.length,
      fileName,
      type
    })

  } catch (error) {
    console.error('导出Excel失败:', error)
    ElMessage.error(`导出Excel失败: ${error.message}`)
    emit('export-error', error)
  } finally {
    exporting.value = false
    dialogVisible.value = false
  }
}

// 事件处理
const handleExportCommand = (command) => {
  if (command === 'excel') {
    dialogVisible.value = true
  } else {
    exportToExcel(command)
  }
}

const handleExport = () => {
  dialogVisible.value = true
}

const confirmExport = async () => {
  if (!settingsForm.value) return

  try {
    await settingsForm.value.validate()
    await exportToExcel('excel')
  } catch (error) {
    // 验证失败，不执行导出
  }
}

// 生命周期
onMounted(() => {
  // 初始化设置
  exportSettings.value.fileName = props.defaultFileName
  exportSettings.value.sheetName = props.sheetName
  exportSettings.value.includeSubtasks = props.includeSubtasks
  exportSettings.value.includeAssignees = props.includeAssignees
})

// 暴露方法，供父组件调用
defineExpose({
  exportExcel: exportToExcel,
  exportDetailed: () => exportToExcel('excel-detailed'),
  exportSimple: () => exportToExcel('excel-simple'),
  exportWithSubtasks: () => exportToExcel('excel-with-subtasks'),
  exportByProject: () => exportToExcel('excel-by-project')
})
</script>

<style lang="scss" scoped>
.excel-export {
  display: inline-block;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}
</style>
