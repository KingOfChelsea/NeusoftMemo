<template>
  <div class="todo-app">
    <!-- 1.眉头栏 Header -->
    <header class="app-header">
      <div class="left">
        <h2 class="logo">Todo Pro</h2>
        <span class="current-view">所有任务</span>
        <el-tag size="small" type="warning">PC 管理版</el-tag>
        <el-tag class="copy-btn" @click="copyTimeToClipboard(formattedTime)">
          {{ formattedTime }}</el-tag>
      </div>
      <!-- 1.1搜索框 Search -->
      <div class="center">
        <el-input placeholder="搜索任务 / 标签 / 项目" v-model="searchText" clearable>
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
          <template #suffix>
            <el-icon>
              <Filter />
            </el-icon>
          </template>
        </el-input>
      </div>
      <!-- 1.2 工具栏 Toolbar -->
      <div class="right">
        <el-button type="primary" @click="openDialog">新建任务</el-button>
        <el-button @click="exportJson">导出</el-button>
        <el-button @click="triggerImport">导入</el-button>
        <input ref="fileInput" type="file" accept="application/json" style="display: none" @change="importJson" />
        <el-button @click="refreshTodos">刷新</el-button>
        <AiSelectorPopover @select="handleSelect" @confirm="handleConfirm" @add="handleAddAI" @edit="handleEdit"
          @delete="handleDeleteAI" @favorite="handleFavorite" />
        <router-link to="/config">
          <el-button color="#626aef" type="primary" :icon="Setting"> 参数控制 </el-button>
        </router-link>
        <el-button @click="handleToggleFullScreen">
          <el-icon>
            <FullScreen />
          </el-icon>
          {{ isFullScreen ? '退出全屏' : '全屏模式' }}
        </el-button>

        <!-- 扩展下拉菜单 Added By ZaneXu 2026/4/15 -->
        <el-dropdown @command="handleDropdownCommand">
          <el-button>
            更多
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="config">
                <el-icon>
                  <Paperclip />
                </el-icon>
                图片上传
              </el-dropdown-item>
              <el-dropdown-item command="fullscreen">
                <el-icon>
                  <FullScreen />
                </el-icon>
                {{ isFullScreen ? '退出全屏' : '全屏模式' }}
              </el-dropdown-item>
              <el-dropdown-item divided command="statistics">
                <router-link to="/statistics" style="text-decoration: none">
                  <el-icon>
                    <DataLine />
                  </el-icon>
                  统计报表
                </router-link>
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <el-icon>
                  <Operation />
                </el-icon>
                设置
              </el-dropdown-item>
              <el-dropdown-item command="help">
                <el-icon>
                  <QuestionFilled />
                </el-icon>
                帮助文档
              </el-dropdown-item>
              <el-dropdown-item divided command="feedback">
                <el-icon>
                  <ChatDotSquare />
                </el-icon>
                意见反馈
              </el-dropdown-item>
              <el-dropdown-item command="about">
                <el-icon>
                  <InfoFilled />
                </el-icon>
                关于
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <!-- 版本号 Created By ZaneXu 2025 -->
        <span class="app-version">版本: v{{ currentVersion }}</span>
        <el-avatar size="small">U</el-avatar>
      </div>
    </header>

    <!-- 2.内容 Body -->
    <div class="app-container">
      <div class="app-body">
        <!-- 一、侧边栏Sidebar -->
        <el-scrollbar class="sidebar">
          <aside>
            <!-- 1.时间 Created By ZaneXu 2025 -->
            <div class="section">
              <h4>📅 时间</h4>
              <ul>
                <li>
                  今天
                  <span class="count">{{ timeStats.today }}</span>
                </li>
                <li>
                  明天
                  <span class="count">{{ timeStats.tomorrow }}</span>
                </li>
                <li>
                  本周
                  <span class="count">{{ timeStats.thisWeek }}</span>
                </li>
                <li class="danger">
                  已过期
                  <span class="count">{{ timeStats.overdue }}</span>
                </li>
              </ul>
            </div>

            <!-- 2.文件 Created By ZaneXu 2025 -->
            <div class="section">
              <h4>
                📁 项目
                <el-button text size="small" icon="Plus" @click="openAddProjectDialog" type="primary">新增项目</el-button>
              </h4>

              <ul>
                <li v-for="(project, index) in projectOptions" :key="index">
                  {{ project }}
                  <span>
                    {{ getProjectCount(project) }}
                    <el-button type="primary" text size="small" @click="removeProject(project)">删除
                    </el-button>
                  </span>
                </li>
              </ul>
            </div>

            <!-- 3.标签 Created By ZaneXu 2025 -->
            <div class="section">
              <h4>
                🎈 标签
                <el-button icon="Plus" text size="small" type="primary" @click="openAddTagDialog">
                  新建标签
                </el-button>
              </h4>
              <div class="tags">
                <el-tag v-for="(tag, index) in tagOptions" @close="removeTag(index)" closable :key="index" size="small"
                  :color="tag.color" :style="{ color: tag.fontColor }">
                  {{ tag.name }}
                </el-tag>
              </div>
            </div>

            <!-- 4.优先级设置 Created By ZaneXu 2026 -->
            <div class="section">
              <h4>
                优先级设置
                <el-button text type="primary" size="small" icon="Plus" @click="PriorityHandleAdd">
                  添加优先级
                </el-button>
              </h4>
              <!-- 使用 el-radio-group 实现单选 -->
              <el-radio-group v-model="currentPriority" class="priority-group">
                <el-radio v-for="priority in priorityList" :key="priority.value" :value="priority.value">
                  <div class="priority-content">
                    <el-tag :type="getTagType(priority.value)" size="small">
                      {{ priority.label }}
                    </el-tag>
                    <span class="priority-desc">{{ priority.desc }}</span>
                    <span class="priority-actions">
                      <el-button type="primary" size="small" :icon="Edit" circle class="edit-btn"
                        @click="proiorityHandleEdit(priority)" title="编辑" />
                      <el-button v-if="!priority.fixed" type="danger" size="small" :icon="Delete" circle
                        @click.stop="handleDelete(priority)" title="删除" />
                      <el-button v-else type="info" size="small" :icon="Lock" circle disabled title="系统默认，不可删除" />
                    </span>
                  </div>
                </el-radio>
              </el-radio-group>
            </div>

            <!-- 5.负责人 Created By ZaneXu 2026 -->
            <div class="section">
              <h4>
                负责人维护
                <el-button text type="primary" size="small" icon="Plus" @click="addUserDialog">
                  添加
                </el-button>
              </h4>
              <div class="tags" v-for="user in allUsers" :key="user.id">
                <div style="
                    font-size: small;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 3px;
                  ">
                  <el-avatar :size="20" :src="user.avatar" />
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-department">{{ user.department }}</span>
                </div>
                <div class="user-actions">
                  <el-button type="warning" size="small" icon="Edit" circle plain @click="editUser(user)" />
                  <el-button type="danger" size="small" icon="Delete" circle plain @click="removeUser(user.id)" />
                </div>
              </div>
            </div>
          </aside>
        </el-scrollbar>

        <!-- 二、主板块内容Main -->
        <main class="main">
          <div class="main-toolbar">
            <div class="left">
              <!-- 全选和基础操作 -->
              <el-checkbox v-model="allSelected" @change="toggleAll">全选</el-checkbox>

              <el-button icon="RefreshLeft" size="small" type="primary" color="#FF6B8B" @click="restartFilter"
                style="color: white;">
                重置筛选
              </el-button>

              <el-button icon="Printer" size="small" @click="printData" type="primary" color="#3D5AFE"> 打印 </el-button>

              <!-- 筛选操作 - 多巴胺配色 -->
              <el-button icon="Finished" size="small" @click="setCompletionFilter('completed')" color="#3fc1c9"
                style="color: white;">
                已完成
              </el-button>

              <el-button icon="CircleClose" size="small" @click="setCompletionFilter('active')" color="#FFD166"
                style="color: white;">

                未完成
              </el-button>

              <el-button icon="Menu" size="small" @click="setCompletionFilter('all')" color="#6639a6"
                style="color: white;" <!-- 梦幻紫 -->

                全部任务
              </el-button>

              <!-- 视图切换 - 渐变蓝紫色系 -->
              <el-button size="small" icon="Menu" color="#5D5FEF" <!-- 靛蓝色 -->

                列表
              </el-button>

              <el-button size="small" icon="Grid" color="#7B61FF" <!-- 亮紫色 -->

                看板
              </el-button>

              <el-button size="small" icon="Calendar" color="#9D4EDD" <!-- 紫红色 -->

                日历
              </el-button>

              <el-button icon="Calendar" size="small" @click="toggleGroupByDate" color="#4361EE" <!-- 宝石蓝 -->

                {{ groupByDate ? '取消分组' : '按日期分组' }}
              </el-button>

              <!-- 导出按钮 -->
              <ExcelExport :tasks="todos" :filtered-tasks="activeTodos" button-type="success" button-text="导出Excel"
                :mini="false" default-file-name="任务清单" sheet-name="任务列表" />
            </div>

            <div class="right">
              <!-- 为了样式不启用这块内容 -->
            </div>
          </div>

          <div class="todo-list">
            <!-- Todo Item -->
            <el-scrollbar height="100%">
              <!-- 未完成部分 -->
              <div class="todo-item" v-for="(todo, index) in activeTodos" :key="todo.id" :class="{
                completed: todo.completed,
                selected: selectedTask && selectedTask.id === todo.id,
                dragging: dragIndex === index,
              }" @click="selectTask(todo)" @contextmenu.prevent="openContextMenu($event, todo)" draggable="true"
                @dragstart="onDragStart(index)" @dragover.prevent @drop="onDrop(index)" @dragend="onDragEnd">
                <div class="left">
                  <el-checkbox v-model="todo.completed" @change="onCompletedChange(todo)" />
                </div>

                <div class="content">
                  <div class="title">
                    <span class="priority" :class="todo.priority">
                      <el-tag effect="light" type="success" size="large" hi>{{
                        todo.priority.toUpperCase()
                      }}</el-tag>
                    </span>
                    {{ todo.title }}
                  </div>

                  <div class="meta">
                    <el-tag v-for="tag in todo.tags" :key="tag" size="small">{{ tag }}</el-tag>
                    <span class="deadline" :class="{ expired: isExpired(todo.deadline) }">
                      {{ todo.deadline ? '截止：' + formatDate(todo.deadline) : '' }}
                    </span>
                    <el-text type="success">{{ todo.project }}</el-text>
                  </div>
                </div>
                <div class="subtask-progress" v-if="todo.subtasks && todo.subtasks.length">
                  <el-progress :percentage="calcSubtaskProgress(todo)" :stroke-width="6" :show-text="false" />
                  <span class="count">
                    {{ completedSubtasks(todo) }} / {{ todo.subtasks.length }}
                  </span>
                </div>

                <div class="actions">
                  <el-button text size="small" @click.stop="editTask(todo)">编辑</el-button>
                  <el-button text size="small" type="danger" @click.stop="confirmDelete(todo.id)">删除</el-button>
                </div>
              </div>

              <!-- 已经完成部分折叠 -->
              <div class="completed-section" v-if="completedTodos.length && showCompletedSection">
                <div class="completed-header" @click="showCompletedFold = !showCompletedFold">
                  <el-icon>
                    <component :is="showCompletedFold ? 'ArrowDown' : 'ArrowRight'" />
                  </el-icon>
                  <span>已完成（{{ completedTodos.length }}）</span>
                </div>

                <transition name="fade">
                  <div v-show="showCompletedFold" class="completed-list">
                    <div class="todo-item completed" v-for="(todo, index) in completedTodos" :key="todo.id" :class="{
                      selected: selectedTask && selectedTask.id === todo.id,
                      dragging: dragIndex === index,
                    }" @click="selectTask(todo)" @contextmenu.prevent="openContextMenu($event, todo)" draggable="true"
                      @dragstart="onDragStart(index)" @dragover.prevent @drop="onDrop(index)" @dragend="onDragEnd">
                      <!-- 左侧复选 -->
                      <div class="left">
                        <el-checkbox v-model="todo.completed" />
                      </div>

                      <!-- 内容 -->
                      <div class="content">
                        <div class="title">
                          <span class="priority" :class="todo.priority">
                            <el-tag effect="light" type="danger" size="large">{{
                              todo.priority.toUpperCase()
                            }}</el-tag>
                          </span>
                          {{ todo.title }}
                        </div>

                        <div class="meta">
                          <el-tag v-for="tag in todo.tags" :key="tag" size="small">{{
                            tag
                          }}</el-tag>
                          <span class="deadline" :class="{ expired: isExpired(todo.deadline) }">
                            {{ todo.deadline ? '截止：' + formatDate(todo.deadline) : '' }}
                          </span>
                          <el-text type="success">{{ todo.project }}</el-text>
                        </div>
                      </div>

                      <!-- 子任务进度条 -->
                      <div class="subtask-progress" v-if="todo.subtasks && todo.subtasks.length">
                        <el-progress :percentage="calcSubtaskProgress(todo)" :stroke-width="6" :show-text="false" />
                        <span class="count">
                          {{ completedSubtasks(todo) }} / {{ todo.subtasks.length }}
                        </span>
                      </div>

                      <!-- 操作按钮 -->
                      <div class="actions">
                        <el-button text size="small" @click.stop="editTask(todo)">编辑</el-button>
                        <el-button text size="small" type="danger" @click.stop="confirmDelete(todo.id)">删除</el-button>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </el-scrollbar>
          </div>
        </main>

        <!-- 三、侧边栏任务详情看板 -->
        <aside class="detail">
          <!-- 未选中 -->
          <div v-if="!selectedTask" class="detail-empty">
            <div class="placeholder">
              <el-icon size="32">
                <Document />
              </el-icon>
              <h3>任务详情</h3>
              <p>点击中间列表中的任务</p>
              <ul>
                <li>查看描述、标签、时间</li>
                <li>管理子任务</li>
                <li>快速编辑</li>
              </ul>
            </div>
          </div>

          <!-- 已选中 -->
          <div v-else class="detail-content">
            <!-- 标题区 -->
            <div class="detail-header">
              <el-icon>
                <DocumentChecked />
              </el-icon>

              <!-- 显示模式 -->
              <h3 v-if="!isEditingTitle" @dblclick="startEditTitle" class="editable-title">
                {{ selectedTask.title }}
              </h3>

              <!-- 编辑模式 -->
              <el-input v-else v-model="editingTitle" size="small" autofocus @blur="cancelEditTitle"
                @keydown.enter.prevent="confirmEditTitle" @keydown.esc.prevent="cancelEditTitle" />
            </div>

            <!-- 描述 -->
            <div class="detail-section">
              <div class="section-title">
                <el-icon>
                  <Edit />
                </el-icon>
                <span>描述</span>
              </div>

              <p v-if="!isEditingDesc" class="description editable-desc" @dblclick="startEditDesc">
                {{ selectedTask.description || '暂无描述' }}
              </p>
              <!-- 编辑模式 -->
              <el-input v-else v-model="editingDesc" type="textarea" :rows="4" autofocus resize="none"
                placeholder="输入任务描述…" @blur="cancelEditDesc" @keydown.enter.exact.prevent
                @keydown.enter.meta.prevent="confirmEditDesc" @keydown.enter.ctrl.prevent="confirmEditDesc"
                @keydown.esc.prevent="cancelEditDesc" />
            </div>

            <!-- 元信息 -->
            <div class="detail-section meta">
              <div class="meta-item">
                <el-icon>
                  <Calendar />
                </el-icon>
                <span>
                  {{ selectedTask.deadline ? formatDate(selectedTask.deadline) : '未设置截止时间' }}
                </span>
              </div>

              <div class="meta-item" v-if="selectedTask.tags && selectedTask.tags.length">
                <el-icon>
                  <CollectionTag />
                </el-icon>
                <div class="tags">
                  <el-tag v-for="tag in selectedTask.tags" :key="tag" size="small" effect="plain">
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- 子任务 -->
            <el-scrollbar height="100%">
              <div class="detail-section subtasks">
                <div class="section-title">
                  <div>
                    <el-icon>
                      <List />
                    </el-icon>
                    <span>子任务</span>
                  </div>
                  <el-button-group>
                    <el-button type="primary" color="#626aef" size="small" @click="openSubtaskDialog()">
                      添加明细<el-icon class="el-icon--right">
                        <Plus />
                      </el-icon>
                    </el-button>
                    <el-button type="primary" color="#1fab89" size="small" @click="copyTaskList('completed')">
                      <el-icon>
                        <CopyDocument />
                      </el-icon>
                      复制已完成
                    </el-button>
                    <el-button class=".copy_task_btn" type="primary" color="#155263" size="small" style="color: white;"
                      @click="copyTaskList('all')">
                      <el-icon>
                        <DocumentCopy />
                      </el-icon>
                      复制全部
                    </el-button>
                  </el-button-group>
                </div>

                <ul class="subtask-ul" v-if="selectedTask.subtasks && selectedTask.subtasks.length">
                  <li v-for="sub in selectedTask.subtasks" :key="sub.id" class="subtask-item"
                    @dblclick="openSubtaskDialog(sub)">
                    <el-checkbox v-model="sub.completed">
                      {{ sub.title || '未命名子任务' }}
                      <el-tag style="margin: 0px 5px 0px 5px" v-for="value in sub.assignees" :key="value"
                        type="primary">
                        {{ value }}
                      </el-tag>
                      <el-button-group>
                        <el-button size="small" type="primary" plain class="action-btn"
                          @click="uploadDialogVisible = true">
                          <el-icon>
                            <Paperclip />
                          </el-icon>
                          上传附件
                        </el-button>
                        <el-popconfirm title="确定要删除这个子任务吗？" confirm-button-text="删除" cancel-button-text="取消"
                          @confirm="removeSubtask(sub.id)">
                          <template #reference>
                            <el-button size="small" type="danger" plain class="action-btn">
                              <el-icon>
                                <Delete />
                              </el-icon>
                              删除
                            </el-button>
                          </template>
                        </el-popconfirm>
                        <el-button size="small" color="#626aef" plain>
                          <el-icon>
                            <Notebook />
                          </el-icon>
                          查看附件
                        </el-button>
                      </el-button-group>
                    </el-checkbox>
                  </li>
                </ul>
                <el-empty v-else description="暂无子任务" :image-size="60" />
              </div>
            </el-scrollbar>
          </div>
        </aside>
      </div>

      <!-- 四、Footer页脚 -->
      <LayoutFooter></LayoutFooter>
    </div>

    <!-- 3.其他：引入各类Dialog -->

    <!-- 创建任务对话框 -->
    <CreateTaskDialog v-model:visible="dialogVisible" @create="saveTask" :task="editingTask" :tagOptions="tagOptions"
      :projectOptions="projectOptions" @update:tagOptions="handleTitleUpdate" :priorityList="priorityList"
      @update:projectOptions="handleAddProject" :allUsers="allUsers" />

    <!-- 创建右键菜单 -->
    <TodoContextMenu :visible="contextMenu.visible" :x="contextMenu.x" :y="contextMenu.y"
      @edit="editTask(contextMenu.task)" @delete="confirmDelete(contextMenu.task.id)" @copy="copyTask"
      @close="contextMenu.visible = false" @create="createTask" />

    <!-- 创建子任务对话框  -->
    <SubtaskDialog v-model="subtaskDialogVisible" :subtask="editingSubtask" @save="saveSubtask" />

    <!-- 创建标签对话框 -->
    <CreateTagDialog v-model="dialogTagVisible" @add-tag="handleAddTag"> </CreateTagDialog>

    <!-- 创建项目对话框 -->
    <CreateProjectDialog v-model="dialogProjectVisible" @add-project="handleAddProject"
      :existingProjects="projectOptions">
    </CreateProjectDialog>

    <!-- 创建优先级对话框 -->
    <PriorityEditDialog v-model:visible="proiorityDialogVisible" :priorityData="editingPriority" :mode="dialogMode"
      @save="handleSavePriority" />

    <!--创建附件上传弹窗  -->
    <UploadFileDialog v-model="uploadDialogVisible" :visible="uploadDialogVisible" @success="handleUploadSuccess"
      @cancel="handleUploadCancel">
    </UploadFileDialog>

    <!-- 用户信息弹窗 -->
    <UserDialog v-model:visible="userDialogVisible" @save="handleSaveUser" />
    <!-- 打印任务弹窗 -->
    <PrintTaskDialog v-model:visible="showPrintDialog" :data="todos" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, reactive } from 'vue'
