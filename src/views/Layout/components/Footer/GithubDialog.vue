<template>
  <!-- GitHub卡片 -->
  <el-dialog v-model="localDialogVisible" title="GitHub" width="400px" center :append-to-body="true"
    @close="handleClose">
    <div class="github-content">
      <div class="github-info">
        <el-text class="github-desc">
          欢迎访问项目源码仓库，参与项目开发：
        </el-text>
        <div class="github-link">
          <el-link href="https://github.com/KingOfChelsea" target="_blank" type="primary">
            <el-icon>
              <Link />
            </el-icon>
            https://github.com/xuzhenyu/todo-pro
          </el-link>
        </div>
      </div>
      <div class="github-stats">
        <el-statistic :value="128" title="Stars" prefix="">
          <template #prefix>
            <el-icon>
              <Star />
            </el-icon>
          </template>
        </el-statistic>
        <el-statistic :value="32" title="Forks" prefix="">
          <template #prefix>
            <el-icon>
              <Share />
            </el-icon>
          </template>
        </el-statistic>
        <el-statistic :value="45" title="Watchers" prefix="">
          <template #prefix>
            <el-icon>
              <View />
            </el-icon>
          </template>
        </el-statistic>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

// 接收父组件传递的参数
const props = defineProps({
  githubDialogVisible: {
    type: Boolean,
    default: false
  }
})

// 定义emits
const emit = defineEmits(['update:githubDialogVisible'])

// 监听props变化，同步到本地变量
watch(() => props.githubDialogVisible, () => {
  localDialogVisible.value = props.githubDialogVisible
})
// 本地变量
const localDialogVisible = ref(props.githubDialogVisible)

watch(() => localDialogVisible.value, (newVal) => {
  // 触发父组件的监听
  emit('update:githubDialogVisible', newVal)
})
// 关闭dialog
const handleClose = () => {
  localDialogVisible.value = false
}

</script>

<style scoped>
.github-content {
  padding: 8px 0;
}

.github-info {
  margin-bottom: 20px;
}

.github-desc {
  display: block;
  font-size: 14px;
  margin-bottom: 16px;
  color: var(--el-text-color-regular);
}

.github-link {
  padding: 12px;
  background-color: var(--el-color-primary-light-9);
  border-radius: 6px;
  text-align: center;
}

.github-link .el-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
}

.github-stats {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  padding: 20px 0;
  border-top: 1px solid var(--el-border-color-light);
}
</style>
