<template>
  <el-dialog v-model="visible" title="AI应用管理" width="800px" :close-on-click-modal="false" :destroy-on-close="true"
    :draggable="true" fullscreen class="ai-manager-dialog">
    <div class="manager-content">


      <!-- 批量操作工具栏 -->
      <div class="batch-toolbar" v-if="selectedApps.length > 0">
        <div class="batch-info">
          <SvgIcon name="ChatGPT" style="font-size: 24px; color: aqua;" />
          已选择 {{ selectedApps.length }} 个应用
        </div>
        <div class="batch-actions">
          <el-button type="danger" size="small" plain @click="batchDelete" :loading="batchDeleting"
            class="batch-delete-btn">
            <el-icon>
              <Delete />
            </el-icon>
            批量删除
          </el-button>
          <el-button type="primary" size="small" @click="batchFavorite" :loading="batchFavoriting"
            class="batch-favorite-btn">
            <el-icon>
              <Star />
            </el-icon>
            批量收藏
          </el-button>
          <el-button type="success" size="small" plain @click="batchUnfavorite" :loading="batchFavoriting"
            class="batch-unfavorite-btn">
            <el-icon>
              <StarFilled />
            </el-icon>
            取消收藏
          </el-button>
        </div>
      </div>

      <!-- 搜索和筛选 -->
      <div class="manager-header">
        <div class="search-filter">
          <el-input v-model="searchQuery" placeholder="搜索应用..." clearable size="small" class="search-input"
            style="width: 200px; margin-right: 12px;">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>

          <el-select v-model="filterType" placeholder="全部类型" size="small" clearable
            style="width: 120px; margin-right: 12px;">
            <el-option label="全部应用" value="" />
            <el-option label="内置应用" value="default" />
            <el-option label="自定义应用" value="custom" />
          </el-select>

          <el-select v-model="filterFavorite" placeholder="收藏状态" size="small" clearable
            style="width: 120px; margin-right: 12px;">
            <el-option label="全部" value="" />
            <el-option label="已收藏" value="true" />
            <el-option label="未收藏" value="false" />
          </el-select>

          <el-button type="default" size="small" @click="resetFilters" class="reset-btn">
            重置筛选
          </el-button>
        </div>

        <div class="header-actions">
          <el-button type="primary" size="small" @click="exportApps" class="export-btn">
            <el-icon>
              <Download />
            </el-icon>
            导出配置
          </el-button>
          <el-button type="success" size="small" @click="importApps" class="import-btn">
            <el-icon>
              <Upload />
            </el-icon>
            导入配置
          </el-button>
        </div>
      </div>

      <!-- 应用表格 -->
      <div class="manager-table">
        <el-table :data="filteredApps" v-loading="loading" empty-text="暂无应用" @selection-change="handleSelectionChange"
          style="width: 100%" class="apps-table">
          <el-table-column type="selection" width="55" />

          <el-table-column label="应用" min-width="300">
            <template #default="{ row }">
              <div class="app-cell">
                <div class="app-icon-wrapper" :style="{
                  background: `linear-gradient(135deg, ${row.iconColor || '#00a381'}20, ${row.iconColor || '#00a381'}40)`
                }">
                  <el-icon class="app-icon" :style="{ color: row.iconColor || '#00a381' }">
                    <component :is="getIconComponent(row.icon)" />
                  </el-icon>
                  <div v-if="row.isCustom" class="custom-badge">自</div>
                </div>
                <div class="app-info">
                  <div class="app-name-row">
                    <span class="app-name">{{ row.name }}</span>
                    <span class="app-tags">
                      <el-tag v-if="row.isCustom" size="small" type="success" effect="plain" class="tag">
                        自定义
                      </el-tag>
                      <el-tag v-if="row.isFavorite" size="small" type="warning" effect="plain" class="tag">
                        <el-icon>
                          <Star />
                        </el-icon>
                      </el-tag>
                    </span>
                  </div>
                  <div class="app-desc-row">
                    <span class="app-desc">{{ row.desc || '暂无描述' }}</span>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="url" label="网址" min-width="200">
            <template #default="{ row }">
              <div class="url-cell">
                <el-link :href="row.url" target="_blank" type="primary" underline="never" class="app-url">
                  {{ row.url }}
                </el-link>
                <el-button type="primary" size="small" @click="copyUrl(row.url)" class="copy-btn">
                  <el-icon>
                    <CopyDocument />
                  </el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="isFavorite" label="收藏" width="80">
            <template #default="{ row }">
              <el-switch v-model="row.isFavorite" @change="handleFavoriteChange(row)" :active-color="'#E6A23C'" />
            </template>
          </el-table-column>

          <el-table-column prop="isCustom" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.isCustom ? 'success' : 'info'" size="small" effect="plain">
                {{ row.isCustom ? '自定义' : '内置' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button type="primary" link size="small" @click="editApp(row)" v-if="row.isCustom" class="edit-btn">
                  <el-icon>
                    <Edit />
                  </el-icon>
                  编辑
                </el-button>

                <el-button type="success" link size="small" @click="quickOpen(row)" class="open-btn">
                  <el-icon>
                    <Promotion />
                  </el-icon>
                  打开
                </el-button>

                <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, row)">
                  <el-button type="primary" size="small" class="more-btn">
                    更多
                    <el-icon>
                      <ArrowDown />
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="duplicate" v-if="row.isCustom">
                        <el-icon>
                          <DocumentCopy />
                        </el-icon>
                        复制应用
                      </el-dropdown-item>
                      <el-dropdown-item command="export">
                        <el-icon>
                          <Download />
                        </el-icon>
                        导出应用
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" divided v-if="row.isCustom" class="delete-item">
                        <el-icon>
                          <Delete />
                        </el-icon>
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > pageSize">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="total" layout="total, sizes, prev, pager, next, jumper" background class="pagination" />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div class="footer-left">
          <el-button type="success" @click="openAddDialog" class="add-new-btn">
            <el-icon>
              <Plus />
            </el-icon>
            添加新应用
          </el-button>
        </div>
        <div class="footer-right">
          <el-button @click="close">
            取消
          </el-button>
          <el-button type="primary" @click="saveChanges" :loading="saving" class="save-btn">
            <el-icon v-if="!saving">
              <Check />
            </el-icon>
            保存更改
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>

  <!-- 文件导入对话框 -->
  <input ref="fileInput" type="file" accept=".json" style="display: none" @change="handleFileImport" />
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';

onMounted(() => {
  // 检查浏览器是否支持必要的API
  if (typeof document.createElement('a').setAttribute !== 'function') {
    console.warn('当前浏览器可能不支持完整的DOM操作，请更新浏览器或清除缓存');
  }
});

// 定义 props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  apps: {
    type: Array,
    default: () => []
  }
});