import CreateTaskDialog from './components/CreateTaskDialog.vue'
import TodoContextMenu from '@/components/TodoContextMenu.vue'
import SubtaskDialog from './components/SubtaskDialog.vue'
import CreateTagDialog from './components/CreateTagDialog.vue'
import CreateProjectDialog from './components/CreateProjectDialog.vue'
import { Delete, Edit, Setting, Lock } from '@element-plus/icons-vue'
import LayoutFooter from './LayoutFooter.vue'
import {
  toggleFullScreen,
  isFullscreen as checkFullscreen,
  onFullscreenChange,
} from '@/utils/fullscreen'
import PriorityEditDialog from './components/PriorityEditDialog.vue'
import { getTaskStatsByTime } from '@/utils/taskUtils'
import UploadFileDialog from './components/UploadFileDialog.vue'
import UserDialog from './components/UserDialog.vue'
import PrintTaskDialog from './components/PrintTaskDialog.vue'
import ExcelExport from './components/ExcelExport.vue'
import { copyToClipboard } from '@/utils/copyToClipboard.js'
import AiSelectorPopover from './components/AiSelectorPopover.vue';

// import { useRouter } from 'vue-router'

/**
 * 挂载程序接口 Add By xuzhenyu 2026-02-12
 */
onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 3600000) // 1小时 = 3600000毫秒
})

