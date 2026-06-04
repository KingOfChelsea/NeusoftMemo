<template>
  <div class="ai-selector-wrapper">
    <!-- 触发按钮
    <div ref="triggerRef" class="trigger-wrapper">
      <slot>
        <el-button color="#fdeff2" class="ai-button">
          <SvgIcon name="ChatGPT" style="font-size: 24px; color: aqua;" />
          <span>AI</span>
        </el-button>
      </slot>
    </div> -->

    <!-- 主弹窗 -->
    <el-popover v-model:visible="popoverVisible" trigger="click" placement="bottom-start" width="420px"
      popper-class="ai-selector-popover" transition="el-zoom-in-top" :show-arrow="false">
      <!-- 将触发按钮放在默认插槽中 -->
      <template #reference>
        <div class="trigger-wrapper">
          <slot>
            <el-button color="#fdeff2" class="ai-button">
              <SvgIcon name="ChatGPT" style="font-size: 24px; color: aqua;" />
              <span>AI</span>
            </el-button>
          </slot>
        </div>
      </template>
      <div class="popover-content">
        <!-- 头部区域 -->
        <div class="popover-header">
          <div class="header-left">
            <h3>{{ title }}</h3>
            <span class="app-count">{{ displayApps.length }} 个应用</span>
          </div>
          <div class="header-right">
            <el-button type="primary" size="small" @click="openAddDialog" class="add-btn" circle>
              <el-icon>
                <Plus />
              </el-icon>
            </el-button>
            <el-tooltip content="管理应用" placement="top">
              <el-button type="default" size="small" @click="openManagerDialog" circle>
                <el-icon>
                  <Setting />
                </el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>

        <!-- 搜索区域 -->
        <div class="search-section">
          <el-input v-model.lazy="searchText" placeholder="搜索AI应用..." clearable size="small" :prefix-icon="Search"
            @input="handleSearch" class="search-input" />
        </div>

        <!-- AI应用列表 -->
        <div class="ai-apps-list" v-if="displayApps.length > 0">
          <VirtualScroll :items="displayApps" :item-height="72" :buffer-size="5" class="virtual-scroll">
            <template #default="{ item: app }">
              <div class="app-item" :class="{
                selected: selectedApp?.id === app.id,
                'is-custom': app.isCustom,
                'is-default': !app.isCustom
              }" @click="selectApp(app)">
                <!-- 应用图标 -->
                <div class="app-icon-wrapper" :style="{
                  background: `linear-gradient(135deg, ${app.iconColor || '#00a381'}20, ${app.iconColor || '#00a381'}40)`
                }">
                  <el-icon class="app-icon" :style="{ color: app.iconColor || '#00a381' }">
                    <component :is="getIconComponent(app.icon)" />
                  </el-icon>
                  <div v-if="app.isCustom" class="custom-badge">自</div>
                </div>

                <!-- 应用信息 -->
                <div class="app-info">
                  <div class="app-name-row">
                    <span class="app-name">{{ app.name }}</span>
                    <span class="app-tags">
                      <el-tag v-if="app.isCustom" size="small" type="success" effect="plain" class="tag">
                        自定义
                      </el-tag>
                      <el-tag v-if="app.isFavorite" size="small" type="warning" effect="plain" class="tag">
                        <el-icon>
                          <Star />
                        </el-icon>
                      </el-tag>
                    </span>
                  </div>
                  <div class="app-desc-row">
                    <span class="app-desc">{{ app.desc || '暂无描述' }}</span>
                    <span class="app-domain">{{ getDomainFromUrl(app.url) }}</span>
                  </div>
                </div>

                <!-- 应用操作 -->
                <div class="app-actions" @click.stop>
                  <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, app)">
                    <el-icon class="more-btn">
                      <MoreFilled />
                    </el-icon>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="quick-open" v-if="!isMobile">
                          <el-icon>
                            <Promotion />
                          </el-icon>
                          快速访问
                        </el-dropdown-item>
                        <el-dropdown-item command="favorite">
                          <el-icon>
                            <Star v-if="!app.isFavorite" />
                            <StarFilled v-else />
                          </el-icon>
                          {{ app.isFavorite ? '取消收藏' : '收藏' }}
                        </el-dropdown-item>
                        <el-dropdown-item command="copy-url" divided>
                          <el-icon>
                            <CopyDocument />
                          </el-icon>
                          复制链接
                        </el-dropdown-item>
                        <el-dropdown-item command="edit" v-if="app.isCustom">
                          <el-icon>
                            <Edit />
                          </el-icon>
                          编辑
                        </el-dropdown-item>
                        <el-dropdown-item command="delete" v-if="app.isCustom" class="delete-item">
                          <el-icon>
                            <Delete />
                          </el-icon>
                          删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>

                <!-- 选中标记 -->
                <el-icon v-if="selectedApp?.id === app.id" class="selected-icon">
                  <CircleCheckFilled />
                </el-icon>
              </div>
            </template>
          </VirtualScroll>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <el-empty :description="searchText ? '未找到匹配的应用' : '暂无AI应用'" :image-size="100">
            <template #image>
              <el-icon style="font-size: 60px; color: #c0c4cc;">
                <Search />
              </el-icon>
            </template>
            <el-button v-if="!searchText" type="primary" @click="openAddDialog">
              添加第一个应用
            </el-button>
            <el-button v-else type="default" @click="searchText = ''">
              清空搜索
            </el-button>
          </el-empty>
        </div>

        <!-- 底部操作栏 -->
        <div class="popover-footer">
          <div class="footer-left">
            <span v-if="selectedApp" class="selected-info">
              <el-button :style="{ background: selectedApp.iconColor || '#00a381', color: 'white' }" size="small">
                <el-icon>
                  <component :is="getIconComponent(selectedApp.icon)" />
                </el-icon>
                {{ selectedApp.name }}
              </el-button>
              <div> </div>
            </span>
            <span v-else class="hint-text">请选择一个AI应用</span>
          </div>
          <div class="footer-right">
            <el-button type="primary" :disabled="!selectedApp" @click="handleConfirm" :loading="loading"
              class="confirm-btn" size="small">
              <template #icon>
                <el-icon>
                  <Promotion />
                </el-icon>
              </template>
              前往 {{ selectedApp?.name.substring(0, 6) }}
            </el-button>
          </div>
        </div>
      </div>
    </el-popover>

    <!-- 添加/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEditMode ? '编辑AI应用' : '添加自定义AI'" width="600px" draggable
      :close-on-click-modal="false" :destroy-on-close="true" class="ai-edit-dialog">
      <div class="dialog-content">
        <!-- 基础信息 -->
        <div class="form-section">
          <h4 class="section-title">
            <el-icon>
              <InfoFilled />
            </el-icon>
            基础信息
          </h4>
          <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left"
            status-icon class="form-base">
            <el-form-item label="应用名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入应用名称，如：ChatGPT、Claude等" clearable maxlength="20"
                show-word-limit class="form-input">
                <template #prefix>
                  <el-icon>
                    <Edit />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="应用地址" prop="url">
              <el-input v-model="formData.url" placeholder="请输入完整的网址，如：https://chat.openai.com" clearable
                class="form-input">
                <template #prefix>
                  <el-icon>
                    <Link />
                  </el-icon>
                </template>
              </el-input>
              <div class="form-tip">请确保网址以 http:// 或 https:// 开头</div>
            </el-form-item>

            <el-form-item label="应用描述" prop="desc">
              <el-input v-model="formData.desc" placeholder="请输入简要描述，如：OpenAI出品的人工智能助手" type="textarea" :rows="3"
                maxlength="50" show-word-limit resize="none" class="form-textarea" />
            </el-form-item>
          </el-form>
        </div>

        <!-- 图标选择 -->
        <div class="form-section">
          <h4 class="section-title">
            <el-icon>
              <PictureFilled />
            </el-icon>
            图标设置
          </h4>
          <div class="icon-selector-wrapper">
            <div class="icon-preview">
              <div class="preview-icon" :style="{
                background: `linear-gradient(135deg, ${formData.iconColor}20, ${formData.iconColor}40)`,
                border: `2px solid ${formData.iconColor}30`
              }">
                <el-icon :style="{ color: formData.iconColor, fontSize: '32px' }">
                  <component :is="getIconComponent(formData.icon)" />
                </el-icon>
              </div>
              <div class="preview-info">
                <div class="preview-name">{{ formData.name || '应用名称' }}</div>
                <div class="preview-color">
                  <el-tag size="small" :color="formData.iconColor">
                    {{ formData.iconColor }}
                  </el-tag>
                </div>
              </div>
            </div>

            <div class="icon-selector">
              <div class="selector-header">
                <span class="selector-title">选择图标</span>
                <el-radio-group v-model="formData.icon" size="small">
                  <el-radio-button label="图标">图标</el-radio-button>
                  <el-radio-button label="颜色">颜色</el-radio-button>
                </el-radio-group>
              </div>

              <!-- 图标选择 -->
              <div v-if="formData.icon !== '颜色'" class="icon-options">
                <div v-for="icon in iconOptions" :key="icon.value" class="icon-option"
                  :class="{ selected: formData.icon === icon.value }" @click="formData.icon = icon.value">
                  <div class="icon-box">
                    <el-icon>
                      <component :is="icon.component" />
                    </el-icon>
                  </div>
                  <span class="icon-name">{{ icon.name }}</span>
                </div>
              </div>

              <!-- 颜色选择 -->
              <div v-else class="color-options">
                <div v-for="color in predefineColors" :key="color" class="color-option"
                  :class="{ selected: formData.iconColor === color }" :style="{ backgroundColor: color }"
                  @click="formData.iconColor = color">
                  <el-icon v-if="formData.iconColor === color" class="check-icon">
                    <Check />
                  </el-icon>
                </div>
                <el-color-picker v-model="formData.iconColor" :predefine="predefineColors" show-alpha size="small"
                  class="color-picker" />
              </div>
            </div>
          </div>
        </div>

        <!-- 快捷设置 -->
        <div class="form-section">
          <h4 class="section-title">
            <el-icon>
              <Setting />
            </el-icon>
            快捷设置
          </h4>
          <div class="quick-settings">
            <el-checkbox-group v-model="formData.tags" class="checkbox-group">
              <el-checkbox label="favorite" border>
                <el-icon>
                  <Star />
                </el-icon>
                收藏
              </el-checkbox>
              <el-checkbox label="pinned" border>
                <el-icon>
                  <Position />
                </el-icon>
                置顶
              </el-checkbox>
              <el-checkbox label="quick" border>
                <el-icon>
                  <Lightning />
                </el-icon>
                快速访问
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="isEditMode" type="danger" plain @click="handleDelete" :loading="deleting" class="delete-btn">
            <el-icon>
              <Delete />
            </el-icon>
            删除
          </el-button>
          <div class="footer-actions">
            <el-button @click="dialogVisible = false" :disabled="saving">
              取消
            </el-button>
            <el-button type="primary" @click="handleSave" :loading="saving" class="save-btn">
              <el-icon v-if="!saving">
                <Check />
              </el-icon>
              {{ isEditMode ? '保存修改' : '添加应用' }}
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
  <!-- 管理弹窗 -->
  <AiManagerDialog v-model="managerVisible" :apps="allApps" @update:apps="handleAppsUpdate" @edit="handleEditApp"
    @delete="handleDeleteAppMg" @favorite="handleFavoriteApp" @open="handleOpenApp" @save="handleSaveApps" />
