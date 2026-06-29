<template>
  <el-dialog
    v-model="dialogVisible"
    title="管理快速插入模板"
    width="600px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-table :data="localTemplates" border stripe style="width: 100%">
      <el-table-column prop="label" label="显示名称" width="150">
        <template #default="{ row }">
          <el-input v-if="row.editing" v-model="row.editLabel" size="small" />
          <span v-else>{{ row.label }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="插入内容">
        <template #default="{ row }">
          <el-input
            v-if="row.editing"
            v-model="row.editContent"
            size="small"
          />
          <span v-else>{{ row.content }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row, $index }">
          <template v-if="row.editing">
            <el-button type="primary" link @click="saveTemplate(row)">
              保存
            </el-button>
            <el-button type="info" link @click="cancelEdit(row)">
              取消
            </el-button>
          </template>
          <template v-else>
            <el-button type="primary" link @click="editTemplate(row)">
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              @click="deleteTemplate($index)"
            >
              删除
            </el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button @click="addTemplate">新增模板</el-button>
      <el-button type="primary" @click="confirmSave">
        完成
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  templates: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'update:templates'])

const dialogVisible = ref(false)
const localTemplates = ref([])

// 初始化数据
const initData = () => {
  localTemplates.value = JSON.parse(JSON.stringify(props.templates))
}

// 监听弹窗显隐
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val) {
    initData()
  }
})

// 监听 dialogVisible 变化
watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 编辑模板
const editTemplate = (row) => {
  row.editing = true
  row.editLabel = row.label
  row.editContent = row.content
}

// 保存模板
const saveTemplate = (row) => {
  if (!row.editLabel.trim() || !row.editContent.trim()) {
    ElMessage.warning('显示名称和插入内容不能为空')
    return
  }

  row.label = row.editLabel.trim()
  row.content = row.editContent.trim()
  row.editing = false
  ElMessage.success('保存成功')
}

// 取消编辑
const cancelEdit = (row) => {
  row.editing = false
  row.editLabel = ''
  row.editContent = ''
}

// 删除模板
const deleteTemplate = (index) => {
  ElMessageBox.confirm('确定要删除这个模板吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localTemplates.value.splice(index, 1)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 新增模板
const addTemplate = () => {
  const newValue = `custom_${Date.now()}`
  localTemplates.value.push({
    value: newValue,
    label: '新建模板',
    content: '',
    editing: true,
    editLabel: '',
    editContent: '',
    disabled: false
  })
}

// 确认保存
const confirmSave = () => {
  // 检查是否有未完成的编辑
  const editingItems = localTemplates.value.filter(t => t.editing)
  if (editingItems.length > 0) {
    ElMessage.warning('请先完成正在编辑的模板')
    return
  }

  // 返回数据给父组件
  emit('update:templates', JSON.parse(JSON.stringify(localTemplates.value)))
  dialogVisible.value = false
}

// 弹窗关闭时的处理
const handleClosed = () => {
  // 如果有未保存的编辑，恢复原始数据
  localTemplates.value = JSON.parse(JSON.stringify(props.templates))
}
</script>