/**
 * 卸载程序接口 Add By xuzhenyu 2026-02-12
 */
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  unsubscribe() // 清理监听
})

// 控制 Dialog 显示
const dialogVisible = ref(false)

// 编辑中的任务（null表示新建）
const editingTask = ref(null)

// 菜单控制器
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  task: null,
})

// 点击按钮显示弹窗
function openDialog() {
  editingTask.value = null
  dialogVisible.value = true
}
// 搜索
const searchText = ref('')

// Todo List
const todos = ref(JSON.parse(localStorage.getItem('todo_list') || '[]'))

const isFullScreen = ref(checkFullscreen())

// 从 localStorage 加载
const STORAGE_KEY = 'todo_list'
const loadTodos = () => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    todos.value = JSON.parse(raw)
  }
}

loadTodos()

// 保存到 localStorage
watch(
  todos,
  (newVal) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
  },
  { deep: true },
)
// 编辑任务（这里仅示例 alert）
function editTask(todo) {
  // 深拷贝，避免直接修改原数据
  editingTask.value = { ...todo }
  dialogVisible.value = true
}
// 保存任务（创建或编辑共用）
function saveTask(task) {
  if (task.id) {
    // 编辑：找到原任务更新
    const index = todos.value.findIndex((t) => t.id === task.id)
    if (index !== -1) todos.value[index] = task
  } else {
    // 新建
    task.id = Date.now()
    task.completed = false
    const firstCompletedIndex = todos.value.findIndex((t) => t.completed)
    if (firstCompletedIndex === -1) {
      todos.value.push(task)
    } else {
      todos.value.splice(firstCompletedIndex, 0, task)
    }
  }
  localStorage.setItem('todo_list', JSON.stringify(todos.value))
}
// 删除任务前确认
function confirmDelete(id) {
  ElMessageBox.confirm('确认删除此任务吗？', '删除任务', {
    type: 'warning',
  })
    .then(() => {
      todos.value = todos.value.filter((t) => t.id !== id)
      localStorage.setItem('todo_list', JSON.stringify(todos.value))

      ElMessage.success('删除成功')
    })
    .catch(() => { })
}
// 选中全部一键完成或一键取消
const allSelected = ref(false)
// 在顶部声明处理状态
const isProcessing = ref(false)
// 优化后的 toggleAll 方法
function toggleAll(val) {
  try {
    // 添加 loading 状态防止重复点击
    if (isProcessing.value) return

    // 优化消息文案，根据 val 值显示不同提示
    const actionText = val ? '完成' : '取消完成'

    ElMessageBox.confirm(`确定一键${actionText}吗？`, '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
      // 添加关闭前回调，可以在这里处理额外逻辑
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          // 可以在这里添加确认时的额外逻辑
          done()
        } else {
          done()
        }
      },
    })

    // 执行一键操作
    todos.value.forEach((t) => {
      t.completed = val
    })

    // 更新选中状态
    allSelected.value = val

    // 优化成功消息
    ElMessage({
      type: 'success',
      message: val ? '全部任务已完成' : '已取消全部任务的完成状态',
      duration: 2000,
    })
  } catch (error) {
    // 只有取消操作时才显示取消消息
    if (error === 'cancel') {
      ElMessage({
        type: 'info',
        message: '操作已取消',
        duration: 1500,
      })
    } else {
      // 其他错误处理
      console.error('操作失败:', error)
      ElMessage({
        type: 'error',
        message: '操作失败，请重试',
        duration: 2000,
      })
    }
  }
}
// ==各类搜索功能;大搜索 一键过滤 按日期分组==
// 是否显示已完成任务