</template>

<script setup>
import { ref, computed, onMounted, shallowRef, watch, watchEffect } from 'vue';
import {
  ChromeFilled,
  Star,
  StarFilled,
  Promotion,
  Link,
  CircleCheckFilled,
  Plus,
  Search,
  MoreFilled,
  Edit,
  Delete,
  CopyDocument,
  Setting,
  InfoFilled,
  PictureFilled,
  Position,
  Lightning,
  Check,
  Moon,
  Sunny,
  HelpFilled,
  MagicStick,
  Connection,
  VideoCameraFilled,
  Monitor,
  Iphone,
  DataAnalysis,
  ChatDotSquare
} from '@element-plus/icons-vue';
import VirtualScroll from './VirtualScroll.vue';
import { debounce } from 'lodash-es'
import AiManagerDialog from './AiManagerDialog.vue';

// Props
const props = defineProps({
  title: {
    type: String,
    default: 'AI应用中心'
  },
  apps: {
    type: Array,
    default: () => []
  }
});

// Emits
const emit = defineEmits(['select', 'confirm', 'add', 'edit', 'delete', 'favorite']);

// Refs
const triggerRef = ref(null);
const formRef = ref(null);
const popoverVisible = ref(false);
const dialogVisible = ref(false);
const isEditMode = ref(false);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const searchText = ref('');
const selectedApp = shallowRef(null);
const editingAppId = ref(null);
const cachedApps = ref([]); // 缓存搜索后的应用
const searchInput = ref('');
const managerVisible = ref(false);

