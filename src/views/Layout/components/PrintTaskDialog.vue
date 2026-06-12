<template>
  <el-dialog v-model="dialogVisible" title="任务打印设置" width="95%" :before-close="handleClose"
    class="print-dialog-container" fullscreen>
    <div class="print-dialog">
      <!-- 主设置区域 -->
      <div class="main-settings">
        <!-- 左侧：打印设置 -->
        <div class="settings-left">
          <el-tabs v-model="activeTab" class="settings-tabs">
            <el-tab-pane label="页面设置" name="page">
              <div class="tab-content">
                <el-form :model="printSettings" label-width="100px" label-position="left">
                  <el-form-item label="纸张尺寸">
                    <el-radio-group v-model="printSettings.paperSize" @change="handlePaperSizeChange">
                      <el-radio-button value="A4">A4</el-radio-button>
                      <el-radio-button value="A3">A3</el-radio-button>
                      <el-radio-button value="A5">A5</el-radio-button>
                      <el-radio-button value="B5">B5</el-radio-button>
                      <el-radio-button value="custom">自定义</el-radio-button>
                    </el-radio-group>
                  </el-form-item>

                  <el-form-item v-if="printSettings.paperSize === 'custom'" label="自定义尺寸">
                    <el-row :gutter="10">
                      <el-col :span="12">
                        <el-input-number v-model="printSettings.customWidth" :min="50" :max="1000" :step="5"
                          controls-position="right">
                          <template #prepend>宽度</template>
                          <template #append>mm</template>
                        </el-input-number>
                      </el-col>
                      <el-col :span="12">
                        <el-input-number v-model="printSettings.customHeight" :min="50" :max="1000" :step="5"
                          controls-position="right">
                          <template #prepend>高度</template>
                          <template #append>mm</template>
                        </el-input-number>
                      </el-col>
                    </el-row>
                  </el-form-item>

                  <el-form-item label="页面方向">
                    <el-radio-group v-model="printSettings.orientation" @change="handleOrientationChange">
                      <el-radio-button value="portrait">
                        <el-icon>
                          <Sort />
                        </el-icon> 纵向
                      </el-radio-button>
                      <el-radio-button value="landscape">
                        <el-icon>
                          <Sort />
                        </el-icon> 横向
                      </el-radio-button>
                    </el-radio-group>
                  </el-form-item>

                  <el-form-item label="页面边距">
                    <el-slider v-model="printSettings.margin" :min="5" :max="50" :step="1"
                      :format-tooltip="(val) => `${val}mm`" show-input input-size="small" />
                  </el-form-item>

                  <el-form-item label="行间距">
                    <el-slider v-model="printSettings.lineHeight" :min="1" :max="3" :step="0.1"
                      :format-tooltip="(val) => val.toFixed(1)" show-input input-size="small" />
                  </el-form-item>

                  <el-form-item label="字体大小">
                    <el-slider v-model="printSettings.fontSize" :min="10" :max="20" :step="1"
                      :format-tooltip="(val) => `${val}px`" show-input input-size="small" />
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="内容设置" name="content">
              <div class="tab-content">
                <el-form :model="printSettings" label-width="100px" label-position="left">
                  <el-form-item label="打印样式">
                    <el-select v-model="printSettings.style" placeholder="选择打印样式" style="width: 100%">
                      <el-option label="简洁版" value="simple" />
                      <el-option label="详细版" value="detailed" />
                      <el-option label="表格版" value="table" />
                      <el-option label="卡片版" value="card" />
                      <el-option label="报告版" value="report" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="显示选项">
                    <el-checkbox-group v-model="printSettings.displayOptions">
                      <el-row :gutter="10">
                        <el-col :span="8">
                          <el-checkbox value="showTitle">任务标题</el-checkbox>
                        </el-col>
                        <el-col :span="8">
                          <el-checkbox value="showProject">所属项目</el-checkbox>
                        </el-col>
                        <el-col :span="8">
                          <el-checkbox value="showPriority">优先级</el-checkbox>
                        </el-col>
                        <el-col :span="8">
                          <el-checkbox value="showTags">标签</el-checkbox>
                        </el-col>
                        <el-col :span="8">
                          <el-checkbox value="showDeadline">截止日期</el-checkbox>
                        </el-col>
                        <el-col :span="8">
                          <el-checkbox value="showDescription">任务描述</el-checkbox>
                        </el-col>
                        <el-col :span="8">
                          <el-checkbox value="showSubtasks">子任务</el-checkbox>
                        </el-col>
                        <el-col :span="8">
                          <el-checkbox value="showAssignees">负责人</el-checkbox>
                        </el-col>
                        <el-col :span="8">
                          <el-checkbox value="showStatus">状态</el-checkbox>
                        </el-col>
                        <el-col :span="8">
                          <el-checkbox value="showStatistics">统计信息</el-checkbox>
                        </el-col>
                      </el-row>
                    </el-checkbox-group>
                  </el-form-item>

                  <el-form-item label="任务筛选">
                    <el-row :gutter="10">
                      <el-col :span="8">
                        <el-select v-model="printSettings.filterProject" placeholder="按项目筛选" clearable filterable
                          style="width: 100%">
                          <el-option v-for="project in uniqueProjects" :key="project" :label="project"
                            :value="project" />
                        </el-select>
                      </el-col>
                      <el-col :span="8">
                        <el-select v-model="printSettings.filterPriority" placeholder="按优先级筛选" clearable
                          style="width: 100%">
                          <el-option label="P1 - 紧急" value="P1 - 紧急" />
                          <el-option label="P2 - 高" value="P2 - 高" />
                          <el-option label="P3 - 中" value="P3 - 中" />
                          <el-option label="P4 - 低" value="P4 - 低" />
                        </el-select>
                      </el-col>
                      <el-col :span="8">
                        <el-select v-model="printSettings.filterStatus" placeholder="按状态筛选" clearable
                          style="width: 100%">
                          <el-option label="未完成" :value="false" />
                          <el-option label="已完成" :value="true" />
                        </el-select>
                      </el-col>
                    </el-row>
                  </el-form-item>

                  <el-form-item label="排序方式">
                    <el-select v-model="printSettings.sortBy" style="width: 100%">
                      <el-option label="按优先级排序" value="priority" />
                      <el-option label="按截止日期排序" value="deadline" />
                      <el-option label="按创建时间排序" value="id" />
                      <el-option label="按任务名称排序" value="title" />
                      <el-option label="按项目排序" value="project" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="每页任务数">
                    <el-input-number v-model="printSettings.tasksPerPage" :min="1" :max="50" :step="1"
                      controls-position="right" style="width: 100%" />
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="模板设置" name="template">
              <div class="tab-content template-settings">
                <el-tabs type="border-card" class="template-tabs">
                  <el-tab-pane label="页眉模板">
                    <div class="template-editor">
                      <div class="editor-toolbar">
                        <el-button-group>
                          <el-button @click="insertHeaderVariable('{title}')" size="small">标题</el-button>
                          <el-button @click="insertHeaderVariable('{date}')" size="small">日期</el-button>
                          <el-button @click="insertHeaderVariable('{time}')" size="small">时间</el-button>
                          <el-button @click="insertHeaderVariable('{page}')" size="small">页码</el-button>
                          <el-button @click="insertHeaderVariable('{totalPages}')" size="small">总页数</el-button>
                        </el-button-group>
                        <el-button-group style="margin-left: 10px">
                          <el-button @click="insertHeaderVariable('{user}')" size="small">用户</el-button>
                          <el-button @click="insertHeaderVariable('{totalTasks}')" size="small">任务数</el-button>
                          <el-button @click="insertHeaderVariable('{completedTasks}')" size="small">已完成</el-button>
                        </el-button-group>
                      </div>
                      <el-input v-model="printSettings.headerTemplate" type="textarea" :rows="6"
                        placeholder="输入页眉HTML内容，可以使用变量：{title}、{date}、{time}、{page}、{totalPages}、{user}、{totalTasks}、{completedTasks}"
                        @input="updatePreview" resize="none" />
                    </div>
                  </el-tab-pane>

                  <el-tab-pane label="页脚模板">
                    <div class="template-editor">
                      <div class="editor-toolbar">
                        <el-button-group>
                          <el-button @click="insertFooterVariable('{page}')" size="small">页码</el-button>
                          <el-button @click="insertFooterVariable('{totalPages}')" size="small">总页数</el-button>
                          <el-button @click="insertFooterVariable('{date}')" size="small">日期</el-button>
                          <el-button @click="insertFooterVariable('{time}')" size="small">时间</el-button>
                        </el-button-group>
                        <el-button-group style="margin-left: 10px">
                          <el-button @click="insertFooterVariable('{totalTasks}')" size="small">总任务数</el-button>
                          <el-button @click="insertFooterVariable('{completedTasks}')" size="small">已完成</el-button>
                          <el-button @click="insertFooterVariable('{pendingTasks}')" size="small">未完成</el-button>
                        </el-button-group>
                      </div>
                      <el-input v-model="printSettings.footerTemplate" type="textarea" :rows="6"
                        placeholder="输入页脚HTML内容，可以使用变量：{page}、{totalPages}、{date}、{time}、{totalTasks}、{completedTasks}、{pendingTasks}"
                        @input="updatePreview" resize="none" />
                    </div>
                  </el-tab-pane>

                  <el-tab-pane label="标题模板">
                    <div class="template-editor">
                      <div class="editor-toolbar">
                        <el-button-group>
                          <el-button @click="insertTitleVariable('{title}')" size="small">主标题</el-button>
                          <el-button @click="insertTitleVariable('{subtitle}')" size="small">副标题</el-button>
                          <el-button @click="insertTitleVariable('{date}')" size="small">日期</el-button>
                          <el-button @click="insertTitleVariable('{time}')" size="small">时间</el-button>
                        </el-button-group>
                        <el-button-group style="margin-left: 10px">
                          <el-button @click="insertTitleVariable('{totalTasks}')" size="small">任务总数</el-button>
                          <el-button @click="insertTitleVariable('{user}')" size="small">用户</el-button>
                          <el-button @click="insertTitleVariable('{project}')" size="small">项目</el-button>
                        </el-button-group>
                      </div>
                      <el-input v-model="printSettings.titleTemplate" type="textarea" :rows="4"
                        placeholder="输入标题HTML内容，可以使用变量：{title}、{subtitle}、{date}、{time}、{totalTasks}、{user}、{project}"
                        @input="updatePreview" resize="none" />

                      <div class="template-preview">
                        <h4>预览效果：</h4>
                        <div class="preview-box" v-html="getParsedTitle()"></div>
                      </div>
                    </div>
                  </el-tab-pane>

                  <el-tab-pane label="CSS样式">
                    <div class="template-editor">
                      <div class="editor-toolbar">
                        <el-button-group>
                          <el-button @click="insertStyle('.task-title')" size="small">任务标题</el-button>
                          <el-button @click="insertStyle('.task-description')" size="small">任务描述</el-button>
                          <el-button @click="insertStyle('.task-meta')" size="small">任务元信息</el-button>
                          <el-button @click="insertStyle('.subtask-item')" size="small">子任务</el-button>
                        </el-button-group>
                        <el-button-group style="margin-left: 10px">
                          <el-button @click="insertStyle('.header')" size="small">页眉</el-button>
                          <el-button @click="insertStyle('.footer')" size="small">页脚</el-button>
                          <el-button @click="insertStyle('.title-section')" size="small">标题区</el-button>
                        </el-button-group>
                      </div>
                      <el-input v-model="printSettings.customCSS" type="textarea" :rows="8" placeholder="输入自定义CSS样式"
                        @input="updatePreview" resize="none" />
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <!-- 右侧：打印预览 -->
        <div class="preview-right">
          <div class="preview-header">
            <div class="preview-title">
              <h3>
                <el-icon>
                  <View />
                </el-icon> 打印预览
              </h3>
              <div class="preview-info">
                <el-tag type="info" size="small"> {{ filteredTasks.length }} 个任务 </el-tag>
                <el-tag v-if="totalSubtasks > 0" type="info" size="small">
                  {{ totalSubtasks }} 个子任务
                </el-tag>
              </div>
            </div>

            <div class="preview-controls">
              <el-tooltip content="缩小预览" placement="top">
                <el-button @click="zoomOut" :icon="ZoomOut" circle size="small" />
              </el-tooltip>

              <el-slider v-model="zoom" :min="30" :max="200" :step="10" :format-tooltip="(val) => `${val}%`"
                style="width: 120px; margin: 0 8px" size="small" />

              <el-tooltip content="放大预览" placement="top">
                <el-button @click="zoomIn" :icon="ZoomIn" circle size="small" />
              </el-tooltip>

              <el-button @click="resetZoom" size="small" style="margin-left: 8px">
                {{ zoom }}%
              </el-button>

              <el-divider direction="vertical" />

              <!-- 在预览控制区域修改导出按钮 -->
              <el-dropdown @command="handleExport" trigger="click" placement="bottom">
                <el-button type="primary" size="small">
                  <el-icon>
                    <Download />
                  </el-icon>
                  导出
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="pdf" :icon="Document">导出PDF（当前页）</el-dropdown-item>
                    <el-dropdown-item command="pdf-all" :icon="DocumentCopy">导出完整PDF</el-dropdown-item>
                    <el-dropdown-item divided command="html" :icon="Document">导出HTML</el-dropdown-item>
                    <el-dropdown-item command="image" :icon="Picture">导出图片</el-dropdown-item>
                    <el-dropdown-item command="image-hd" :icon="PictureRounded">导出高清图片</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <div class="preview-container" @wheel="handleWheel" ref="previewContainerRef">
            <div class="paper" :class="[printSettings.style, printSettings.orientation]" :style="paperStyle"
              ref="paperRef">
              <!-- 自定义页眉 -->
              <div v-if="printSettings.headerTemplate" class="page-header" v-html="getParsedHeader(1)"></div>

              <!-- 标题区域 -->
              <div class="title-section" v-if="printSettings.titleTemplate">
                <div class="title-content" v-html="getParsedTitle()"></div>
              </div>

              <!-- 过滤条件展示 -->
              <div v-if="hasFilters" class="filter-section">
                <el-alert title="筛选条件" type="info" :closable="false" show-icon size="small">
                  <div class="filter-tags">
                    <template v-if="printSettings.filterProject">
                      <el-tag size="small" type="primary">
                        项目: {{ printSettings.filterProject }}
                      </el-tag>
                    </template>
                    <template v-if="printSettings.filterPriority">
                      <el-tag size="small" type="warning">
                        优先级: {{ printSettings.filterPriority }}
                      </el-tag>
                    </template>
                    <template v-if="printSettings.filterStatus !== undefined">
                      <el-tag size="small" :type="printSettings.filterStatus ? 'success' : 'danger'">
                        状态: {{ printSettings.filterStatus ? '已完成' : '未完成' }}
                      </el-tag>
                    </template>
                  </div>
                </el-alert>
              </div>

              <!-- 打印内容 -->
              <div class="print-content" :style="contentStyle">
                <!-- 任务内容 - 根据选择的样式渲染 -->
                <component :is="getStyleComponent()" :tasks="paginatedTasks" :settings="printSettings"
                  :page="currentPage" />

                <!-- 分页器 -->
                <div v-if="totalPages > 1" class="pagination-section">
                  <el-pagination v-model:current-page="currentPage" :page-size="printSettings.tasksPerPage"
                    :total="filteredTasks.length" :pager-count="5" layout="prev, pager, next" small background />
                </div>

                <!-- 统计信息 -->
                <div v-if="
                  printSettings.displayOptions.includes('showStatistics') &&
                  filteredTasks.length > 0
                " class="statistics-section">
                  <el-descriptions title="任务统计" :column="4" border size="small">
                    <el-descriptions-item label="任务总数">
                      <el-tag size="small">{{ filteredTasks.length }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="已完成">
                      <el-tag type="success" size="small">{{ completedCount }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="未完成">
                      <el-tag type="warning" size="small">{{ pendingCount }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="完成率">
                      <el-tag :type="completionRate >= 80
                        ? 'success'
                        : completionRate >= 50
                          ? 'warning'
                          : 'danger'
                        " size="small">
                        {{ completionRate }}%
                      </el-tag>
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </div>

              <!-- 自定义页脚 -->
              <div v-if="printSettings.footerTemplate" class="page-footer" v-html="getParsedFooter(1, totalPages)">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div class="footer-left">
          <el-button @click="resetSettings" plain>
            <el-icon>
              <Refresh />
            </el-icon>
            重置设置
          </el-button>
          <el-button @click="saveTemplate" plain>
            <el-icon>
              <FolderAdd />
            </el-icon>
            保存模板
          </el-button>
        </div>
        <div class="footer-right">
          <el-button @click="dialogVisible = false">取消</el-button>

          <el-dropdown @command="handleExport" trigger="click">
            <el-button type="primary">
              <el-icon>
                <Download />
              </el-icon>
              导出
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="pdf" :icon="Document">导出PDF（当前页）</el-dropdown-item>
                <el-dropdown-item command="pdf-all" :icon="DocumentCopy">导出完整PDF</el-dropdown-item>
                <el-dropdown-item divided command="html" :icon="Document">导出HTML</el-dropdown-item>
                <el-dropdown-item command="image" :icon="Picture">导出图片</el-dropdown-item>
                <el-dropdown-item command="image-hd" :icon="PictureRounded">导出高清图片</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button @click="handlePrint" type="success">
            <el-icon>
              <Printer />
            </el-icon>
            立即打印
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, h, defineAsyncComponent } from 'vue'
import {
  Printer,
  Download,
  ZoomIn,
  ZoomOut,
  View,
  Sort,
  Refresh,
  FolderAdd,
  Document,
  Picture,
  DocumentCopy,
  PictureRounded
} from '@element-plus/icons-vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// 动态导入样式组件
const SimpleStyle = defineAsyncComponent(() => import('./Style/SimpleStyle.vue').catch(() => null))
const DetailedStyle = defineAsyncComponent(() =>
  import('./Style/DetailedStyle.vue').catch(() => null),
)
const TableStyle = defineAsyncComponent(() => import('./Style/TableStyle.vue').catch(() => null))
const CardStyle = defineAsyncComponent(() => import('./Style/CardStyle.vue').catch(() => null))
const ReportStyle = defineAsyncComponent(() => import('./Style/ReportStyle.vue').catch(() => null))

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Array,
    default: () => [],
  },
})

