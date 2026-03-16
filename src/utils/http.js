// axios基础封装
import axios from 'axios'
import { ElMessage } from 'element-plus'

const httpInstance = axios.create({
  // baseURL: 'http://localhost:25734/api',
  baseURL: 'http://localhost:8888/api',
  timeout: 5000,
})

// axios请求拦截器
httpInstance.interceptors.request.use(
  (config) => {
    console.log(config, '测试')

    return config
  },
  (e) => {
    ElMessage.error('请求发送失败：', e.message)
    Promise.reject(e)
  },
)

// axios响应式拦截器
httpInstance.interceptors.response.use(
  (res) => {
    ElMessage.success('数据请求中...')
    return res.data
  },

  (e) => {
    ElMessage.error('请求失败：', e.message)
    return Promise.reject(e)
  },
)

export default httpInstance