// 表单数据
const formData = ref({
  name: '',
  url: '',
  desc: '',
  icon: 'ChromeFilled',
  iconColor: '#00a381',
  tags: []
});

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入应用名称', trigger: 'blur' },
    { min: 2, max: 20, message: '名称长度应为2-20个字符', trigger: 'blur' },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/,
      message: '名称只能包含中文、英文、数字和空格',
      trigger: 'blur'
    }
  ],
  url: [
    { required: true, message: '请输入应用地址', trigger: 'blur' },
    {
      pattern: /^(https?:\/\/)/,
      message: '请输入有效的网址（以http://或https://开头）',
      trigger: 'blur'
    },
    {
      pattern: /^(https?:\/\/)[\w.-]+\.[a-z]{2,}(\/.*)?$/i,
      message: '请输入有效的网址格式',
      trigger: 'blur'
    }
  ],
  desc: [
    { max: 50, message: '描述不能超过50个字符', trigger: 'blur' }
  ]
};

// 预定义颜色
const predefineColors = [
  '#00a381', '#409EFF', '#67C23A', '#E6A23C',
  '#F56C6C', '#909399', '#FF85C0', '#722ED1',
  '#2F54EB', '#13C2C2', '#FA541C', '#FAAD14',
  '#722ED1', '#EB2F96', '#52C41A', '#1890FF'
];

