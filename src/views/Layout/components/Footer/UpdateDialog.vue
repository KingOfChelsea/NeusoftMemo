<template>
  <el-dialog v-model="localDialogVisible" title="更新日志" width="500px" center :append-to-body="true" @close="handleClose">
    <div class="update-content">
      <el-timeline>
        <el-timeline-item timestamp="2026/2/26" placement="top" type="primary">
          <el-card shadow="never">
            <template #header>
              <div class="update-version">
                <el-text>v1.0.0</el-text>
                <el-tag type="success" size="small">正式版</el-tag>
              </div>
            </template>
            <ul class="update-list">
              <li>Todo Pro 正式发布</li>
              <li>新增任务分类功能</li>
              <li>支持本地数据存储</li>
              <li>优化移动端体验</li>
              <li>修复已知问题</li>
            </ul>
          </el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="2026/2/20" placement="top" type="info">
          <el-card shadow="never">
            <template #header>
              <div class="update-version">
                <el-text>v0.9.0</el-text>
                <el-tag type="warning" size="small">测试版</el-tag>
              </div>
            </template>
            <el-text type="info">完成基础功能开发，进入测试阶段</el-text>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
// props接受父组件传过来的值
const props = defineProps({
  updateDialogVisible: Boolean
})
// 定义emits
const emit = defineEmits(['update:updateDialogVisible'])

// 本地变量
const localDialogVisible = ref(props.updateDialogVisible)

// 监听props变化，同步到本地变量
watch(() => props.updateDialogVisible, (newVal) => {
  localDialogVisible.value = newVal
})

// 监听本地变量变化，同步到父组件
watch(localDialogVisible, (val) => {
  emit('update:updateDialogVisible', val)
})
// 处理关闭事件
const handleClose = () => {
  emit('update:updateDialogVisible', false)
}
</script>

<style scoped>
.update-content {
  padding: 8px 0;
}

.update-version {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.update-list {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.update-list li {
  margin-bottom: 4px;
}
</style>