// 定义 emits
const emit = defineEmits([
  'update:modelValue',
  'update:apps',
  'edit',
  'delete',
  'favorite',
  'open',
  'save'
]);

// 数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const allApps = ref([...props.apps]);
const selectedApps = ref([]);
const searchQuery = ref('');
const filterType = ref('');
const filterFavorite = ref('');
const currentPage = ref(1);
const pageSize = ref(20);
const loading = ref(false);
const saving = ref(false);
const batchDeleting = ref(false);
const batchFavoriting = ref(false);
const fileInput = ref(null);

// 监听外部apps变化
watch(() => props.apps, (newApps) => {
  allApps.value = [...newApps];
}, { immediate: true, deep: true });

// 过滤应用
const filteredApps = computed(() => {
  let filtered = [...allApps.value];

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(app =>
      app.name.toLowerCase().includes(query) ||
      (app.desc && app.desc.toLowerCase().includes(query)) ||
      app.url.toLowerCase().includes(query)
    );
  }

  // 类型过滤
  if (filterType.value) {
    if (filterType.value === 'custom') {
      filtered = filtered.filter(app => app.isCustom);
    } else if (filterType.value === 'default') {
      filtered = filtered.filter(app => !app.isCustom);
    }
  }

  // 收藏过滤
  if (filterFavorite.value !== '') {
    const isFavorite = filterFavorite.value === 'true';
    filtered = filtered.filter(app => app.isFavorite === isFavorite);
  }

  return filtered;
});

// 分页数据
const pagedApps = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredApps.value.slice(start, end);
});

const total = computed(() => filteredApps.value.length);

// 获取图标组件
const getIconComponent = (iconName) => {
  const iconOptions = [
    { value: 'ChromeFilled', name: '浏览器' },
    { value: 'Star', name: '星星' },
    { value: 'Promotion', name: '火箭' },
    { value: 'Link', name: '链接' },
    { value: 'ChatDotSquare', name: '聊天' },
    { value: 'MagicStick', name: '魔棒' },
    { value: 'Connection', name: '连接' },
    { value: 'Position', name: '定位' },
    { value: 'Monitor', name: '电脑' },
    { value: 'Iphone', name: '手机' },
    { value: 'DataAnalysis', name: '数据' },
    { value: 'VideoCameraFilled', name: '视频' },
    { value: 'Sunny', name: '太阳' },
    { value: 'Moon', name: '月亮' },
    { value: 'Lightning', name: '闪电' },
    { value: 'HelpFilled', name: '帮助' },
  ];

  const iconMap = iconOptions.reduce((map, icon) => {
    map[icon.value] = icon.value;
    return map;
  }, {});
  return iconMap[iconName] || 'ChromeFilled';
};

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedApps.value = selection;
};