// Emits
const emit = defineEmits(['update:visible', 'close'])

// Refs
const dialogVisible = ref(false)
const paperRef = ref(null)
const previewContainerRef = ref(null)
const zoom = ref(85)
const exporting = ref(false)
const activeTab = ref('page')
const currentPage = ref(1)

// 打印设置
const printSettings = ref({
  // 页面设置
  paperSize: 'A4',
  customWidth: 210,
  customHeight: 297,
  orientation: 'portrait',
  margin: 20,
  lineHeight: 1.6,
  fontSize: 14,

  // 内容设置
  style: 'detailed',
  displayOptions: [
    'showTitle',
    'showProject',
    'showPriority',
    'showTags',
    'showDeadline',
    'showDescription',
    'showSubtasks',
    'showAssignees',
    'showStatus',
    'showStatistics',
  ],
  filterProject: null,
  filterPriority: null,
  filterStatus: null,
  sortBy: 'priority',
  tasksPerPage: 10,

  // 模板设置
  headerTemplate: `<div class="custom-header">
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 2px solid #409eff;">
      <div style="font-size: 16px; font-weight: bold; color: #303133;">{title}</div>
      <div style="font-size: 12px; color: #909399;">
        打印时间: {date} {time} | 第 {page} 页/共 {totalPages} 页
      </div>
    </div>
  </div>`,

  footerTemplate: `<div class="custom-footer">
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-top: 1px solid #e4e7ed; font-size: 12px; color: #909399;">
      <div>总任务数: {totalTasks} | 已完成: {completedTasks} | 未完成: {pendingTasks}</div>
      <div>© 2024 Task Management System</div>
      <div>页码: {page}/{totalPages}</div>
    </div>
  </div>`,

  titleTemplate: `<div class="custom-title">
    <div style="text-align: center; margin: 20px 0 30px 0;">
      <h1 style="margin: 0 0 10px 0; color: #303133; font-size: 28px; font-weight: 600; position: relative; display: inline-block; padding-bottom: 15px;">
        任务清单报告
        <span style="position: absolute; bottom: 0; left: 25%; right: 25%; height: 3px; background: linear-gradient(90deg, #409eff, #67c23a, #e6a23c); border-radius: 2px;"></span>
      </h1>
      <div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 10px;">
        <div style="font-size: 14px; color: #606266;">
          <span style="color: #409eff;">{user}</span> | 生成于 {date} {time}
        </div>
        <el-tag type="primary" size="small">共 {totalTasks} 个任务</el-tag>
      </div>
    </div>
  </div>`,

  customCSS: `.custom-header {
    margin-bottom: 20px;
  }

  .custom-title h1 {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .custom-footer {
    margin-top: 30px;
  }

  .task-item {
    transition: all 0.3s ease;
  }

  .task-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }`,
})