// all | active | completed
const completionFilter = ref('active')
const showCompletedSection = ref(true)
// 是否启用按日期分组
const groupByDate = ref(false)

const showCompletedFold = ref(false)

const filteredTodos = computed(() => {
  let list = todos.value.slice()

  // 搜索过滤
  if (searchText.value) {
    list = list.filter((t) => t.title.toLowerCase().includes(searchText.value.toLowerCase()))
  }

  // 完成状态过滤
  if (completionFilter.value === 'active') {
    list = list.filter((t) => !t.completed)
  } else if (completionFilter.value === 'completed') {
    list = list.filter((t) => t.completed)
  }

  // 按日期分组（可选，示例：排序）
  if (groupByDate.value) {
    list.sort((a, b) => {
      const da = a.deadline ? new Date(a.deadline).getTime() : 0
      const db = b.deadline ? new Date(b.deadline).getTime() : 0
      return da - db
    })
  }
  return list
})

const baseFilteredTodos = computed(() => {
  let list = [...todos.value]

  // 搜索
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    list = list.filter((t) => t.title.toLowerCase().includes(keyword))
  }

  return list
})

//
const activeTodos = computed(() => {
  // 浅拷贝
  let list = todos.value.slice()

  // 搜索过滤
  if (searchText.value) {
    list = list.filter((t) => t.title.toLowerCase().includes(searchText.value.toLowerCase()))
  }

  // 根据 completionFilter 过滤
  if (completionFilter.value === 'active') {
    list = list.filter((t) => !t.completed)
  } else if (completionFilter.value === 'completed') {
    list = list.filter((t) => t.completed)
  }

  // 按日期分组排序（可选）
  if (groupByDate.value) {
    list.sort((a, b) => {
      const da = a.deadline ? new Date(a.deadline).getTime() : 0
      const db = b.deadline ? new Date(b.deadline).getTime() : 0
      return da - db
    })
  }
  return list
})

