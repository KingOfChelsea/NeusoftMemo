<template>
  <el-dialog v-model="dialogVisible" title="添加项目" width="400px" :before-close="handleClose">
    <el-form ref="formRef" :model="formData" label-width="80px">
      <el-form-item label="标签名称" prop="projectName">
        <el-input v-model="formData.projectName" placeholder="请输入标签名称" clearable />
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
import { ref, reactive, watch } from 'vue'
const dialogVisible = ref(false)
// 定义emits
const emit = defineEmits(['update:modelValue', 'add-project'])
// 定义props
const props = defineProps({
  // 是否显示弹窗
  modelValue: {
    type: Boolean,
    default: false
  },
  // 现有的标签列表，用于验证是否重复
  existingProjects: {
    type: Array,
    default: () => []
  }
})

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val  // 同步到内部状态
})

// 监听dialogVisible变化，同步到父组件
watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})
// 表单引用
const formRef = ref()

// 表单数据
const formData = reactive({
  projectName: ''
})


const submitForm = async () => {
  if (!formRef.value) return
  const projectName = formData.projectName.trim()
  // 避免重复项目录入项目
  if (props.existingProjects.includes(projectName)) {
    ElMessage.error('标签名称已存在')
    return
  }
  // 触发添加标签事件
  emit('add-project', projectName)
  resetForm()
  dialogVisible.value = false
}
// 重置表单
const resetForm = () => {
  formData.tagName = ''
  if (formRef.value) {
    formRef.value.resetFields()
  }
}
const handleClose = (done) => {
  resetForm()
  done()
}

</script>

<style scoped></style>