// 图标选项
const iconOptions = [
  { value: 'ChromeFilled', name: '浏览器', component: ChromeFilled },
  { value: 'Star', name: '星星', component: Star },
  { value: 'Promotion', name: '火箭', component: Promotion },
  { value: 'Link', name: '链接', component: Link },
  { value: 'ChatDotSquare', name: '聊天', component: ChatDotSquare },
  { value: 'MagicStick', name: '魔棒', component: MagicStick },
  { value: 'Connection', name: '连接', component: Connection },
  { value: 'Position', name: '定位', component: Position },
  { value: 'Monitor', name: '电脑', component: Monitor },
  { value: 'Iphone', name: '手机', component: Iphone },
  { value: 'DataAnalysis', name: '数据', component: DataAnalysis },
  { value: 'VideoCameraFilled', name: '视频', component: VideoCameraFilled },
  { value: 'Sunny', name: '太阳', component: Sunny },
  { value: 'Moon', name: '月亮', component: Moon },
  { value: 'Lightning', name: '闪电', component: Lightning },
  { value: 'HelpFilled', name: '帮助', component: HelpFilled },
];

// 图标组件映射
const iconComponentMap = iconOptions.reduce((map, icon) => {
  map[icon.value] = icon.component;
  return map;
}, {});

// 检测是否为移动端
const isMobile = computed(() => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
});

// 默认应用列表
const defaultApps = [
  {
    id: 'doubao',
    name: '豆包',
    url: 'https://www.doubao.com',
    icon: 'ChromeFilled',
    iconColor: '#00a381',
    desc: '字节跳动AI助手',
    isCustom: false,
    isFavorite: true
  },
  {
    id: 'yuanbao',
    name: '元宝',
    url: 'https://yuanbao.tencent.com',
    icon: 'Star',
    iconColor: '#E6A23C',
    desc: '字节新一代AI',
    isCustom: false,
    isFavorite: true
  },
  {
    id: 'kimi',
    name: 'Kimi',
    url: 'https://kimi.moonshot.cn',
    icon: 'Promotion',
    iconColor: '#409EFF',
    desc: '长文本专家',
    isCustom: false,
    isFavorite: false
  },
  {
    id: 'qwen',
    name: '通义千问',
    url: 'https://tongyi.aliyun.com/qianwen',
    icon: 'Link',
    iconColor: '#722ED1',
    desc: '阿里云AI',
    isCustom: false,
    isFavorite: false
  },
  {
    id: 'yiyan',
    name: '文心一言',
    url: 'https://yiyan.baidu.com',
    icon: 'ChatDotSquare',
    iconColor: '#F56C6C',
    desc: '百度AI',
    isCustom: false,
    isFavorite: false
  },
  {
    id: 'spark',
    name: '讯飞星火',
    url: 'https://xinghuo.xfyun.cn',
    icon: 'Lightning',
    iconColor: '#13C2C2',
    desc: '科大讯飞AI',
    isCustom: false,
    isFavorite: false
  },
];

// 应用列表
const allApps = ref([...defaultApps]);

// 排序应用列表
const sortApps = (apps) => {
  return [...apps].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return 0;
  });
};

// 搜索防抖
const debouncedSearch = debounce((keyword) => {
  if (!keyword.trim()) {
    cachedApps.value = sortApps(allApps.value);
  } else {
    const lowerKeyword = keyword.toLowerCase();
    const filtered = allApps.value.filter(app =>
      app.name.toLowerCase().includes(lowerKeyword) ||
      (app.desc && app.desc.toLowerCase().includes(lowerKeyword)) ||
      app.url.toLowerCase().includes(lowerKeyword)
    );
    cachedApps.value = sortApps(filtered);
  }
}, 300);