const completedTodos = computed(() => {
  return baseFilteredTodos.value.filter((t) => t.completed)
})

function setCompletionFilter(filter) {
  completionFilter.value = filter
  showCompletedSection.value = false // 点击按钮隐藏折叠区
}

function toggleGroupByDate() {
  groupByDate.value = !groupByDate.value
  showCompletedSection.value = false // 点击按钮隐藏折叠区
}
function restartFilter() {
  completionFilter.value = 'active'
  showCompletedSection.value = true
  showCompletedFold.value = true
}

// 判断截止时间是否过期
function isExpired(deadline) {
  if (!deadline) return false
  return new Date(deadline).getTime() < Date.now()
}
//格式化日期
function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
// 当前选中任务
const selectedTask = ref(null)

// 点击任务选中
function selectTask(todo) {
  selectedTask.value = todo
}
// 是否正在编辑标题
const isEditingTitle = ref(false)
// 编辑中的标题
const editingTitle = ref('')

// 开始编辑
function startEditTitle() {
  if (!selectedTask.value) return
  editingTitle.value = selectedTask.value.title
  isEditingTitle.value = true
}

// 确认修改
function confirmEditTitle() {
  if (!editingTitle.value.trim()) return
  selectedTask.value.title = editingTitle.value.trim()
  isEditingTitle.value = false
}

// 取消修改
function cancelEditTitle() {
  isEditingTitle.value = false
}

// ===== 描述编辑 =====
const isEditingDesc = ref(false)
const editingDesc = ref('')

// 开始编辑描述
function startEditDesc() {
  if (!selectedTask.value) return
  editingDesc.value = selectedTask.value.description || ''
  isEditingDesc.value = true
}

// 确认编辑
function confirmEditDesc() {
  selectedTask.value.description = editingDesc.value.trim()
  isEditingDesc.value = false
}

// 取消编辑
function cancelEditDesc() {
  isEditingDesc.value = false
}
// ==菜单打开 Created By Zane Xu 2025-12-19==
function openContextMenu(e, todo) {
  contextMenu.value = {
    visible: true,
    x: e.clientX,
    y: e.clientY,
    task: todo,
  }
}
// 复制功能
function copyTask() {
  const copied = JSON.parse(JSON.stringify(contextMenu.value.task))
  copied.id = Date.now()
  copied.title = copied.title + '（副本）'
  todos.value.push(copied)
}
// 新增
function createTask() {
  // 清空编辑状态
  editingTask.value = null

  // 打开弹窗
  dialogVisible.value = true
}

/** 1. 拖拽索引 Created by Zane Xu 2025-12-19  */
const dragIndex = ref(null)
function onDragStart(index) {
  dragIndex.value = index
}
//放下
function onDrop(dropIndex) {
  if (dragIndex.value === null) return

  const sourceIndex = dragIndex.value

  // 找到真实 todos 中的 index
  const draggedTodo = filteredTodos.value[sourceIndex]
  const targetTodo = filteredTodos.value[dropIndex]

  const from = todos.value.findIndex((t) => t.id === draggedTodo.id)
  const to = todos.value.findIndex((t) => t.id === targetTodo.id)

  if (from === -1 || to === -1) return

  const moved = todos.value.splice(from, 1)[0]
  todos.value.splice(to, 0, moved)

  dragIndex.value = null
}
//结束
function onDragEnd() {
  dragIndex.value = null
}

watch(
  todos,
  (newVal) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
  },
  { deep: true },
)

function completedSubtasks(todo) {
  if (!todo.subtasks) return 0
  return todo.subtasks.filter((s) => s.completed).length
}