// 纸张尺寸映射
const paperSizes = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  A5: { width: 148, height: 210 },
  B5: { width: 176, height: 250 },
}

// 计算属性
const tasks = computed(() => props.data || [])

const uniqueProjects = computed(() => {
  const projects = new Set()
  tasks.value.forEach((task) => {
    if (task.project) {
      projects.add(task.project)
    }
  })
  return Array.from(projects)
})

const filteredTasks = computed(() => {
  let filtered = [...tasks.value]

  // 应用过滤器
  if (printSettings.value.filterProject) {
    filtered = filtered.filter((task) => task.project === printSettings.value.filterProject)
  }

  if (printSettings.value.filterPriority) {
    filtered = filtered.filter((task) => task.priority === printSettings.value.filterPriority)
  }

  if (printSettings.value.filterStatus !== undefined) {
    filtered = filtered.filter((task) => task.completed === printSettings.value.filterStatus)
  }

  // 应用排序
  filtered.sort((a, b) => {
    switch (printSettings.value.sortBy) {
      case 'priority':
        const priorityOrder = { 'P1 - 紧急': 1, 'P2 - 高': 2, 'P3 - 中': 3, 'P4 - 低': 4 }
        return (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5)
      case 'deadline':
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(a.deadline) - new Date(b.deadline)
      case 'id':
        return b.id - a.id
      case 'title':
        return a.title.localeCompare(b.title)
      case 'project':
        return (a.project || '').localeCompare(b.project || '')
      default:
        return 0
    }
  })

  return filtered
})

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * printSettings.value.tasksPerPage
  const end = start + printSettings.value.tasksPerPage
  return filteredTasks.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredTasks.value.length / printSettings.value.tasksPerPage)
})

