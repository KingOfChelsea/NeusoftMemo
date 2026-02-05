<template>
  <el-dialog v-model="dialogVisible" title="添加标签" width="400px" :before-close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
      <el-form-item label="标签名称" prop="tagName">
        <el-input v-model="formData.tagName" placeholder="请输入标签名称" clearable @keyup.enter="submitForm" />
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
  tagName: ''
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

    // 触发添加标签事件
    emit('add-tag', tagName)

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
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