// 搜索处理
const handleSearch = () => {
  debouncedSearch(searchText.value);
};

// 监听搜索文本变化
watch(searchText, (newVal) => {
  searchInput.value = newVal;
  debouncedSearch(newVal);
});

// 显示的应用列表
const displayApps = computed(() => {
  if (searchInput.value.trim()) {
    return cachedApps.value;
  }
  return sortApps(allApps.value);
});

// 从URL获取域名
const getDomainFromUrl = (url) => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url.replace(/https?:\/\//, '').split('/')[0];
  }
};

// 根据图标名称获取组件
const getIconComponent = (iconName) => {
  return iconComponentMap[iconName] || ChromeFilled;
};

// 保存到localStorage
const saveToLocalStorage = () => {
  try {
    const customApps = allApps.value.filter(app => app.isCustom);
    localStorage.setItem('custom_ai_apps', JSON.stringify(customApps));

    if (selectedApp.value) {
      localStorage.setItem('last_selected_ai_id', selectedApp.value.id);
    }

    const favorites = allApps.value
      .filter(app => app.isFavorite)
      .map(app => app.id);
    localStorage.setItem('favorite_ai_apps', JSON.stringify(favorites));
  } catch (e) {
    console.error('保存数据失败:', e);
  }
};

// 从localStorage加载
const loadFromLocalStorage = () => {
  try {
    // 加载自定义应用
    const customAppsStr = localStorage.getItem('custom_ai_apps');
    if (customAppsStr) {
      const customApps = JSON.parse(customAppsStr);
      allApps.value = [...defaultApps, ...customApps];
    }

    // 加载上次选择
    const lastSelectedId = localStorage.getItem('last_selected_ai_id');
    if (lastSelectedId) {
      const app = allApps.value.find(item => item.id === lastSelectedId);
      if (app) {
        selectedApp.value = app;
      }
    }

    // 加载收藏状态
    const favoritesStr = localStorage.getItem('favorite_ai_apps');
    if (favoritesStr) {
      const favorites = JSON.parse(favoritesStr);
      allApps.value.forEach(app => {
        app.isFavorite = favorites.includes(app.id);
      });
    }

    // 初始化缓存
    cachedApps.value = sortApps(allApps.value);
  } catch (e) {
    console.error('加载数据失败:', e);
  }
};

// 复制链接
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success('链接已复制到剪贴板');
  } catch (err) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    ElMessage.success('链接已复制到剪贴板');
  }
};

// 打开添加/编辑对话框 新增模式，app赋值为null，mode为add模式
const openAddDialog = (app = null, mode = 'add') => {
  if (app && mode === 'edit') {
    // 编辑模式
    isEditMode.value = true;
    editingAppId.value = app.id;
    formData.value = {
      ...app,
      tags: []
    };
    if (app.isFavorite) formData.value.tags.push('favorite');
    // console.log(formData.value);

  } else {
    // 添加模式
    isEditMode.value = false;
    editingAppId.value = null;
    formData.value = {
      name: '',
      url: '',
      desc: '',
      icon: 'ChromeFilled',
      iconColor: predefineColors[Math.floor(Math.random() * predefineColors.length)],
      tags: []
    };
  }
  dialogVisible.value = true;
};

const handleEditApp = (app) => {
  if (!app) {
    openAddDialog();
  } else {
    openAddDialog(app, 'edit');
  }
  managerVisible.value = false;
};
// 打开管理对话框
const openManagerDialog = () => {
  managerVisible.value = true;
};

// 管理功能相关方法
const handleAppsUpdate = (updatedApps) => {
  allApps.value = updatedApps;
  saveToLocalStorage();
};



const handleDeleteAppMg = (app) => {
  const index = allApps.value.findIndex(item => item.id === app.id);
  if (index !== -1) {
    allApps.value.splice(index, 1);
    saveToLocalStorage();
  }
};

const handleFavoriteApp = (app) => {
  const targetApp = allApps.value.find(item => item.id === app.id);
  if (targetApp) {
    targetApp.isFavorite = app.isFavorite;
    saveToLocalStorage();
  }
};

const handleOpenApp = (app) => {
  window.open(app.url, '_blank');
};

const handleSaveApps = () => {
  saveToLocalStorage();
};