const totalSubtasks = computed(() => {
  return filteredTasks.value.reduce((total, task) => {
    return total + (task.subtasks ? task.subtasks.length : 0)
  }, 0)
})

const completedCount = computed(() => {
  return filteredTasks.value.filter((task) => task.completed).length
})

const pendingCount = computed(() => {
  return filteredTasks.value.filter((task) => !task.completed).length
})

const completionRate = computed(() => {
  if (filteredTasks.value.length === 0) return 0
  return Math.round((completedCount.value / filteredTasks.value.length) * 100)
})

const hasFilters = computed(() => {
  return (
    printSettings.value.filterProject ||
    printSettings.value.filterPriority ||
    printSettings.value.filterStatus !== undefined
  )
})

const paperStyle = computed(() => {
  const settings = printSettings.value

  let width, height
  if (settings.paperSize === 'custom') {
    width = settings.customWidth
    height = settings.customHeight
  } else {
    const size = paperSizes[settings.paperSize] || paperSizes.A4
    width = size.width
    height = size.height
  }

  // 如果为横向，交换宽高
  if (settings.orientation === 'landscape') {
    ;[width, height] = [height, width]
  }

  return {
    width: `${width}mm`,
    height: `${height}mm`,
    transform: `scale(${zoom.value / 100})`,
    transformOrigin: 'center top',
    margin: '20px auto',
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineHeight,
  }
})

