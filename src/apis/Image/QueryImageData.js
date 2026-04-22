import httpInstance from '@/utils/http'

// 获取图片配置数据
export const QueryImageData = () => {
  return httpInstance.get(`/v1/ImageData`)
}
