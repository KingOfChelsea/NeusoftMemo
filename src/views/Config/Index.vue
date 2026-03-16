<template>
  <div class="config-container">
    <!-- 顶部操作栏 -->
    <div class="config-header">
      <h2>系统配置</h2>
      <div class="header-actions">
        <el-button @click="saveConfig" type="primary" :loading="saving">
          <el-icon>
            <Check />
          </el-icon>
          保存配置
        </el-button>
        <el-button @click="resetConfig">
          <el-icon>
            <Refresh />
          </el-icon>
          重置
        </el-button>
        <el-button @click="toggleFullScreen">
          <el-icon>
            <FullScreen />
          </el-icon>
          {{ isFullScreen ? '退出全屏' : '全屏模式' }}
        </el-button>
      </div>
    </div>

    <!-- 配置内容区域 -->
    <div class="config-content">
      <el-scrollbar>
        <div class="config-sections">

          <!-- 高级配置 -->
          <!-- <el-card class="config-section">
            <template #header>
              <div class="section-header">
                <el-icon>
                  <Operation />
                </el-icon>
                <span>高级配置</span>
              </div>
            </template>

<el-form :model="configForm" label-width="150px">
  <el-collapse v-model="activeCollapse">
    <el-collapse-item title="API配置" name="api">
      <el-row :gutter="40">
        <el-col :xs="24" :sm="12">
          <el-form-item label="API地址" prop="apiUrl">
            <el-input v-model="configForm.apiUrl" placeholder="https://api.example.com" clearable />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12">
          <el-form-item label="超时时间" prop="timeout">
            <el-input-number v-model="configForm.timeout" :min="1000" :max="30000" :step="1000"
              controls-position="right" />
            <span class="unit-text">ms</span>
          </el-form-item>
        </el-col>
      </el-row>
    </el-collapse-item>

    <el-collapse-item title="缓存配置" name="cache">
      <el-row :gutter="40">
        <el-col :xs="24" :sm="12">
          <el-form-item label="缓存策略" prop="cacheStrategy">
            <el-select v-model="configForm.cacheStrategy" placeholder="请选择缓存策略">
              <el-option label="内存缓存" value="memory" />
              <el-option label="本地存储" value="localStorage" />
              <el-option label="混合存储" value="hybrid" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12">
          <el-form-item label="缓存时间" prop="cacheTime">
            <el-input-number v-model="configForm.cacheTime" :min="60" :max="86400" :step="60"
              controls-position="right" />
            <span class="unit-text">秒</span>
          </el-form-item>
        </el-col>
      </el-row>
    </el-collapse-item>

    <el-collapse-item title="日志配置" name="log">
      <el-row :gutter="40">
        <el-col :xs="24" :sm="12">
          <el-form-item label="日志级别" prop="logLevel">
            <el-select v-model="configForm.logLevel" placeholder="请选择日志级别">
              <el-option label="DEBUG" value="debug" />
              <el-option label="INFO" value="info" />
              <el-option label="WARN" value="warn" />
              <el-option label="ERROR" value="error" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12">
          <el-form-item label="日志保留" prop="logRetention">
            <el-input-number v-model="configForm.logRetention" :min="1" :max="365" :step="1"
              controls-position="right" />
            <span class="unit-text">天</span>
          </el-form-item>
        </el-col>
      </el-row>
    </el-collapse-item>
  </el-collapse>
</el-form>
</el-card> -->
          <ConfigSections />
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useConfigStore } from '@/stores/Config'
import ConfigSections from './components/ConfigSections.vue'
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
</script>

<style scoped>
.config-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
}

.config-header {
  padding: 20px 24px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.config-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
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
