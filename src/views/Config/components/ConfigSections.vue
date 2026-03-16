<template>
  <el-form :model="configForm" label-width="120px">
    <el-collapse v-model="activeCollapse">
      <el-collapse-item v-for="(groupItems, groupName) in groupedConfigs" :key="groupName" :title="groupName"
        :name="groupName">
        <el-row :gutter="20">
          <el-col v-for="item in groupItems" :key="item.Id" :xs="24" :sm="item.ConfigType === 'boolean' ? 12 : 24"
            :md="item.ConfigType === 'boolean' ? 8 : 12">
            <!-- 字符串类型 -->
            <el-form-item v-if="item.ConfigType === 'string'" :label="item.Label" :prop="item.ConfigKey">
              <el-input v-model="configForm[item.ConfigKey]" :placeholder="`请输入${item.Label}`" clearable />
              <div v-if="item.Description" class="config-description">
                {{ item.Description }}
              </div>
            </el-form-item>

            <!-- 数字类型 -->
            <el-form-item v-if="item.ConfigType === 'number'" :label="item.Label" :prop="item.ConfigKey">
              <el-input-number v-model="configForm[item.ConfigKey]" :min="0" controls-position="right"
                style="width: 100%" />
              <div v-if="item.Description" class="config-description">
                {{ item.Description }}
              </div>
            </el-form-item>

            <!-- 布尔类型 -->
            <el-form-item v-if="item.ConfigType === 'boolean'" :label="item.Label" :prop="item.ConfigKey">
              <el-switch v-model="configForm[item.ConfigKey]" />
              <div v-if="item.Description" class="config-description">
                {{ item.Description }}
              </div>
            </el-form-item>

            <!-- 下拉选择类型 -->
            <el-form-item v-if="item.ConfigType === 'select'" :label="item.Label" :prop="item.ConfigKey">
              <el-select v-model="configForm[item.ConfigKey]" placeholder="请选择" style="width: 100%" clearable>
                <el-option v-for="option in parseSelectOptions(item.ConfigValue)" :key="option.value"
                  :label="option.label" :value="option.value" />
              </el-select>
              <div v-if="item.Description" class="config-description">
                {{ item.Description }}
              </div>
            </el-form-item>

            <!-- 文本域类型 -->
            <el-form-item v-if="item.ConfigType === 'textarea'" :label="item.Label" :prop="item.ConfigKey">
              <el-input v-model="configForm[item.ConfigKey]" type="textarea" :rows="3"
                :placeholder="`请输入${item.Label}`" />
              <div v-if="item.Description" class="config-description">
                {{ item.Description }}
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-collapse-item>
    </el-collapse>
  </el-form>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useConfigStore } from '@/stores/Config'

const configStore = useConfigStore()
const activeCollapse = ref([]) // 展开的面板，支持数组可展开多个

// 响应式表单数据
const configForm = reactive({})

// 计算属性：按分组分类配置项
const groupedConfigs = computed(() => {
  const groups = {}

  configStore.configs?.forEach(item => {
    if (!groups[item.GroupName]) {
      groups[item.GroupName] = []
    }
    // 按SortOrder排序
    groups[item.GroupName].push(item)
  })

  // 每个分组内部按SortOrder排序
  Object.keys(groups).forEach(groupName => {
    groups[groupName].sort((a, b) => a.SortOrder - b.SortOrder)
  })

  return groups
})

// 解析下拉选项（假设ConfigValue存储为JSON字符串）
const parseSelectOptions = (configValue) => {
  try {
    return JSON.parse(configValue)
  } catch {
    return []
  }
}

onMounted(async () => {
  // 获取配置列表
  await configStore.fetchConfigs()

  // 初始化表单数据
  configStore.configs?.forEach(item => {
    // 根据不同类型设置初始值
    switch (item.ConfigType) {
      case 'number':
        configForm[item.ConfigKey] = Number(item.ConfigValue) || 0
        break
      case 'boolean':
        configForm[item.ConfigKey] = item.ConfigValue === 'true'
        break
      default:
        configForm[item.ConfigKey] = item.ConfigValue || ''
    }
  })

  // 默认展开第一个分组
  if (configStore.configs?.length > 0) {
    const firstGroup = configStore.configs[0].GroupName
    activeCollapse.value = [firstGroup]
  }
})


</script>

<style scoped>
.config-description {
  font-size: 12px;
  color: #909399;
  margin-top: 6px;
  line-height: 1.5;
  padding-left: 2px;
  opacity: 0.85;
  transition: opacity 0.2s ease;
}

.config-description:hover {
  opacity: 1;
}

/* 表单项样式优化 */
.el-form-item {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.el-form-item:hover {
  background: linear-gradient(to right, rgba(64, 158, 255, 0.02), transparent);
  padding-left: 8px;
  border-radius: 6px;
}

/* 标签样式 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
  letter-spacing: 0.3px;
}






/* 数字输入框单位样式 */
.unit-text {
  margin-left: 10px;
  color: #409eff;
  font-size: 13px;
  font-weight: 500;
  padding: 2px 8px;
  background: rgba(64, 158, 255, 0.08);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.unit-text:hover {
  background: rgba(64, 158, 255, 0.12);
  transform: translateY(-1px);
}

/* 开关样式优化 */
:deep(.el-switch) {
  --el-switch-on-color: #409eff;
  --el-switch-off-color: #dcdfe6;
}

:deep(.el-switch__core) {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 折叠面板样式优化 */
:deep(.el-collapse) {
  border: none;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

:deep(.el-collapse-item__header) {
  background: linear-gradient(135deg, #f5f7fa 0%, #f8fafc 100%);
  border: none;
  font-weight: 600;
  color: #2c3e50;
  padding: 16px 20px;
  font-size: 15px;
  transition: all 0.3s ease;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-collapse-item__header:hover) {
  background: linear-gradient(135deg, #eef2f7 0%, #f1f5f9 100%);
  color: #409eff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

:deep(.el-collapse-item__wrap) {
  background: white;
  border: none;
  padding: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
}

:deep(.el-collapse-item__content) {
  padding: 0;
  padding-top: 10px;
}

/* 栅格间距优化 */
.el-row {
  margin-left: -10px !important;
  margin-right: -10px !important;
}

.el-col {
  padding-left: 10px !important;
  padding-right: 10px !important;
}

/* 分割线样式 */
.config-group-divider {
  position: relative;
  margin: 24px 0 20px 0;
  text-align: center;
  height: 1px;
  background: linear-gradient(to right,
      transparent 0%,
      #e0e6ed 20%,
      #e0e6ed 80%,
      transparent 100%);
}

.config-group-divider::before {
  content: attr(data-group);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 0 20px;
  color: #606266;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  border-radius: 20px;
  border: 1px solid #e0e6ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* 悬停效果 */
.el-form-item__content {
  position: relative;
}

.el-form-item__content::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 0;
  height: 100%;
  width: 3px;
  background: #409eff;
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
  transform: scaleY(0.8);
}

.el-form-item:hover .el-form-item__content::before {
  opacity: 0.7;
  transform: scaleY(1);
}
</style>