// 处理命令
const handleCommand = async (command, app) => {
  switch (command) {
    case 'quick-open':
      window.open(app.url, '_blank');
      popoverVisible.value = false;
      break;

    case 'favorite':
      app.isFavorite = !app.isFavorite;
      // 重新排序
      allApps.value = sortApps(allApps.value);
      saveToLocalStorage();
      ElMessage.success(app.isFavorite ? '已添加到收藏' : '已取消收藏');
      emit('favorite', { ...app, isFavorite: app.isFavorite });
      break;

    case 'copy-url':
      await copyToClipboard(app.url);
      break;

    case 'edit':
      openAddDialog(app, 'edit');
      popoverVisible.value = false;
      break;

    case 'delete':
      handleDeleteApp(app);
      break;
  }
};

// 删除应用
const handleDeleteApp = async (app) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除"${app.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'delete-confirm-btn',
        cancelButtonClass: 'delete-cancel-btn',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = '删除中...';

            const index = allApps.value.findIndex(item => item.id === app.id);
            if (index !== -1) {
              allApps.value.splice(index, 1);
              allApps.value = sortApps(allApps.value);

              if (selectedApp.value?.id === app.id) {
                selectedApp.value = null;
              }

              saveToLocalStorage();
              emit('delete', app);

              ElMessage.success('删除成功');
            }

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
  }
};

// 保存应用
const handleSave = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    saving.value = true;

    const appData = {
      ...formData.value,
      isCustom: true,
      isFavorite: formData.value.tags.includes('favorite')
    };

    if (isEditMode.value) {
      // 编辑
      const index = allApps.value.findIndex(app => app.id === editingAppId.value);
      if (index !== -1) {
        Object.assign(allApps.value[index], appData);
        allApps.value = sortApps(allApps.value);
        ElMessage.success('修改成功');
        emit('edit', { ...appData, id: editingAppId.value });
      }
    } else {
      // 新增
      const newApp = {
        ...appData,
        id: 'custom_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9),
        value: appData.name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]/g, '')
      };

      allApps.value.unshift(newApp);
      allApps.value = sortApps(allApps.value);
      console.log(newApp, '内部');
      ElMessage.success('添加成功');
      emit('add', newApp);
    }

    saveToLocalStorage();
    dialogVisible.value = false;
    formRef.value.resetFields();

  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error('保存失败: ' + error.message);
    }
  } finally {
    saving.value = false;
  }
};

// 删除应用（从表单）
const handleDelete = async () => {
  if (!editingAppId.value) return;

  try {
    await ElMessageBox.confirm(
      '确定要删除这个应用吗？此操作不可恢复。',
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'delete-confirm-btn',
        cancelButtonClass: 'delete-cancel-btn',
      }
    );

    deleting.value = true;
    const index = allApps.value.findIndex(app => app.id === editingAppId.value);
    if (index !== -1) {
      const deletedApp = allApps.value[index];
      allApps.value.splice(index, 1);
      allApps.value = sortApps(allApps.value);

      if (selectedApp.value?.id === editingAppId.value) {
        selectedApp.value = null;
      }

      saveToLocalStorage();
      emit('delete', deletedApp);
      ElMessage.success('删除成功');
      dialogVisible.value = false;
    }
  } catch {
    // 用户取消删除
  } finally {
    deleting.value = false;
  }
};

// 选择应用
const selectApp = (app) => {
  selectedApp.value = app;
  saveToLocalStorage();
  emit('select', app);
};

// 确认跳转
const handleConfirm = async () => {
  if (!selectedApp.value) return;

  loading.value = true;
  emit('confirm', selectedApp.value);

  try {
    window.open(selectedApp.value.url, '_blank');
    ElMessage.success(`正在打开 ${selectedApp.value.name}`);
  } catch (error) {
    ElMessage.error('打开失败，请检查链接是否正确');
  } finally {
    setTimeout(() => {
      loading.value = false;
      popoverVisible.value = false;
    }, 300);
  }
};

// 初始化
onMounted(() => {
  loadFromLocalStorage();
});

// 监听应用列表变化
watch(allApps, () => {
  cachedApps.value = sortApps(allApps.value);
}, { deep: true });
</script>

<style scoped lang="scss">
.ai-selector-wrapper {
  display: inline-block;
  position: relative;
}

.trigger-wrapper {
  cursor: pointer;
  display: inline-block;
}

.ai-button {
  font-weight: 300;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: row;
  gap: 30px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px #e9dfe5;
  }
}