// 重置筛选
const resetFilters = () => {
  searchQuery.value = '';
  filterType.value = '';
  filterFavorite.value = '';
  currentPage.value = 1;
};

// 批量操作
const batchDelete = async () => {
  if (selectedApps.value.length === 0) return;

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedApps.value.length} 个应用吗？此操作不可恢复。`,
      '确认批量删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'delete-confirm-btn',
        cancelButtonClass: 'delete-cancel-btn',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            batchDeleting.value = true;
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = '删除中...';

            const idsToDelete = selectedApps.value.map(app => app.id);

            // 删除选中的应用
            allApps.value = allApps.value.filter(app => !idsToDelete.includes(app.id));

            // 触发删除事件
            selectedApps.value.forEach(app => {
              emit('delete', app);
            });

            // 清空选择
            selectedApps.value = [];

            ElMessage.success(`已删除 ${idsToDelete.length} 个应用`);

            batchDeleting.value = false;
            instance.confirmButtonLoading = false;
            done();
          } else {
            done();
          }
        }
      }
    );
  } catch {
    // 用户取消删除
  } finally {
    batchDeleting.value = false;
  }
};

const batchFavorite = async () => {
  if (selectedApps.value.length === 0) return;

  batchFavoriting.value = true;
  try {
    selectedApps.value.forEach(app => {
      app.isFavorite = true;
      emit('favorite', { ...app, isFavorite: true });
    });
    ElMessage.success(`已收藏 ${selectedApps.value.length} 个应用`);
  } finally {
    batchFavoriting.value = false;
  }
};

const batchUnfavorite = async () => {
  if (selectedApps.value.length === 0) return;

  batchFavoriting.value = true;
  try {
    selectedApps.value.forEach(app => {
      app.isFavorite = false;
      emit('favorite', { ...app, isFavorite: false });
    });
    ElMessage.success(`已取消收藏 ${selectedApps.value.length} 个应用`);
  } finally {
    batchFavoriting.value = false;
  }
};

// 导出应用
const exportApps = () => {
  const exportData = allApps.value.map(app => ({
    name: app.name,
    url: app.url,
    desc: app.desc,
    icon: app.icon,
    iconColor: app.iconColor,
    isCustom: app.isCustom,
    isFavorite: app.isFavorite
  }));

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

  const exportFileDefaultName = `ai-apps-backup-${new Date().toISOString().split('T')[0]}.json`;
  // 添加参数检查
  if (!dataUri || !exportFileDefaultName) {
    console.error('导出参数无效');
    ElMessage.error('导出参数无效');
    return;
  }
  const linkElement = document.createElement('a');
  // linkElement.setAttribute('href', dataUri);
  // linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.href = dataUri;
  linkElement.download = exportFileDefaultName;
  linkElement.click();

  ElMessage.success('配置导出成功');
};

// 导入应用
const importApps = () => {
  fileInput.value.click();
};

const handleFileImport = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedApps = JSON.parse(e.target.result);

      if (!Array.isArray(importedApps)) {
        throw new Error('配置文件格式不正确');
      }

      // 验证导入的数据结构
      const validApps = importedApps.filter(app =>
        app.name && app.url && typeof app.isCustom !== 'undefined'
      );

      if (validApps.length === 0) {
        throw new Error('没有有效的应用数据');
      }

      // 添加导入的应用
      const newApps = validApps.map(app => ({
        ...app,
        id: app.id || `imported_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      }));

      allApps.value = [...allApps.value, ...newApps];
      ElMessage.success(`成功导入 ${newApps.length} 个应用`);

      // 清空文件输入
      event.target.value = '';
    } catch (error) {
      ElMessage.error(`导入失败: ${error.message}`);
    }
  };
  reader.readAsText(file);
};

// 复制URL
const copyUrl = async (url) => {
  try {
    await navigator.clipboard.writeText(url);
    ElMessage.success('链接已复制到剪贴板');
  } catch (err) {
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    ElMessage.success('链接已复制到剪贴板');
  }
};

// 收藏状态变化
const handleFavoriteChange = (app) => {
  emit('favorite', { ...app, isFavorite: app.isFavorite });
};

// 编辑应用
const editApp = (app) => {
  emit('edit', app);
};

// 快速打开
const quickOpen = (app) => {
  window.open(app.url, '_blank');
  emit('open', app);
};

// 处理命令
const handleCommand = (command, app) => {
  switch (command) {
    case 'duplicate':
      duplicateApp(app);
      break;
    case 'export':
      exportSingleApp(app);
      break;
    case 'delete':
      deleteSingleApp(app);
      break;
  }
};

