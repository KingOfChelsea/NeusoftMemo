<template>
  <el-dialog v-model="localDialogVisible" title="使用帮助" width="500px" center :append-to-body="true" @close="handleClose">
    <div class="help-content">
      <el-text class="help-title" type="primary">Todo Pro 使用指南</el-text>
      <div class="help-list">
        <el-text class="help-item">
          <el-icon>
            <Check />
          </el-icon>
          点击任务前的圆圈标记完成状态
        </el-text>
        <el-text class="help-item">
          <el-icon>
            <Edit />
          </el-icon>
          双击任务文本可直接编辑
        </el-text>
        <el-text class="help-item">
          <el-icon>
            <Star />
          </el-icon>
          点击星标可标记重要任务
        </el-text>
        <el-text class="help-item">
          <el-icon>
            <Filter />
          </el-icon>
          使用筛选功能快速查找特定任务
        </el-text>
      </div>
      <el-text class="help-tip" type="info" size="small">
        所有数据均存储在本地浏览器中，无需担心数据丢失
      </el-text>
    </div>
  </el-dialog>
</template>

<script setup>
import { watch, ref } from 'vue'

const props = defineProps({
  helpDialogVisible: Boolean
})
const emit = defineEmits(['update:helpDialogVisible'])

const localDialogVisible = ref(props.helpDialogVisible)

watch(() => localDialogVisible.value, (val) => {
  emit('update:helpDialogVisible', val)
})

watch(() => props.helpDialogVisible, (newVal) => {
  localDialogVisible.value = newVal
})
const handleClose = () => {
  emit('update:helpDialogVisible', false)
}
</script>

<style scoped>
/* 弹窗样式 */
.help-content {
  padding: 8px 0;
}

.help-title {
  display: block;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
}

.help-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.help-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.help-tip {
  display: block;
  padding: 8px 12px;
  background-color: var(--el-color-primary-light-9);
  border-radius: 4px;
  text-align: center;
}
</style>