.popover-content {
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f2f5;
  flex-shrink: 0;

  .header-left {
    display: flex;
    flex-direction: column;
    gap: 4px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .app-count {
      font-size: 12px;
      color: #909399;
    }
  }

  .header-right {
    display: flex;
    gap: 8px;

    .add-btn {
      background-color: #00a381;
      border-color: #00a381;

      &:hover {
        background-color: #008c6e;
        border-color: #008c6e;
      }
    }
  }
}

.search-section {
  margin-bottom: 16px;
  flex-shrink: 0;

  .search-input {
    :deep(.el-input__wrapper) {
      border-radius: 20px;
      border: 1px solid #e4e7ed;

      &:hover,
      &:focus {
        border-color: #00a381;
        box-shadow: 0 0 0 2px rgba(0, 163, 129, 0.1);
      }
    }

    :deep(.el-input__prefix) {
      padding-left: 12px;
    }
  }
}

.ai-apps-list {
  flex: 1;
  min-height: 0;
  position: relative;
}

.virtual-scroll {
  height: 400px;
  overflow-y: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background: #a8a8a8;
    }
  }
}

.app-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e4e7ed;
  margin-bottom: 8px;
  position: relative;
  background: white;
  box-sizing: border-box;
  height: 95px;

  &:hover {
    transform: translateY(-1px);
    border-color: #00a381;
    box-shadow: 0 4px 12px rgba(0, 163, 129, 0.1);

    .app-actions {
      opacity: 1;
    }
  }

  &.selected {
    background: linear-gradient(135deg, rgba(0, 163, 129, 0.1), rgba(0, 163, 129, 0.05));
    border-color: #00a381;
    box-shadow: 0 0 0 1px rgba(0, 163, 129, 0.2), 0 4px 12px rgba(0, 163, 129, 0.1);
  }

  &.is-custom {
    background: linear-gradient(135deg, #f9f9f9, #f0f0f0);
  }

  &.is-default {
    background: linear-gradient(135deg, #f9f9f9, #f0f0f0);
  }
}

.app-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .app-icon {
    font-size: 22px;
  }

  .custom-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    background: #f56c6c;
    color: white;
    font-size: 10px;
    width: 18px;
    height: 18px;
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
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;

  .app-name-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 20px;

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
        height: 20px;
        line-height: 18px;
        padding: 0 6px;
        font-size: 10px;
      }
    }
  }

  .app-desc-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    min-height: 20px;

    .app-desc {
      color: #606266;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }

    .app-domain {
      color: #909399;
      font-size: 11px;
      background: #f5f7fa;
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 8px;
      flex-shrink: 0;
    }
  }
}

.app-actions {
  opacity: 0;
  transition: opacity 0.3s ease;
  padding: 4px;
  border-radius: 6px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;

  &:hover {
    background: #f5f7fa;
  }

  .more-btn {
    font-size: 16px;
    color: #909399;
    cursor: pointer;

    &:hover {
      color: #00a381;
    }
  }
}

.selected-icon {
  position: absolute;
  right: 12px;
  top: 12px;
  color: #00a381;
  font-size: 16px;
  background: white;
  border-radius: 50%;
  padding: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #909399;
  flex: 1;
  min-height: 200px;

  :deep(.el-empty__image) {
    opacity: 0.6;
  }

  :deep(.el-empty__description) {
    margin-top: 12px;
  }

  .el-button {
    margin-top: 16px;
  }
}

.popover-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f2f5;
  min-height: 40px;
  flex-shrink: 0;

  .footer-left {
    flex: 1;
    min-width: 0;

    .selected-info {
      display: flex;
      flex-direction: row;

      .el-tag {
        width: 100px;
        padding: 4px 8px;
        border-radius: 12px;
        font-weight: 500;
        display: flex;
        flex-direction: row;

        .el-icon {
          margin-right: 4px;
        }
      }
    }

    .hint-text {
      font-size: 12px;
      color: #909399;
      font-style: italic;
    }
  }

  .footer-right {
    .confirm-btn {
      background: linear-gradient(135deg, #00a381, #00c9a7);
      border: none;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: 500;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 163, 129, 0.3);
      }

      &:disabled {
        background: #dcdfe6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
    }
  }
}