const contentStyle = computed(() => {
  return {
    padding: `${printSettings.value.margin}mm`,
    height: `calc(100% - ${printSettings.value.margin * 2}mm)`,
    boxSizing: 'border-box',
  }
})

// 方法
const getStyleComponent = () => {
  switch (printSettings.value.style) {
    case 'simple':
      return SimpleStyle
    case 'detailed':
      return DetailedStyle
    case 'table':
      return TableStyle
    case 'card':
      return CardStyle
    case 'report':
      return ReportStyle
    default:
      return DetailedStyle
  }
}

const handlePaperSizeChange = (size) => {
  if (size !== 'custom' && paperSizes[size]) {
    printSettings.value.customWidth = paperSizes[size].width
    printSettings.value.customHeight = paperSizes[size].height
  }
}

const handleOrientationChange = (orientation) => {
  if (orientation === 'landscape') {
    const width = printSettings.value.customWidth
    const height = printSettings.value.customHeight
    printSettings.value.customWidth = Math.max(width, height)
    printSettings.value.customHeight = Math.min(width, height)
  }
}

const getParsedHeader = (page) => {
  if (!printSettings.value.headerTemplate) return ''

  return printSettings.value.headerTemplate
    .replace(/{title}/g, '任务清单')
    .replace(/{date}/g, new Date().toLocaleDateString('zh-CN'))
    .replace(
      /{time}/g,
      new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    )
    .replace(/{page}/g, page)
    .replace(/{totalPages}/g, totalPages.value)
    .replace(/{user}/g, '当前用户')
    .replace(/{totalTasks}/g, filteredTasks.value.length)
    .replace(/{completedTasks}/g, completedCount.value)
}

const getParsedFooter = (page, totalPages) => {
  if (!printSettings.value.footerTemplate) return ''

  return printSettings.value.footerTemplate
    .replace(/{page}/g, page)
    .replace(/{totalPages}/g, totalPages)
    .replace(/{date}/g, new Date().toLocaleDateString('zh-CN'))
    .replace(
      /{time}/g,
      new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    )
    .replace(/{totalTasks}/g, filteredTasks.value.length)
    .replace(/{completedTasks}/g, completedCount.value)
    .replace(/{pendingTasks}/g, pendingCount.value)
}

const getParsedTitle = () => {
  if (!printSettings.value.titleTemplate) return ''

  return printSettings.value.titleTemplate
    .replace(/{title}/g, '任务清单报告')
    .replace(/{subtitle}/g, '详细任务列表')
    .replace(/{date}/g, new Date().toLocaleDateString('zh-CN'))
    .replace(
      /{time}/g,
      new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    )
    .replace(/{totalTasks}/g, filteredTasks.value.length)
    .replace(/{user}/g, '当前用户')
    .replace(/{project}/g, printSettings.value.filterProject || '所有项目')
}

const insertHeaderVariable = (variable) => {
  const textarea = document.querySelector('.template-editor .el-textarea__inner')
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    printSettings.value.headerTemplate =
      printSettings.value.headerTemplate.substring(0, start) +
      variable +
      printSettings.value.headerTemplate.substring(end)
  }
}

const insertFooterVariable = (variable) => {
  const textarea = document.querySelector('.template-editor .el-textarea__inner')
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    printSettings.value.footerTemplate =
      printSettings.value.footerTemplate.substring(0, start) +
      variable +
      printSettings.value.footerTemplate.substring(end)
  }
}

const insertTitleVariable = (variable) => {
  const textarea = document.querySelector('.template-editor .el-textarea__inner')
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    printSettings.value.titleTemplate =
      printSettings.value.titleTemplate.substring(0, start) +
      variable +
      printSettings.value.titleTemplate.substring(end)
  }
}

const insertStyle = (selector) => {
  const style = `${selector} {\n  /* 添加样式 */\n}`
  printSettings.value.customCSS += '\n\n' + style
  // 当自定义CSS更新时，动态应用到页面
  applyCustomCSS()
}

