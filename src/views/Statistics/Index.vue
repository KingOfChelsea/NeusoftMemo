<template>
  <div class="image-manager-container">
    <!-- 顶部工具栏 -->
    <el-card class="toolbar-card">
      <div class="toolbar">
        <div class="left-toolbar">
          <el-button type="primary" @click="handleAdd" :icon="Plus">新增图片</el-button>
          <el-button :disabled="selectedRows.length === 0" @click="handleBatchDelete" :icon="Delete"
            type="danger">批量删除</el-button>
          <el-button type="primary" :icon="Edit">列宽编辑</el-button>
        </div>
        <div class="right-toolbar">
          <el-input v-model="searchKeyword" placeholder="搜索文件名" clearable @clear="handleSearch"
            @keyup.enter="handleSearch" class="search-input">
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
          <el-button type="success">返回首页</el-button>
        </div>
      </div>
    </el-card>

    <!-- 图片列表 -->
    <el-card class="list-card">
      <el-table :data="imageList" v-loading="loading" @selection-change="handleSelectionChange" style="width: 100%"
        :default-sort="{ prop: 'uploadTime', order: 'descending' }">

        <el-table-column type="selection" width="55" />

        <el-table-column prop="Id" label="ID" width5="80" sortable />

        <el-table-column prop="FileName" label="文件名" min-width="120" sortable>
          <template #default="{ row }">
            <el-tooltip :content="row.FileName" placement="top">
              <span class="file-name">{{ row.FileName }}</span>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column prop="FilePath" label="文件路径" min-width="200" sortable>
          <template #default="{ row }">
            <el-link :icon="Link" :href="row.FilePath" type="success">{{ row.FilePath }}</el-link>
          </template>
        </el-table-column>

        <el-table-column prop="ServerAddress" label="服务器地址" min-width="120">
          <template #default="{ row }">
            <el-link type="primary" :href="row.ServerAddress" target="_blank">{{ row.ServerAddress
              }}</el-link>
          </template>
        </el-table-column>

        <el-table-column prop="UploadTime" label="上传时间" width="180" sortable>
          <template #default="{ row }">
            {{ formatDateTime(row.UploadTime) }}
          </template>
        </el-table-column>

        <el-table-column label="预览" width="100">
          <template #default="{ row }">
            <el-image style="width: 50px; height: 50px;" :src="row.FilePath" :preview-src-list="[row.FilePath]"
              :initial-index="0" :z-index="9999" hide-on-click-modal preview-teleported lazy fit="cover"
              class="preview-image">
              <template #placeholder>
                <div class="image-placeholder">
                  <el-icon class="is-loading">
                    <Loading />
                  </el-icon>
                </div>
              </template>
              <template #error>
                <div class="image-error">
                  <el-icon>
                    <Picture />
                  </el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)" :icon="Edit">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)" :icon="Delete">删除</el-button>
          </template>
        </el-table-column>

      </el-table>

      <!-- 分页 -->
      <el-config-provider :locale="locale">
        <div class="pagination">
          <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
            size="small" :background='true' @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
      </el-config-provider>

    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Plus, Delete, Search, Edit, Link } from '@element-plus/icons-vue'
import { formatDateTime } from '@/utils/formatters'
import { QueryImageData } from '@/apis/Image/QueryImageData'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// 图片数据
const imageList = ref([])
const loading = ref(false)
const searchKeyword = ref('')

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 对话框控制
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const currentForm = ref({})

// 多选
const selectedRows = ref([])

// 配置中文
const locale = computed(() => zhCn)

// 初始化加载数据
onMounted(() => {
  loadImageData()
})

// 加载数据
const loadImageData = async () => {
  loading.value = true
  // 实际调用API QueryImageData产生的数据
  setTimeout(async () => {
    const response = await QueryImageData()
    const data = response.Data
    imageList.value = data
    pagination.total = data.length
    loading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  console.log("过滤搜索功能");
}

// 新增
const handleAdd = () => {
  dialogType.value = 'add'
  currentForm.value = {
    id: 0,
    fileName: '',
    filePath: '',
    serverAddress: '',
    uploadTime: new Date().toISOString()
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogType.value = 'edit'
  currentForm.value = { ...row }
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除图片 "${row.FileName}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟删除操作
    const index = imageList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      imageList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消了删除
    ElMessage('用户取消删除！')
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条记录吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟批量删除
    const deleteIds = new Set(selectedRows.value.map(item => item.id))
    imageList.value = imageList.value.filter(item => !deleteIds.has(item.id))
    selectedRows.value = []
    ElMessage.success(`成功删除 ${deleteIds.size} 条记录`)
  } catch {
    // 用户取消了删除
  }
}

// 表单提交
const handleFormSubmit = (formData) => {
  if (dialogType.value === 'add') {
    // 新增
    formData.id = imageList.value.length + 1
    imageList.value.unshift(formData)
    ElMessage.success('新增成功')
  } else {
    // 编辑
    const index = imageList.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      imageList.value[index] = { ...formData }
      ElMessage.success('修改成功')
    }
  }
  dialogVisible.value = false
}

// 表格多选
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 分页事件
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  loadImageData()
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
  loadImageData()
}
</script>

<style scoped lang="scss">
.image-manager-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;

  .toolbar-card {
    margin-bottom: 20px;

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;

      .left-toolbar {
        display: flex;
        gap: 10px;
      }

      .right-toolbar {
        display: flex;
        gap: 10px;

        .search-input {
          width: 300px;
        }
      }
    }
  }

  .list-card {
    .file-name {
      display: inline-block;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: default;
    }

    .path-tag {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .preview-image {
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid #dcdfe6;
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.05);
      }

      .image-error {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f5f5f5;
        color: #999;
        font-size: 5px;
      }
    }

    .pagination {
      display: flex;
      justify-content: center;
      padding: 20px 0;
      margin-top: 20px;
      border-top: 1px solid #ebeef5;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .image-manager-container {
    padding: 10px;

    .toolbar {
      flex-direction: column;
      align-items: stretch !important;

      .left-toolbar,
      .right-toolbar {
        width: 100%;
        margin-bottom: 10px;
      }

      .search-input {
        width: 100% !important;
      }
    }
  }
}
</style>
