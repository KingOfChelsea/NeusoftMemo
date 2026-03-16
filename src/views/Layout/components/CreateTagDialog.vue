<template>

  <el-dialog v-model="dialogVisible" title="添加标签" width="500px" :before-close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
      <el-form-item label="标签名称" prop="tagName">
        <el-input v-model="formData.tagName" placeholder="请输入标签名称" clearable @keyup.enter="submitForm" />
      </el-form-item>
      <el-form-item label="标签颜色" prop="tagColor">
        <div class="color-picker-wrapper">
          <el-color-picker v-model="formData.tagColor" :predefine="predefineColors" show-alpha size="small" />
          <span class="color-tip">选择标签显示颜色</span>
        </div>
      </el-form-item>
      <el-form-item label="字体颜色" prop="fontColor">
        <div class="color-picker-wrapper">
          <el-color-picker v-model="formData.fontColor" :predefine="predefineColors" size="small" />
          <span class="color-tip">选择字体显示颜色</span>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">
          确认添加
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, nextTick, watch } from 'vue'

// 定义props
const props = defineProps({
  // 是否显示弹窗
  modelValue: {
    type: Boolean,
    default: false
  },
  // 现有的标签列表，用于验证是否重复
  existingTags: {
    type: Array,
    default: () => []
  }
})

// 定义emits
const emit = defineEmits(['update:modelValue', 'add-tag'])

// 弹窗显示状态
const dialogVisible = ref(false)

// 监听props变化
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val) {
    // 弹窗打开时，清空表单并聚焦
    nextTick(() => {
      resetForm()
      const input = document.querySelector('.el-input__inner')
      input?.focus()
    })
  }
})

// 监听dialogVisible变化，同步到父组件
watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})



// 表单引用
const formRef = ref()

// 表单数据
const formData = reactive({
  tagName: '',
  tagColor: '#409EFF',
  fontColor: '#ffffff'
})

// 表单验证规则
const formRules = {
  tagName: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback()
          return
        }
        // 验证标签名称是否已存在
        if (props.existingTags.includes(value.trim())) {
          callback(new Error('该标签已存在'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    },
    {
      min: 1,
      max: 20,
      message: '标签名称长度在 1 到 20 个字符',
      trigger: 'blur'
    }
  ]
}

// 重置表单
const resetForm = () => {
  formData.tagName = ''
  formData.tagColor = '#409EFF'
  formData.fontColor = '#ffffff'
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    const tagName = formData.tagName.trim()
    const tagColor = formData.tagColor || '#409EFF'
    const fontColor = formData.fontColor || '#ffffff'
    // 触发添加标签事件
    emit('add-tag', {
      name: tagName,
      color: tagColor,
      fontColor: fontColor
    })

    // 重置表单并关闭弹窗
    resetForm()
    dialogVisible.value = false
  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

// 弹窗关闭前的处理
const handleClose = (done) => {
  resetForm()
  done()
}
/**
 * 1.增加标签颜色选择器 Added By xuzhenyu 2026-02-11
 */
const predefineColors = ref([
  '#409EFF',
  '#67C23A',
  '#E6A23C',
  '#F56C6C',
  '#909399',
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  'rgba(255, 69, 0, 0.68)',
  'rgb(255, 120, 0)',
  'hsv(51, 100, 98)',
  'hsva(120, 40, 94, 0.5)',
  'hsl(181, 100%, 37%)',
  'hsla(209, 100%, 56%, 0.73)'
])
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-tip {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}

/* 自定义颜色选择器样式 */
:deep(.el-color-picker__trigger) {
  border-radius: 6px;
  border: 1px solid #dcdfe6;
}

:deep(.el-color-picker__trigger:hover) {
  border-color: #c0c4cc;
}
</style>
