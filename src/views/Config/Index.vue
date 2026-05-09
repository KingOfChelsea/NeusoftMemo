<template>
  <div class="config-container">
    <!-- 顶部操作栏 -->
    <div class="config-header-container">
      <div class="config-header">
        <!-- 左侧标题区域 -->
        <div class="header-left">
          <el-icon class="header-icon" :size="24">
            <Setting />
          </el-icon>
          <div>
            <h1 class="header-title">系统配置</h1>
            <p class="header-subtitle">管理系统参数和功能设置</p>
          </div>
        </div>


        <!-- 右侧操作区域 -->
        <div class="header-actions">
          <el-button-group>
            <!-- 系统信息 - 科技紫 -->
            <el-button color="#CE93D8" :icon="Setting" size="large">
              系统信息
            </el-button>

            <!-- 定时任务 - 活力橙 -->
            <el-button color="#ffcc80 " :icon="Clock" :dark="isDark" @click="openScheduler" size="large">
              定时任务
            </el-button>

            <!-- 通知设置 - 深海蓝 -->
            <el-button color="#90caf9" :icon="Bell" @click="openNotifications" size="large">
              通知设置
            </el-button>

            <!-- 帮助文档 - 自然绿 -->
            <el-button color="#a5d6a7 " :icon="QuestionFilled" @click="openHelp" size="large">
              帮助文档
            </el-button>
          </el-button-group>
          <!-- 主操作按钮组 -->
          <el-button-group>
            <el-button @click="saveConfig" type="primary" :icon="Check" :loading="saving" size="large">
              保存配置
            </el-button>
            <el-button @click="resetConfig" :icon="Refresh" size="large">
              重置
            </el-button>
          </el-button-group>

          <!-- 辅助操作按钮组 -->
          <el-button-group>
            <el-button @click="toggleFullScreen" :icon="FullScreen" :type="isFullScreen ? 'warning' : 'default'"
              size="large">
              {{ isFullScreen ? '退出全屏' : '全屏' }}
            </el-button>
            <el-button @click="goBack" type="primary" :icon="Back" size="large" plain>
              返回首页
            </el-button>

          </el-button-group>

        </div>
      </div>
    </div>

    <!-- 配置内容区域 -->
    <div class="config-content">
      <el-scrollbar>
        <div class="config-sections">

          <!-- 配置项区域 -->
          <ConfigSections></ConfigSections>

          <!-- 操作按钮组 -->
          <div class="action-buttons">
            <el-button type="primary" @click="saveConfig" :loading="saving" size="large">
              <el-icon>
                <Check />
              </el-icon>
              保存配置
            </el-button>
            <el-button @click="resetConfig" size="large">
              <el-icon>
                <Refresh />
              </el-icon>
              重置修改
            </el-button>
            <el-button @click="exportConfig" type="info" size="large">
              <el-icon>
                <Download />
              </el-icon>
              导出配置
            </el-button>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <LayoutFooter></LayoutFooter>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useConfigStore } from '@/stores/Config'
import ConfigSections from './components/ConfigSections.vue'
import { Setting, Check, Refresh, FullScreen, Back, Clock, Bell, QuestionFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import LayoutFooter from '../Layout/LayoutFooter.vue'


// 响应式数据
const configFormRef = ref(null)
const isFullScreen = ref(false)
const saving = ref(false)
const activeCollapse = ref(['api', 'cache', 'log'])
const configStore = useConfigStore() // 配置存储实例

// 预设颜色
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
  '#00ced1'
])

// 配置表单数据
const configForm = reactive({
  // 基础配置
  systemName: '管理系统',
  version: '1.0.0',
  enabled: true,
  description: '',

  // 界面配置
  themeColor: '#409EFF',
  layoutMode: 'side',
  menuWidth: 200,
  animation: true,

  // 高级配置
  apiUrl: 'https://api.example.com',
  timeout: 10000,
  cacheStrategy: 'localStorage',
  cacheTime: 3600,
  logLevel: 'info',
  logRetention: 30
})

// 保存原始配置
let originalConfig = null

// 路由实例
const router = useRouter()

// 生命周期
onMounted(async () => {
  // 保存初始配置
  originalConfig = JSON.parse(JSON.stringify(configForm))

  // 监听全屏变化
  document.addEventListener('fullscreenchange', handleFullScreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullScreenChange)
  document.addEventListener('mozfullscreenchange', handleFullScreenChange)
  document.addEventListener('MSFullscreenChange', handleFullScreenChange)

  // 加载配置数据

  // const res = await configStore.fetchConfigs()
  // console.log(res);

})

onUnmounted(() => {
  // 移除事件监听
  document.removeEventListener('fullscreenchange', handleFullScreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullScreenChange)
  document.removeEventListener('mozfullscreenchange', handleFullScreenChange)
  document.removeEventListener('MSFullscreenChange', handleFullScreenChange)
})

// 解析配置
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    // 进入全屏
    const element = document.documentElement
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen()
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen()
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen()
    }
  } else {
    // 退出全屏
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
  }
}

const handleFullScreenChange = () => {
  isFullScreen.value = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  )
}

const saveConfig = async () => {
  saving.value = true

  try {
    // 这里可以添加表单验证
    if (configFormRef.value) {
      await configFormRef.value.validate()
    }

    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 保存配置逻辑（这里可以替换为实际的API调用）
    console.log('保存配置:', configForm)
    originalConfig = JSON.parse(JSON.stringify(configForm))

    ElMessage({
      message: '配置保存成功',
      type: 'success',
      duration: 2000
    })
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage({
      message: '保存配置失败',
      type: 'error',
      duration: 2000
    })
  } finally {
    saving.value = false
  }
}

const resetConfig = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置所有配置吗？未保存的修改将会丢失。',
      '确认重置',
      {
        confirmButtonText: '确定重置',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 重置为原始配置
    Object.keys(originalConfig).forEach(key => {
      configForm[key] = originalConfig[key]
    })

    ElMessage({
      message: '配置已重置',
      type: 'success',
      duration: 2000
    })
  } catch (error) {
    // 用户取消了操作
  }
}

const exportConfig = () => {
  const configStr = JSON.stringify(configForm, null, 2)
  const blob = new Blob([configStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `config_${new Date().getTime()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  ElMessage({
    message: '配置已导出',
    type: 'info',
    duration: 2000
  })
}

// 返回上一页
const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.config-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
}

.config-header-container {
  position: sticky;
  top: 0;
  background: white;
  z-index: 1000;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 0 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  max-width: 1700px;
  margin: 0 auto;
  padding: 16px 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  color: var(--el-color-primary);
  background: rgba(var(--el-color-primary-rgb), 0.1);
  padding: 12px;
  border-radius: 12px;
}

.header-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.4;
}

.header-subtitle {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
  opacity: 0.8;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .config-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-left {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .header-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
}

.config-content {
  flex: 1;
  padding: 24px;
  overflow: hidden;
}

.config-sections {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}



.el-form-item {
  margin-bottom: 22px;
}

.unit-text {
  margin-left: 8px;
  color: #909399;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 32px 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .config-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .action-buttons .el-button {
    width: 80%;
  }
}

/* 全屏模式优化 */
:fullscreen .config-container {
  background-color: white;
}

:-webkit-full-screen .config-container {
  background-color: white;
}

:-moz-full-screen .config-container {
  background-color: white;
}

:-ms-fullscreen .config-container {
  background-color: white;
}
</style>
