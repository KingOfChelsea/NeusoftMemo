import httpInstance from '@/utils/http'

// 获取配置数据
export const QueryConfigs = () => {
  return httpInstance.get(`/v1/configurations`)
}