// 复制应用
const duplicateApp = (app) => {
  const duplicated = {
    ...app,
    id: `copy_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    name: `${app.name} (副本)`,
    isFavorite: false
  };

  allApps.value.unshift(duplicated);
  ElMessage.success('应用复制成功');
};

// 导出单个应用
const exportSingleApp = (app) => {
  const exportData = JSON.stringify(app, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(exportData);
  const exportFileDefaultName = `ai-app-${app.name}-${new Date().toISOString().split('T')[0]}.json`;

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();

  ElMessage.success('应用导出成功');
};

// 删除单个应用
const deleteSingleApp = async (app) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除应用 "${app.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'delete-confirm-btn',
        cancelButtonClass: 'delete-cancel-btn',
      }
    );

    const index = allApps.value.findIndex(item => item.id === app.id);
    if (index !== -1) {
      allApps.value.splice(index, 1);
      emit('delete', app);
      ElMessage.success('删除成功');
    }
  } catch {
    // 用户取消删除
  }
};

// 打开添加对话框
const openAddDialog = () => {
  emit('edit', null);
};

// 保存更改
const saveChanges = async () => {
  saving.value = true;
  try {
    await nextTick();
    emit('update:apps', allApps.value);
    emit('save', allApps.value);
    ElMessage.success('更改已保存');
  } finally {
    saving.value = false;
  }
};

// 关闭对话框
const close = () => {
  visible.value = false;
  resetFilters();
  selectedApps.value = [];
};
</script>

<style scoped lang="scss">
.ai-manager-dialog {
  .manager-content {
    display: flex;
    flex-direction: column;
    // height: 70vh;
  }

  .batch-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #f5f7fa, #e4e7ed);
    border-radius: 8px;
    border: 1px solid #dcdfe6;

    .batch-info {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }

    .batch-actions {
      display: flex;
      gap: 8px;
    }
  }

  .manager-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-shrink: 0;

    .search-filter {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .manager-table {
    flex: 1;
    min-height: 0;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    overflow: hidden;

    .apps-table {
      height: 100%;

      :deep(.el-table__body-wrapper) {
        height: calc(100% - 40px);
        overflow-y: auto;
      }
    }

    .app-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 4px 0;

      .app-icon-wrapper {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        position: relative;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

        .app-icon {
          font-size: 18px;
        }

        .custom-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #f56c6c;
          color: white;
          font-size: 10px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
      }

      .app-info {
        flex: 1;
        min-width: 0;

        .app-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 2px;

          .app-name {
            font-size: 14px;
            font-weight: 600;
            color: #303133;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .app-tags {
            display: flex;
            gap: 4px;
            flex-shrink: 0;

            .tag {
              height: 18px;
              line-height: 16px;
              padding: 0 4px;
              font-size: 10px;
            }
          }
        }

        .app-desc-row {
          font-size: 12px;
          color: #606266;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .url-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      .app-url {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
      }

      .copy-btn {
        flex-shrink: 0;
        padding: 0;
        width: 24px;
        height: 24px;
      }
    }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;

      .more-btn {
        padding: 0 8px;
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding: 16px 0;
    border-top: 1px solid #e4e7ed;
    flex-shrink: 0;
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid #e4e7ed;

    .footer-left {
      .add-new-btn {
        background: linear-gradient(135deg, #00a381, #00c9a7);
        border: none;
        padding: 10px 20px;

        &:hover {
          background: linear-gradient(135deg, #008c6e, #00b89c);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 163, 129, 0.3);
        }
      }
    }

    .footer-right {
      display: flex;
      gap: 12px;

      .save-btn {
        background: linear-gradient(135deg, #00a381, #00c9a7);
        border: none;
        padding: 10px 24px;

        &:hover {
          background: linear-gradient(135deg, #008c6e, #00b89c);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 163, 129, 0.3);
        }
      }
    }
  }
}
</style>

<style lang="scss">
.ai-manager-dialog {
  border-radius: 12px;
  overflow: hidden;

  .el-dialog__header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid #f0f2f5;
    background: linear-gradient(135deg, #f5f7fa, #e4e7ed);

    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .el-dialog__body {
    padding: 20px 24px;
  }

  .el-dialog__footer {
    padding: 20px 24px;
  }

  .apps-table {
    .el-table__header {
      th {
        background: #f5f7fa;
        font-weight: 600;
        color: #303133;
      }
    }

    .el-table__row {
      &:hover {
        background: #f5f7fa;
      }
    }
  }

  .delete-confirm-btn {
    background-color: #f56c6c;
    border-color: #f56c6c;
  }

  .delete-cancel-btn {
    &:hover {
      color: #f56c6c;
      border-color: #fef0f0;
      background-color: #fef0f0;
    }
  }
}
</style>
