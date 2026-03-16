import { defineStore } from 'pinia'
import { ref } from 'vue'
import { QueryConfigs } from '@/apis/Config/QueryConfigs'

export const useConfigStore = defineStore('configs', () => {
  // 1. 定义状态 (State)
  const configs = ref(null) // 存储配置数据
  const loading = ref(false) // 加载状态
  const error = ref(null) // 错误信息
  // 2.获取接口数据 (Actions)
  const fetchConfigs = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await QueryConfigs()
      configs.value = response.Data
      return response.Data
    } catch (err) {
      error.value = err.message || '获取配置失败'
      throw err
    } finally {
      loading.value = false
    }
  }
  // 重置状态
  function reset() {
    configs.value = null
    loading.value = false
    error.value = null
  }

  return {
    // 状态
    configs,
    loading,
    error,

    // 方法
    fetchConfigs,
    reset,
  }
})