const updatePreview = () => {
  // 触发重新渲染
  nextTick(() => {
    // 这里可以添加任何预览更新逻辑
  })
}

const zoomIn = () => {
  if (zoom.value < 200) {
    zoom.value = Math.min(zoom.value + 10, 200)
  }
}

const zoomOut = () => {
  if (zoom.value > 30) {
    zoom.value = Math.max(zoom.value - 10, 30)
  }
}

const resetZoom = () => {
  zoom.value = 85
}

const handleWheel = (event) => {
  if (event.ctrlKey) {
    event.preventDefault()
    if (event.deltaY < 0) {
      zoomIn()
    } else {
      zoomOut()
    }
  }
}

// 修改handleExport方法
const handleExport = async (command) => {
  switch (command) {
    case 'pdf':
      await exportPDF()
      break
    case 'pdf-all':
      await exportAllPagesPDF()
      break
    case 'html':
      await exportHTML()
      break
    case 'image':
      await exportImage()
      break
    case 'image-hd':
      await exportHighResImage()
      break
  }
}

// 修改预览控件的导出按钮
// 在预览控制区域添加更多导出选项
const previewControls = {
  data() {
    return {
      exportOptions: [
        { command: 'pdf', label: '导出PDF（当前页）', icon: 'Document' },
        { command: 'pdf-all', label: '导出完整PDF', icon: 'DocumentCopy' },
        { command: 'html', label: '导出HTML', icon: 'Document' },
        { command: 'image', label: '导出图片', icon: 'Picture' },
        { command: 'image-hd', label: '导出高清图片', icon: 'PictureRounded' },
      ],
    }
  },
}

const exportPDF = async () => {
  exporting.value = true
  try {
    const paper = paperRef.value
    if (!paper) {
      throw new Error('未找到打印内容')
    }

    // 保存原始样式
    const originalTransform = paper.style.transform
    const originalMargin = paper.style.margin
    const originalFontSize = paper.style.fontSize
    const originalLineHeight = paper.style.lineHeight

    // 临时设置为打印样式
    paper.style.transform = 'scale(1)'
    paper.style.margin = '0'

    const settings = printSettings.value
    let paperWidth, paperHeight

    if (settings.paperSize === 'custom') {
      paperWidth = settings.customWidth
      paperHeight = settings.customHeight
    } else {
      const size = paperSizes[settings.paperSize] || paperSizes.A4
      paperWidth = size.width
      paperHeight = size.height
    }

    // 如果为横向，交换宽高
    if (settings.orientation === 'landscape') {
      ;[paperWidth, paperHeight] = [paperHeight, paperWidth]
    }

    // 创建PDF文档
    const pdf = new jsPDF({
      orientation: settings.orientation,
      unit: 'mm',
      format: settings.paperSize === 'custom' ? [paperWidth, paperHeight] : settings.paperSize,
    })

    // 计算缩放比例
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    // 将纸张内容转换为canvas
    const canvas = await html2canvas(paper, {
      scale: 2, // 提高分辨率
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      foreignObjectRendering: false,
      onclone: (clonedDoc) => {
        // 在克隆的文档中应用打印样式
        const clonedPaper = clonedDoc.querySelector('.paper')
        if (clonedPaper) {
          clonedPaper.style.transform = 'scale(1)'
          clonedPaper.style.margin = '0'
          clonedPaper.style.width = `${paperWidth}mm`
          clonedPaper.style.height = `${paperHeight}mm`

          // 应用字体大小和行高
          clonedPaper.style.fontSize = `${settings.fontSize}px`
          clonedPaper.style.lineHeight = `${settings.lineHeight}`

          // 隐藏不需要的元素
          const elementsToHide = clonedDoc.querySelectorAll(
            '.no-print, .preview-controls, .preview-toolbar',
          )
          elementsToHide.forEach((el) => {
            el.style.display = 'none'
          })
        }
      },
    })

    // 恢复原始样式
    paper.style.transform = originalTransform
    paper.style.margin = originalMargin
    paper.style.fontSize = originalFontSize
    paper.style.lineHeight = originalLineHeight

    const imgData = canvas.toDataURL('image/png')
    const imgWidth = pdfWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // 添加第一页
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)

    // 如果内容高度超过一页，添加分页
    let heightLeft = imgHeight
    let position = 0
    let page = 1

    while (heightLeft >= pdfHeight) {
      position = heightLeft - pdfHeight
      pdf.addPage()
      page++

      // 为后续页面添加页眉和页脚
      if (settings.headerTemplate) {
        const headerHTML = getParsedHeader(page)
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = headerHTML
        const headerCanvas = await html2canvas(tempDiv, {
          scale: 1,
          backgroundColor: '#ffffff',
        })
        const headerImg = headerCanvas.toDataURL('image/png')
        pdf.addImage(headerImg, 'PNG', 0, 0, pdfWidth, 20)
      }

      // 添加图片剩余部分
      pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight)

      // 为后续页面添加页脚
      if (settings.footerTemplate) {
        const footerHTML = getParsedFooter(page, totalPages.value)
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = footerHTML
        const footerCanvas = await html2canvas(tempDiv, {
          scale: 1,
          backgroundColor: '#ffffff',
        })
        const footerImg = footerCanvas.toDataURL('image/png')
        const footerHeight = 20
        pdf.addImage(footerImg, 'PNG', 0, pdfHeight - footerHeight, pdfWidth, footerHeight)
      }

      heightLeft -= pdfHeight
    }

    // 保存PDF文件
    const fileName = `任务清单_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.pdf`
    pdf.save(fileName)

    ElMessage.success('PDF导出成功')
  } catch (error) {
    console.error('导出PDF失败:', error)
    ElMessage.error(`导出PDF失败: ${error.message}`)
  } finally {
    exporting.value = false
  }
}

