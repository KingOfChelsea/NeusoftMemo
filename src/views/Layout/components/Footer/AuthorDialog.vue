<template>
  <!-- 作者卡片 -->
  <el-dialog v-model="localDialogVisible" title="关于作者" width="400px" center :append-to-body="true" @close="handleClose">
    <div class="author-content">
      <div class="author-header">
        <el-avatar :size="60" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
        <div class="author-info">
          <el-text class="author-name">徐振宇</el-text>
          <el-text class="author-title" type="info" size="small">前端开发工程师</el-text>
        </div>
      </div>
      <div class="author-details">
        <el-text class="section-title">技术栈</el-text>
        <div class="tech-stack">
          <el-tag type="success" size="small">Vue 3</el-tag>
          <el-tag type="warning" size="small">TypeScript</el-tag>
          <el-tag type="danger" size="small">Element Plus</el-tag>
          <el-tag type="info" size="small">Vite</el-tag>
        </div>
      </div>
      <div class="author-details">
        <el-text class="section-title">其他项目</el-text>
        <div class="other-projects">
          <el-link type="primary" :underline="false">Blog System</el-link>
          <el-link type="primary" :underline="false">Admin Dashboard</el-link>
          <el-link type="primary" :underline="false">E-commerce Platform</el-link>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  authorDialogVisible: {
    type: Boolean,
    default: false
  }
})

// 定义emits
const emit = defineEmits(['update:authorDialogVisible'])
// 本地变量
const localDialogVisible = ref(props.authorDialogVisible)

// 监听props变化，同步到本地变量
watch(() => props.authorDialogVisible, (newVal) => {
  localDialogVisible.value = newVal
})

// 监听本地变量变化，同步到props
watch(localDialogVisible, (val) => {
  emit('update:authorDialogVisible', val)
})

// 处理关闭事件
const handleClose = () => {
  emit('update:authorDialogVisible', false)
}
</script>

<style scoped>
.author-content {
  padding: 8px 0;
}

.author-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.author-title {
  font-size: 13px;
}

.author-details {
  margin-bottom: 20px;
}

.section-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
}
</style>