/* 弹窗样式 */
.ai-edit-dialog {
  .dialog-content {
    max-height: 60vh;
    overflow-y: auto;
    padding-right: 8px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;

      &:hover {
        background: #a8a8a8;
      }
    }
  }

  .form-section {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #f0f2f5;

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;

    .el-icon {
      color: #00a381;
    }
  }

  .form-base {
    .el-form-item {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .form-input,
    .form-textarea {
      :deep(.el-input__wrapper) {
        border-radius: 8px;
        border: 1px solid #e4e7ed;
        transition: all 0.3s ease;

        &:hover,
        &:focus-within {
          border-color: #00a381;
          box-shadow: 0 0 0 2px rgba(0, 163, 129, 0.1);
        }
      }
    }

    .form-tip {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
  }

  .icon-selector-wrapper {
    .icon-preview {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 12px;
      margin-bottom: 20px;
      border: 1px solid #e4e7ed;

      .preview-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .preview-info {
        flex: 1;

        .preview-name {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 8px;
        }

        .preview-color {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }
    }

    .icon-selector {
      .selector-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .selector-title {
          font-size: 14px;
          font-weight: 500;
          color: #606266;
        }
      }

      .icon-options {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
        gap: 12px;
        max-height: 240px;
        overflow-y: auto;
        padding: 8px;
        border: 1px solid #f0f2f5;
        border-radius: 8px;
        background: white;

        .icon-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 12px 8px;
          border-radius: 8px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background: #f5f7fa;
            border-color: #e4e7ed;
            transform: translateY(-2px);
          }

          &.selected {
            background: rgba(0, 163, 129, 0.1);
            border-color: #00a381;
            box-shadow: 0 2px 8px rgba(0, 163, 129, 0.2);

            .icon-box {
              background: #00a381;
              color: white;
            }
          }

          .icon-box {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f0f2f5;
            transition: all 0.3s ease;

            .el-icon {
              font-size: 20px;
              color: #606266;
            }
          }

          .icon-name {
            font-size: 11px;
            color: #606266;
            text-align: center;
            line-height: 1.2;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
          }
        }
      }

      .color-options {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
        gap: 12px;
        max-height: 200px;
        overflow-y: auto;
        padding: 16px;
        border: 1px solid #f0f2f5;
        border-radius: 8px;
        background: white;

        .color-option {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          border: 2px solid transparent;

          &:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }

          &.selected {
            border-color: white;
            box-shadow: 0 0 0 2px #00a381, 0 4px 12px rgba(0, 0, 0, 0.2);

            .check-icon {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              font-size: 20px;
              color: white;
              filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
            }
          }
        }

        .color-picker {
          grid-column: span 2;
          justify-self: stretch;
        }
      }
    }
  }

  .quick-settings {
    .checkbox-group {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;

      .el-checkbox {
        margin-right: 0;

        :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
          color: #00a381;
        }

        :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
          background-color: #00a381;
          border-color: #00a381;
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0 0;
    border-top: 1px solid #f0f2f5;

    .delete-btn {
      &:hover {
        border-color: #f56c6c;
        color: #f56c6c;
      }
    }

    .footer-actions {
      display: flex;
      gap: 12px;
    }

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
</style>

<style lang="scss">
.ai-selector-popover {
  padding: 0 !important;
  border: 1px solid #e4e7ed;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  border-radius: 16px;
  overflow: hidden;
  max-height: 600px;

  .el-popover__title {
    display: none;
  }

  .el-dropdown-menu {
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    border: 1px solid #e4e7ed;

    .el-dropdown-menu__item {
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;

      &:hover {
        background-color: #f5f7fa;
        color: #00a381;
      }

      &.delete-item {
        color: #f56c6c;

        &:hover {
          background-color: #fef0f0;
          color: #f56c6c;
        }
      }
    }
  }
}

.ai-edit-dialog {
  border-radius: 12px;
  overflow: hidden;

  .el-dialog__header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid #f0f2f5;

    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .el-dialog__body {
    padding: 24px;
  }

  .el-dialog__footer {
    padding: 20px 24px;
  }

  .el-input,
  .el-textarea {
    :deep(.el-input__wrapper) {
      border-radius: 8px;
      border: 1px solid #e4e7ed;
      transition: all 0.3s ease;

      &:hover,
      &:focus-within {
        border-color: #00a381;
        box-shadow: 0 0 0 2px rgba(0, 163, 129, 0.1);
      }
    }
  }

  .el-radio-group {
    :deep(.el-radio-button__inner) {
      border-radius: 6px;
      padding: 8px 16px;

      &:hover {
        color: #00a381;
      }
    }

    :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
      background-color: #00a381;
      border-color: #00a381;
      box-shadow: 0 0 0 1px #00a381;
    }
  }

  .el-checkbox {
    :deep(.el-checkbox__label) {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}
</style>