function calcSubtaskProgress(todo) {
  if (!todo.subtasks || !todo.subtasks.length) return 0
  return Math.round((completedSubtasks(todo) / todo.subtasks.length) * 100)
}

function exportJson() {
  const data = {
    app: 'Todo Pro',
    version: currentVersion.value,
    exportedAt: Date.now(),
    total: todos.value.length,
    todos: todos.value,
  }

  // 自动生成下载文件
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `todo-backup-v${currentVersion.value}-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success(`数据已导出（v${currentVersion.value}）`)

  // 导出后版本号 +1 并存储 localStorage
  currentVersion.value += 1
  localStorage.setItem(STORAGE_VERSION_KEY, currentVersion.value)
}

const fileInput = ref(null)

function triggerImport() {
  ElMessageBox.confirm('导入将【完全覆盖】当前所有任务，且不可撤销，是否继续？', '确认导入', {
    type: 'warning',
    confirmButtonText: '继续导入',
    cancelButtonText: '取消',
  })
    .then(() => {
      fileInput.value.click()
    })
    .catch(() => { })
}

function importJson(e) {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()

  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result)

      if (!data.todos || !Array.isArray(data.todos)) {
        throw new Error('JSON 格式不正确')
      }

      // 版本校验
      if (data.version > currentVersion.value) {
        ElMessage.error(
          `导入失败：该备份来自更高版本（v${currentVersion.value}），当前版本 v${data.version.value} 暂不支持导入`,
        )
        return
      }

      todos.value = data.todos
      localStorage.setItem('todo_list', JSON.stringify(data.todos))

      ElMessage.success(`导入成功，共 ${data.todos.length} 条任务`)
    } catch (err) {
      ElMessage.error('导入失败，请选择正确的 Todo JSON 文件', err)
    } finally {
      e.target.value = ''
    }
  }

  reader.readAsText(file)
}

// 读取 localStorage 中上次版本号，否则从 1 开始
const STORAGE_VERSION_KEY = 'todo_version'
const currentVersion = ref(Number(localStorage.getItem(STORAGE_VERSION_KEY)) || 1)

// ==刷新列表==
function refreshTodos() {
  try {
    const raw = localStorage.getItem('todo_list')
    if (raw) {
      todos.value = JSON.parse(raw)

      ElMessage.success('任务列表已刷新')
    } else {
      todos.value = []

      ElMessage.info('暂无任务，已清空列表')
    }
  } catch (err) {
    console.error(err)

    ElMessage.error('刷新失败，请检查数据格式')
  }
}

// ==单个任务完成后排序==
function onCompletedChange(todo) {
  const index = todos.value.findIndex((t) => t.id === todo.id)
  if (index === -1) return

  // 先移除
  const [item] = todos.value.splice(index, 1)

  if (item.completed) {
    // ✅ 完成 → 放到最后
    todos.value.push(item)
  } else {
    // ❌ 取消完成 → 放回未完成区末尾
    const firstCompletedIndex = todos.value.findIndex((t) => t.completed)
    if (firstCompletedIndex === -1) {
      todos.value.push(item)
    } else {
      todos.value.splice(firstCompletedIndex, 0, item)
    }
  }
}

function removeSubtask(subId) {
  selectedTask.value.subtasks = selectedTask.value.subtasks.filter((s) => s.id !== subId)
}

const subtaskDialogVisible = ref(false)
const editingSubtask = ref(null)

function openSubtaskDialog(subtask = null) {
  editingSubtask.value = subtask
    ? { ...subtask } // 编辑：拷贝
    : { title: '' } // 新建

  subtaskDialogVisible.value = true
}

// 保存子任务（新建或编辑）
function saveSubtask(title) {
  if (!title.trim()) return

  // 新建
  if (!editingSubtask.value.id) {
    if (!selectedTask.value.subtasks) {
      selectedTask.value.subtasks = []
    }

    selectedTask.value.subtasks.push({
      id: Date.now(),
      title,
      completed: false,
    })
  }
  // 编辑
  else {
    const target = selectedTask.value.subtasks.find((s) => s.id === editingSubtask.value.id)
    if (target) target.title = title
  }

  subtaskDialogVisible.value = false
}

/**
 * 1.时间日期展示以及复制功能使用 Added By Zane Xu 2026-02-02
 */
const currentTime = ref(new Date())
// 格式化时间的计算属性
const formattedTime = computed(() => {
  const date = currentTime.value
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekday = weekdays[date.getDay()]

  return `${year}年${month}月${day}日 ${weekday}`
})
let timer = null

// 复制时间日期到剪贴板
const copyTimeToClipboard = (value) => {
  copyToClipboard(value)
}

/**
 * 1，标签窗口的增加 Added By Zane Xu 2026-02-02
 */
const tagOptions = ref(
  JSON.parse(localStorage.getItem('tagOptionsList')) || [
    { name: '祈福医院信息化建设', color: '#409EFF', fontColor: '#ffffff' },
    { name: '孙逸仙南北院区建设', color: '#67C23A', fontColor: '#ffffff' },
    { name: '其他', color: '#909399', fontColor: '#ffffff' },
  ],
)
const dialogTagVisible = ref(false)
const loadTagsOptions = () => {
  const raw = localStorage.getItem('tagOptionsList')
  if (raw) {
    tagOptions.value = JSON.parse(raw)
  }
}
watch(
  tagOptions,
  (newVal) => {
    localStorage.setItem('tagOptionsList', JSON.stringify(newVal))
  },
  { deep: true },
)

const openAddTagDialog = () => {
  dialogTagVisible.value = true
}
// 处理添加标签
const handleAddTag = (tagData) => {
  if (tagData) {
    tagOptions.value.push(tagData)
    ElMessage.success(`标签 "${tagData.name}" 添加成功`)
  }
}

/**
 * 删除标签
 * @param {number} index - 标签在列表中的索引位置
 */
const removeTag = (index) => {
  const tagName = tagOptions.value[index].name

  ElMessageBox.confirm(`确定要删除标签 "${tagName}" 吗？删除后将无法恢复。`, '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
    confirmButtonClass: 'el-button--danger',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        // 这里可以添加删除前的验证逻辑
        setTimeout(() => {
          done()
          instance.confirmButtonLoading = false
        }, 300)
      } else {
        done()
      }
    },
  })
    .then(() => {
      // 执行删除操作
      tagOptions.value.splice(index, 1)

      // 显示成功提示
      ElMessage({
        message: `标签 "${tagName}" 已成功删除`,
        type: 'success',
        duration: 2000,
        offset: 20,
      })

      // 可选：触发标签更新事件
      // emit('tag-updated', tagOptions.value)
    })
    .catch(() => {
      // 用户取消删除
      ElMessage({
        message: '已取消删除操作',
        type: 'info',
        duration: 1500,
        offset: 20,
      })
    })
}
/**
 * 1.标签窗口的增加 Added By Zane Xu 2026-02-02
 */
function handleTitleUpdate(newTitle) {
  // console.log('收到新标题:', newTitle)
  tagOptions.value.push(newTitle)
}
loadTagsOptions()

/**
 * 1.项目窗口的增加 Added By Zane Xu 2026-02-04
 *
 */
const dialogProjectVisible = ref(false) //
const projectOptions = ref(
  JSON.parse(localStorage.getItem('porjectOptionsList')) || ['学习', '工作', '生活'],
)
const loadProjectOptions = () => {
  const raw = localStorage.getItem('porjectOptionsList')
  if (raw) {
    projectOptions.value = JSON.parse(raw)
  }
}

watch(
  projectOptions,
  (newVal) => {
    localStorage.setItem('porjectOptionsList', JSON.stringify(newVal))
  },
  { deep: true },
)
const openAddProjectDialog = () => {
  dialogProjectVisible.value = true
}
// 添加项目文件夹
const handleAddProject = (projectName) => {
  if (projectName) {
    projectOptions.value.push(projectName)
    ElMessage.success(`标签 "${projectName}" 添加成功`)
  }
}
loadProjectOptions()
/**
 * 全屏切换功能 Added By Zane Xu 2026-03-16
 */

// 响应式全屏状态
const isFullScreenActive = ref(false)

// 切换全屏
const handleToggleFullScreen = () => {
  toggleFullScreen() // 默认全屏整个文档
}

// 监听全屏变化
const unsubscribe = onFullscreenChange((fullscreen) => {
  isFullScreenActive.value = fullscreen
  ElMessage.success('全屏状态:' + (fullscreen ? '已全屏' : '已退出'))
})

//
const updateProject = (newProject) => {
  projectOptions.value = newProject
}

/**
 * 计算左侧项目的具体数量 Added By Zane Xu 2026-03-21
 * @param {string} projectName - 项目名称
 */
const getProjectCount = (projectName) => {
  return filteredTodos.value.filter((todo) => todo.project === projectName).length
}

/**
 * 删除右侧项目方法 Added By Zane Xu 2026-03-21
 */
const removeProject = (projectOption) => {
  ElMessageBox.confirm(`确定要删除项目 "${projectOption}" 吗？删除后将无法恢复。`, '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
    confirmButtonClass: 'el-button--danger',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true // 显示加载状态
        const updatedProjects = projectOptions.value.filter((item) => item !== projectOption) // 创建新的数组，将 projectOption 删除
        localStorage.setItem('porjectOptionsList', JSON.stringify(updatedProjects)) // 更新本地存储
        projectOptions.value = updatedProjects // 更新 projectOptions

        setTimeout(() => {
          instance.confirmButtonLoading = false
          ElMessage({
            type: 'success',
            message: `"${projectOption}" 已删除`,
          })
          done()
        }, 300)
      } else {
        done()
      }
    },
  })
}

/**
 * 优先级功能 Added By Zane Xu 2026-03-21
 */

// 1.优先级选项配置,如果有本地存储则加载，否则使用默认值
const priorityList = ref(
  JSON.parse(localStorage.getItem('priorityList')) || [
    { value: 'P1', label: 'P1', desc: '紧急', fixed: true },
    { value: 'P2', label: 'P2', desc: '高', fixed: true },
    { value: 'P3', label: 'P3', desc: '中', fixed: true },
    { value: 'P4', label: 'P4', desc: '低', fixed: true },
    { value: 'P5', label: 'P5', desc: '自定义1', fixed: false },
    { value: 'P6', label: 'P6', desc: '自定义2', fixed: false },
  ],
)

// 2.当前优先级
const currentPriority = ref('P2')
// 3.标签类型映射
const getTagType = (priorityValue) => {
  const typeMap = {
    P1: 'danger', // 红色
    P2: 'warning', // 黄色/橙色
    P3: 'success', // 绿色
    P4: 'info', // 蓝色
    P5: 'primary', // 使用 primary
    P6: 'primary', // 使用 primary
  }
  return typeMap[priorityValue] || 'primary' // 默认返回 primary
}

// 4.对话框控制
const proiorityDialogVisible = ref(false)

//
const dialogMode = ref('add') // 'add' 或 'edit'

// 6.编辑中的优先级数据
const editingPriority = reactive({
  label: '',
  value: '',
  desc: '',
})

// 7.处理删除
const handleDelete = (priority) => {
  const index = priorityList.value.findIndex((p) => p.value === priority.value)
  if (index !== -1) {
    // 如果删除的是当前选中的，清空选择
    if (currentPriority.value === priority.value) {
      currentPriority.value = ''
    }
    priorityList.value.splice(index, 1)
    ElMessage.success('删除成功')
  }
}

// 8.处理编辑
const proiorityHandleEdit = (priority) => {
  dialogMode.value = 'edit'
  Object.assign(editingPriority, { ...priority }) // 将要编辑的数据赋值给 editingPriority
  proiorityDialogVisible.value = true
}

// 9.保存优先级（添加或编辑）
const handleSavePriority = (priorityData) => {
  // debugger
  if (dialogMode.value === 'add') {
    // 添加新优先级
    const newPriority = {
      ...priorityData,
      fixed: false,
    }
    priorityList.value.push(newPriority)
    ElMessage.success('添加成功')
  } else {
    // 编辑现有优先级
    const index = priorityList.value.findIndex((p) => p.value === editingPriority.value)
    if (index !== -1) {
      // 保持 fixed 状态
      priorityList.value[index] = {
        ...priorityData,
        fixed: priorityList.value[index].fixed,
      }
      ElMessage.success('更新成功')
    }
  }
}

// 10.处理添加
const PriorityHandleAdd = () => {
  dialogMode.value = 'add'
  // 清空编辑数据
  Object.assign(editingPriority, {
    label: '',
    value: '',
    desc: '',
  })
  proiorityDialogVisible.value = true
}

// 11. watch 优先级列表变化，保存到 localStorage
watch(
  priorityList,
  (newVal) => {
    localStorage.setItem('priorityList', JSON.stringify(newVal))
  },
  { deep: true },
)

/**
 * 截止日期的任务统计功能 Added By Zane Xu 2026-04-05
 */
// 使用公共函数计算统计
const timeStats = computed(() => {
  return getTaskStatsByTime(todos.value)
})

/**
 * 附件上传打开窗口方法 Added By Zane Xu 2026-04-14
 */
// 1. 上传窗口控制参数
const uploadDialogVisible = ref(false)
// 2. 打开上传窗口方法
const openUploadDialog = () => {
  uploadDialogVisible.value = true
}

// 上传成功回调
const handleUploadSuccess = (fileList) => {
  console.log('上传成功，文件列表：', fileList)
  // 这里可以处理上传成功后的逻辑，比如更新页面数据
  uploadDialogVisible.value = false
}

// 取消上传回调
const handleUploadCancel = () => {
  console.log('用户取消了上传')
  uploadDialogVisible.value = false
}

/**
 * 下拉菜单集成功能dash Added By Zane Xu 2026-04-15
 */
// 下拉菜单命令处理
const handleDropdownCommand = (command) => {
  switch (command) {
    case 'config':
      console.log('打开配置页面')
      uploadDialogVisible.value = true
      break
    case 'fullscreen':
      handleToggleFullScreen()
      break
    case 'statistics':
      // 跳转到统计页面
      // console.log('跳转到统计页面')
      router.push('/statistics')
      ElMessage.info('跳转到统计页面')
      break
    case 'settings':
      // 打开设置弹窗
      console.log('打开设置')
      ElMessage.info('打开设置')
      break
    case 'help':
      // 打开帮助文档
      window.open('/help', '_blank')
      break
    case 'feedback':
      // 打开意见反馈
      console.log('意见反馈')
      ElMessage.info('打开意见反馈')
      break
    case 'about':
      // 打开关于对话框
      console.log('关于')
      ElMessage.info('打开关于对话框')
      break
  }
}

/**
 * 负责人维护功能 Added By Zane Xu 2026-04-15
 */
// 1. 用户列表
const allUsers = ref(
  JSON.parse(localStorage.getItem('userList')) || [
    {
      id: 1,
      name: '徐振宇',
      department: '技术部',
      avatar:
        'https://iconfont.alicdn.com/p/illus/preview_image/pMhdd5wW6xfB/fcbc3cdc-b4b1-4dd2-8607-bebdc3d2e835.png',
    },
    {
      id: 2,
      name: 'NIS',
      department: '产品部',
      avatar:
        'https://iconfont.alicdn.com/p/user/EKah83c1bmwx/f51d0eec-4e4d-42ac-9a03-b5ca4050ba53.jpeg',
    },
    {
      id: 3,
      name: 'HIS',
      department: '设计部',
      avatar:
        'https://iconfont.alicdn.com/p/illus/preview_image/pMhdd5wW6xfB/49911626-1af4-4dc7-9004-b8d65cfa6018.png',
    },
    {
      id: 4,
      name: 'LIS',
      department: '市场部',
      avatar:
        'https://iconfont.alicdn.com/p/illus/preview_image/pMhdd5wW6xfB/2616b2cb-0b98-408f-a0f8-7b76a8e67f9f.png',
    },
    {
      id: 5,
      name: '护理管理',
      department: '运营部',
      avatar:
        'https://iconfont.alicdn.com/p/illus/preview_image/pMhdd5wW6xfB/bdf4dc61-b662-4f4d-bd8d-c58b8249eb4e.png',
    },
  ],
)

// 2. 弹窗显示变量
const userDialogVisible = ref(false)

//3. 添加用户弹窗
const addUserDialog = () => {
  userDialogVisible.value = true
}

//4. 添加用户方法
const handleSaveUser = (userData) => {
  allUsers.value.push(userData)
}

// 5.监听用户列表
watch(
  allUsers,
  (newVal) => {
    localStorage.setItem('userList', JSON.stringify(newVal))
  },
  { deep: true },
)

/**
 * 打印功能 Added By Zane Xu 2026-04-16
 */

// 控制打印对话框显示
const showPrintDialog = ref(false)

// 打印按钮点击事件
const printData = () => {
  showPrintDialog.value = true
}

/**
 * 复制子任务 Added By Zane Xu 2026-04-16
 */
const copyTaskList = (type) => {
  if (!selectedTask.value || !selectedTask.value.subtasks) return

  let textToCopy = ''
  const subtasks = selectedTask.value.subtasks

  switch (type) {
    case 'completed':
      // 只复制已完成的子任务
      const completed = subtasks.filter(s => s.completed)
      textToCopy = completed.map(s => s.title).join(';')
      break
    case 'all':
      // 复制所有子任务
      textToCopy = subtasks.map(s => `[${s.completed ? '✅' : 'x'}] ${s.title}`).join('\n')
      break
    default:
      textToCopy = subtasks.map(s => s.title).join('\n')
  }

  if (textToCopy) {
    copyToClipboard(textToCopy, "复制成功！", "复制失败！请手动复制")
  } else {
    ElMessage.warning('暂无内容可复制')
  }
}

/**
 * AI应用 Added By Zane Xu 2026-04-16
 */
// 选择AI时的回调
// 事件处理函数
const handleSelect = (app) => {
  console.log('选择应用:', app);
};

const handleConfirm = (app) => {
  console.log('确认跳转:', app);
};

const handleAddAI = (app) => {
  console.log('添加应用:', app);
  // 可以发送到后端保存
};

const handleEdit = (app) => {
  console.log('编辑应用:', app);
  // 可以发送到后端更新
};

const handleDeleteAI = (app) => {
  console.log('删除应用:', app);
  // 可以发送到后端删除
};

const handleFavorite = (app) => {
  console.log('收藏状态变化:', app);
  // 可以发送到后端更新收藏状态
};
</script>

<style lang="scss" scoped></style>