const exportHTML = async () => {
  const htmlContent = paperRef.value.outerHTML
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `任务清单_${new Date().getTime()}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('HTML导出成功')
}

const exportImage = async () => {
  try {
    const canvas = await html2canvas(paperRef.value, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    })

    const dataURL = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataURL
    a.download = `任务清单_${new Date().getTime()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    ElMessage.success('图片导出成功')
  } catch (error) {
    ElMessage.error('图片导出失败')
  }
}

// 修改handlePrint方法，支持更好的打印体验
const handlePrint = async () => {
  const paper = paperRef.value;
  if (!paper) return;

  // 1. 收集页面所有样式（关键步骤）
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(el => el.outerHTML)
    .join('\n');

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  // 2. 写入时包含原页面的所有样式
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head><title>打印</title>${styles}</head>
      <body>
        ${paper.outerHTML}
        <script>
          setTimeout(() => {
            window.print();
            window.onafterprint = () => window.close();
          }, 300);
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
// 新增：批量导出多页PDF
const exportAllPagesPDF = async () => {
  exporting.value = true
  try {
    const settings = printSettings.value
    let paperWidth, paperHeight

    if (settings.paperSize === 'custom') {
      paperWidth = settings.customWidth
      paperHeight = settings.customHeight
    } else {
      const size = paperSizes[settings.paperSize] || paperSizes.A4
      paperWidth = size.width
      paperHeight = size.height
    }

    if (settings.orientation === 'landscape') {
      ;[paperWidth, paperHeight] = [paperHeight, paperWidth]
    }

    // 创建PDF文档
    const pdf = new jsPDF({
      orientation: settings.orientation,
      unit: 'mm',
      format: settings.paperSize === 'custom' ? [paperWidth, paperHeight] : settings.paperSize,
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    // 保存当前页码
    const originalPage = currentPage.value

    // 为每一页生成PDF
    for (let pageNum = 1; pageNum <= totalPages.value; pageNum++) {
      currentPage.value = pageNum

      // 等待DOM更新
      await nextTick()

      const paper = paperRef.value
      if (!paper) continue

      // 临时样式
      const originalTransform = paper.style.transform
      const originalMargin = paper.style.margin

      paper.style.transform = 'scale(1)'
      paper.style.margin = '0'

      const canvas = await html2canvas(paper, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })

      paper.style.transform = originalTransform
      paper.style.margin = originalMargin

      const imgData = canvas.toDataURL('image/png')
      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      if (pageNum > 1) {
        pdf.addPage()
      }

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    }

    // 恢复原始页码
    currentPage.value = originalPage

    const fileName = `任务清单_完整版_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.pdf`
    pdf.save(fileName)

    ElMessage.success('完整PDF导出成功')
  } catch (error) {
    console.error('批量导出PDF失败:', error)
    ElMessage.error(`批量导出PDF失败: ${error.message}`)
  } finally {
    exporting.value = false
  }
}

// 新增：导出为高分辨率图片
const exportHighResImage = async () => {
  exporting.value = true
  try {
    const paper = paperRef.value
    if (!paper) {
      throw new Error('未找到打印内容')
    }

    // 临时样式
    const originalTransform = paper.style.transform
    const originalMargin = paper.style.margin

    paper.style.transform = 'scale(1)'
    paper.style.margin = '0'

    const canvas = await html2canvas(paper, {
      scale: 4, // 更高分辨率
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    paper.style.transform = originalTransform
    paper.style.margin = originalMargin

    const dataURL = canvas.toDataURL('image/png', 1.0)
    const a = document.createElement('a')
    a.href = dataURL
    a.download = `任务清单_高清图片_${new Date().getTime()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    ElMessage.success('高清图片导出成功')
  } catch (error) {
    console.error('导出图片失败:', error)
    ElMessage.error(`导出图片失败: ${error.message}`)
  } finally {
    exporting.value = false
  }
}



const resetSettings = () => {
  printSettings.value = {
    paperSize: 'A4',
    customWidth: 210,
    customHeight: 297,
    orientation: 'portrait',
    margin: 20,
    lineHeight: 1.6,
    fontSize: 14,
    style: 'detailed',
    displayOptions: [
      'showTitle',
      'showProject',
      'showPriority',
      'showTags',
      'showDeadline',
      'showDescription',
      'showSubtasks',
      'showAssignees',
      'showStatus',
      'showStatistics',
    ],
    filterProject: null,
    filterPriority: null,
    filterStatus: null,
    sortBy: 'priority',
    tasksPerPage: 10,
  }
  currentPage.value = 1
  ElMessage.success('设置已重置')
}

const saveTemplate = () => {
  const template = {
    name: `模板_${new Date().toLocaleString()}`,
    settings: { ...printSettings.value },
  }
  localStorage.setItem('print_template', JSON.stringify(template))
  ElMessage.success('模板已保存')
}

const loadTemplate = () => {
  const saved = localStorage.getItem('print_template')
  if (saved) {
    const template = JSON.parse(saved)
    printSettings.value = template.settings
    ElMessage.success('模板已加载')
  }
}

const handleClose = () => {
  dialogVisible.value = false
  emit('close')
  emit('update:visible', false)
}

// 监听
watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val
    if (val) {
      nextTick(() => {
        resetZoom()
        loadTemplate()
      })
    }
  },
)

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

const applyCustomCSS = () => {
  // 移除旧的样式
  const oldStyle = document.getElementById('dynamic-print-styles')
  if (oldStyle) {
    oldStyle.remove()
  }

  // 如果存在自定义CSS，动态创建style标签
  if (printSettings.value.customCSS) {
    const style = document.createElement('style')
    style.id = 'dynamic-print-styles'
    style.textContent = printSettings.value.customCSS
    document.head.appendChild(style)
  }
}

// 初始化
onMounted(() => {
  handlePaperSizeChange(printSettings.value.paperSize)
})
</script>

<style lang="scss" scoped>
.print-dialog-container {
  :deep(.el-dialog) {
    max-width: 95%;
    margin-top: 5vh;
  }

  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.print-dialog {
  display: flex;
  flex-direction: column;
  height: 75vh;
  gap: 0;

  .main-settings {
    display: flex;
    height: 100%;
    gap: 20px;

    .settings-left {
      width: 35%;
      min-width: 400px;
      display: flex;
      flex-direction: column;
      background: #fff;
      border-radius: 8px;
      border: 1px solid #e4e7ed;

      .settings-tabs {
        flex: 1;

        :deep(.el-tabs__header) {
          margin: 0;
          background: #f5f7fa;
          border-radius: 8px 8px 0 0;

          .el-tabs__nav-wrap {
            padding: 0 20px;

            .el-tabs__nav-scroll {
              overflow: visible;
            }

            .el-tabs__item {
              padding: 0 20px;
              height: 44px;
              line-height: 44px;
              font-weight: 500;
            }
          }
        }

        :deep(.el-tabs__content) {
          flex: 1;
          overflow: auto;
          padding: 20px;

          .tab-content {
            height: 100%;

            .el-form {
              .el-form-item {
                margin-bottom: 20px;

                &:last-child {
                  margin-bottom: 0;
                }

                .el-form-item__label {
                  font-weight: 500;
                  color: #606266;
                  padding-right: 20px;
                }

                .el-checkbox-group {
                  .el-col {
                    margin-bottom: 8px;
                  }
                }
              }
            }

            &.template-settings {
              .template-tabs {
                border: none;
                box-shadow: none;

                :deep(.el-tabs__header) {
                  margin-bottom: 20px;
                  border: 1px solid #e4e7ed;
                  border-radius: 4px;

                  .el-tabs__item {
                    padding: 0 20px;
                    height: 40px;
                    line-height: 40px;
                  }
                }

                .template-editor {
                  .editor-toolbar {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    padding: 10px;
                    background: #f5f7fa;
                    border-radius: 4px;
                    border: 1px solid #e4e7ed;

                    .el-button-group {
                      display: flex;
                      flex-wrap: wrap;
                      gap: 4px;
                    }
                  }

                  .template-preview {
                    margin-top: 20px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 4px;
                    border: 1px solid #e4e7ed;

                    h4 {
                      margin: 0 0 10px 0;
                      color: #606266;
                      font-size: 14px;
                    }

                    .preview-box {
                      padding: 15px;
                      background: white;
                      border-radius: 4px;
                      min-height: 100px;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    .preview-right {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      background: #fff;
      border-radius: 8px;
      border: 1px solid #e4e7ed;

      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #e4e7ed;
        background: #f5f7fa;
        border-radius: 8px 8px 0 0;

        .preview-title {
          display: flex;
          align-items: center;
          gap: 12px;

          h3 {
            margin: 0;
            color: #303133;
            font-size: 16px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .preview-info {
            display: flex;
            gap: 8px;
          }
        }

        .preview-controls {
          display: flex;
          align-items: center;
          gap: 8px;

          .el-divider {
            margin: 0 8px;
            height: 20px;
          }
        }
      }

      .preview-container {
        flex: 1;
        overflow: auto;
        padding: 20px;
        background:
          linear-gradient(45deg,
            #f5f7fa 25%,
            transparent 25%,
            transparent 75%,
            #f5f7fa 75%,
            #f5f7fa),
          linear-gradient(45deg,
            #f5f7fa 25%,
            transparent 25%,
            transparent 75%,
            #f5f7fa 75%,
            #f5f7fa);
        background-size: 20px 20px;
        background-position:
          0 0,
          10px 10px;

        .paper {
          background: white;
          box-shadow: 0 6px 30px rgba(0, 0, 0, 0.15);
          border-radius: 8px;
          position: relative;

          .page-header {
            border-bottom: 1px solid #e4e7ed;
            margin-bottom: 20px;
          }

          .title-section {
            margin-bottom: 30px;

            .title-content {
              h1 {
                background: linear-gradient(120deg, #409eff, #67c23a);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                padding-bottom: 15px;
                margin-bottom: 10px;
                position: relative;

                &::after {
                  content: '';
                  position: absolute;
                  bottom: 0;
                  left: 30%;
                  right: 30%;
                  height: 4px;
                  background: linear-gradient(90deg, #409eff, #67c23a, #e6a23c);
                  border-radius: 2px;
                }
              }

              h2 {
                color: #606266;
                font-weight: normal;
                font-size: 18px;
                margin-top: 10px;
              }
            }
          }

          .filter-section {
            margin-bottom: 20px;

            .filter-tags {
              display: flex;
              gap: 8px;
              flex-wrap: wrap;
            }
          }

          .print-content {
            .pagination-section {
              margin: 20px 0;
              display: flex;
              justify-content: center;
            }

            .statistics-section {
              margin-top: 30px;
            }
          }

          .page-footer {
            border-top: 1px solid #e4e7ed;
            margin-top: 20px;
          }
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;

  .footer-left,
  .footer-right {
    display: flex;
    gap: 10px;
  }
}

/* 添加打印相关样式 */
.no-print {
  @media print {
    display: none !important;
  }
}

/* 优化打印时的元素显示 */
@media print {
  .paper {
    box-shadow: none !important;
    border: none !important;
  }

  .task-item,
  .task-card {
    break-inside: avoid;
  }
}
</style>
