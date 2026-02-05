<!--
@
-->
<template>
  <div class="todo-app">
    <!-- Header -->
    <header class="app-header">
      <div class="left">
        <h2 class="logo">Todo Pro</h2>
        <span class="current-view">所有任务</span>
        <el-tag size="small" type="warning">PC 管理版</el-tag>
        <el-tag @click="copyTimeToClipboard(formattedTime)"> {{ formattedTime }}</el-tag>
      </div>

      <div class="center">
        <el-input placeholder="搜索任务 / 标签 / 项目" v-model="searchText" clearable />
      </div>

      <div class="right">
        <el-button type="primary" @click="openDialog">新建任务</el-button>
        <el-button>新建项目</el-button>
        <el-button @click="exportJson">导出</el-button>
        <el-button @click="triggerImport">导入</el-button>
        <input ref="fileInput" type="file" accept="application/json" style="display: none" @change="importJson" />
        <el-button @click="refreshTodos">刷新</el-button>
        <span class="app-version">版本: v{{ currentVersion }}</span>
        <el-avatar size="small">U</el-avatar>
      </div>
    </header>

    <div class="app-container">
      <div class="app-body">
        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="section">
            <h4>📅 时间</h4>
            <ul>
              <li>收集箱 <span class="count">12</span></li>
              <li>今天 <span class="count">3</span></li>
              <li>明天</li>
              <li>本周</li>
              <li class="danger">已过期</li>
            </ul>
          </div>

          <div class="section">
            <h4>📁 项目 <el-button text size="small" icon="Plus" @click="openAddProjectDialog"
                type="primary">新增项目</el-button></h4>

            <ul>
              <li v-for="(project, index) in projectOptions" :key="index">{{ project }}</li>
            </ul>
          </div>

          <div class="section">
            <h4>🎈 标签
              <el-button icon="Plus" text size="small" type="primary" @click="openAddTagDialog">
                新建标签
              </el-button>
            </h4>
            <div class="tags">
              <el-tag v-for="(tag, index) in tagOptions" @close="removeTag(index)" closable :key="index" size="small"
                type="success">
                {{ tag }}
              </el-tag>
            </div>

          </div>
        </aside>

        <!-- Main -->
        <main class="main">
          <div class="main-toolbar">
            <div class="left">
              <el-checkbox v-model="allSelected" @change="toggleAll">全选</el-checkbox>
              <el-button size="small" type="success" @click="setCompletionFilter('completed')">
                只看完成
              </el-button>

              <el-button size="small" type="warning" @click="setCompletionFilter('active')">
                只看未完成
              </el-button>

              <el-button size="small" type="danger" @click="setCompletionFilter('all')">
                显示全部
              </el-button>

              <el-button size="small" type="primary" @click="toggleGroupByDate">
                {{ groupByDate ? '取消日期分组' : '按照日期分组排序' }}
              </el-button>

              <el-button size="small" type="danger" @click="restartFilter">
                恢复
              </el-button>
            </div>

            <div class="right">
              <el-button size="small">列表</el-button>
              <el-button size="small">看板</el-button>
              <el-button size="small">日历</el-button>
            </div>
          </div>

          <div class="todo-list">
            <!-- Todo Item -->
            <el-scrollbar height="100%">
              <!-- 未完成部分 -->
              <div class="todo-item" v-for="(todo, index) in activeTodos" :key="todo.id"
                :class="{ completed: todo.completed, selected: selectedTask && selectedTask.id === todo.id, dragging: dragIndex === index }"
                @click="selectTask(todo)" @contextmenu.prevent="openContextMenu($event, todo)" draggable="true"
                @dragstart="onDragStart(index)" @dragover.prevent @drop="onDrop(index)" @dragend="onDragEnd">
                <div class="left">
                  <el-checkbox v-model="todo.completed" @change="onCompletedChange(todo)" />
                </div>

                <div class="content">
                  <div class="title">
                    <span class="priority" :class="todo.priority">{{ todo.priority }}</span>
                    {{ todo.title }}
                  </div>

                  <div class="meta">
                    <el-tag v-for="tag in todo.tags" :key="tag" size="small">{{ tag }}</el-tag>
                    <span class="deadline" :class="{ expired: isExpired(todo.deadline) }">
                      {{ todo.deadline ? '截止：' + formatDate(todo.deadline) : '' }}
                    </span>
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
                    <div class="todo-item completed" v-for="(todo, index) in completedTodos" :key="todo.id"
                      :class="{ selected: selectedTask && selectedTask.id === todo.id, dragging: dragIndex === index }"
                      @click="selectTask(todo)" @contextmenu.prevent="openContextMenu($event, todo)" draggable="true"
                      @dragstart="onDragStart(index)" @dragover.prevent @drop="onDrop(index)" @dragend="onDragEnd">
                      <!-- 左侧复选 -->
                      <div class="left">
                        <el-checkbox v-model="todo.completed" />
                      </div>

                      <!-- 内容 -->
                      <div class="content">
                        <div class="title">
                          <span class="priority" :class="todo.priority">{{ todo.priority }}</span>
                          {{ todo.title }}
                        </div>

                        <div class="meta">
                          <el-tag v-for="tag in todo.tags" :key="tag" size="small">{{ tag }}</el-tag>
                          <span class="deadline" :class="{ expired: isExpired(todo.deadline) }">
                            {{ todo.deadline ? '截止：' + formatDate(todo.deadline) : '' }}
                          </span>
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

        <!-- 侧边栏任务详情看板 -->
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
                {{ selectedTask.description || "暂无描述" }}
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
                  {{ selectedTask.deadline ? formatDate(selectedTask.deadline) : "未设置截止时间" }}
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
                  <el-button type="primary" color="#626aef" size="small" @click="openSubtaskDialog()">
                    添加明细<el-icon class="el-icon--right">
                      <Plus />
                    </el-icon>
                  </el-button>
                </div>

                <ul class="subtask-ul" v-if="selectedTask.subtasks && selectedTask.subtasks.length">
                  <li v-for="sub in selectedTask.subtasks" :key="sub.id" class="subtask-item"
                    @dblclick="openSubtaskDialog(sub)">
                    <el-checkbox v-model="sub.completed">
                      {{ sub.title || "未命名子任务" }}
                      <el-button text type="danger" size="small" @click="removeSubtask(sub.id)">
                        <el-icon>
                          <Delete />
                        </el-icon>
                      </el-button>
                    </el-checkbox>

                  </li>
                </ul>
                <el-empty v-else description="暂无子任务" :image-size="60" />

              </div>
            </el-scrollbar>

          </div>
        </aside>
      </div>

      <!-- Footer页脚 -->
      <footer class="app-footer">
        <span>已完成 0 / 共 0</span>
        <div class="actions">
          <span class="tip">支持多选批量操作</span>
          <el-button text disabled>完成</el-button>
          <el-button text disabled type="danger">删除</el-button>
        </div>
      </footer>
    </div>

    <!-- 引入 Dialog -->
    <CreateTaskDialog v-model:visible="dialogVisible" @create="saveTask" :task="editingTask" />
    <TodoContextMenu :visible="contextMenu.visible" :x="contextMenu.x" :y="contextMenu.y"
      @edit="editTask(contextMenu.task)" @delete="confirmDelete(contextMenu.task.id)" @copy="copyTask"
      @close="contextMenu.visible = false" @create="createTask" />
    <SubtaskDialog v-model="subtaskDialogVisible" :subtask="editingSubtask" @save="saveSubtask" />
    <CreateTagDialog v-model="dialogTagVisible" @add-tag="handleAddTag"> </CreateTagDialog>
    <CreateProjectDialog v-model="dialogProjectVisible" @add-project="handleAddProject"></CreateProjectDialog>
  </div>
</template>


<script setup>

import { ref, computed, watch, reactive } from "vue";
import CreateTaskDialog from "./components/CreateTaskDialog.vue";
import TodoContextMenu from "@/components/TodoContextMenu.vue";
import SubtaskDialog from './components/SubtaskDialog.vue';
import CreateTagDialog from "./components/CreateTagDialog.vue";
import CreateProjectDialog from "./components/CreateProjectDialog.vue";
import {
  Document,
  DocumentChecked,
  Edit,
  Calendar,
  CollectionTag,
  List,
  Plus
} from "@element-plus/icons-vue";

//
const dragIndex = ref(null);
// 控制 Dialog 显示
const dialogVisible = ref(false);
// 编辑中的任务（null表示新建）
const editingTask = ref(null);
// 菜单控制器
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  task: null,
});

// 点击按钮显示弹窗
function openDialog() {
  editingTask.value = null;
  dialogVisible.value = true;
}
// 搜索
const searchText = ref("");

// Todo List
const todos = ref(JSON.parse(localStorage.getItem("todo_list") || "[]"));


// 从 localStorage 加载
const STORAGE_KEY = "todo_list";
const loadTodos = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    todos.value = JSON.parse(raw);
  }
};
loadTodos();

// 保存到 localStorage
watch(
  todos,
  (newVal) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
  },
  { deep: true }
);
// 编辑任务（这里仅示例 alert）
function editTask(todo) {
  // 深拷贝，避免直接修改原数据
  editingTask.value = { ...todo };
  dialogVisible.value = true;
}
// 保存任务（创建或编辑共用）
function saveTask(task) {
  if (task.id) {
    // 编辑：找到原任务更新
    const index = todos.value.findIndex(t => t.id === task.id);
    if (index !== -1) todos.value[index] = task;
  } else {
    // 新建
    task.id = Date.now();
    task.completed = false;
    const firstCompletedIndex = todos.value.findIndex(t => t.completed);
    if (firstCompletedIndex === -1) {
      todos.value.push(task);
    } else {
      todos.value.splice(firstCompletedIndex, 0, task);
    }
  }
  localStorage.setItem("todo_list", JSON.stringify(todos.value));
}
// 删除任务前确认
function confirmDelete(id) {

  ElMessageBox.confirm("确认删除此任务吗？", "删除任务", {
    type: "warning",
  })
    .then(() => {
      todos.value = todos.value.filter(t => t.id !== id);
      localStorage.setItem("todo_list", JSON.stringify(todos.value));

      ElMessage.success("删除成功");
    })
    .catch(() => { });
}
// 选中全部一键完成或一键取消
const allSelected = ref(false);
// 在顶部声明处理状态
const isProcessing = ref(false);
// 优化后的 toggleAll 方法
function toggleAll(val) {
  try {
    // 添加 loading 状态防止重复点击
    if (isProcessing.value) return;

    // 优化消息文案，根据 val 值显示不同提示
    const actionText = val ? '完成' : '取消完成';

    ElMessageBox.confirm(
      `确定一键${actionText}吗？`,
      '提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        // 添加关闭前回调，可以在这里处理额外逻辑
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            // 可以在这里添加确认时的额外逻辑
            done();
          } else {
            done();
          }
        }
      }
    );

    // 执行一键操作
    todos.value.forEach(t => {
      t.completed = val;
    });

    // 更新选中状态
    allSelected.value = val;

    // 优化成功消息
    ElMessage({
      type: 'success',
      message: val ? '全部任务已完成' : '已取消全部任务的完成状态',
      duration: 2000
    });

  } catch (error) {
    // 只有取消操作时才显示取消消息
    if (error === 'cancel') {
      ElMessage({
        type: 'info',
        message: '操作已取消',
        duration: 1500
      });
    } else {
      // 其他错误处理
      console.error('操作失败:', error);
      ElMessage({
        type: 'error',
        message: '操作失败，请重试',
        duration: 2000
      });
    }
  }
}
// ==各类搜索功能;大搜索 一键过滤 按日期分组==
// 是否显示已完成任务

// all | active | completed
const completionFilter = ref("active");
const showCompletedSection = ref(true)
// 是否启用按日期分组
const groupByDate = ref(false);

const showCompletedFold = ref(false);

const filteredTodos = computed(() => {
  let list = todos.value.slice();

  // 搜索过滤
  if (searchText.value) {
    list = list.filter(t => t.title.toLowerCase().includes(searchText.value.toLowerCase()));
  }

  // 完成状态过滤
  if (completionFilter.value === 'active') {
    list = list.filter(t => !t.completed);
  } else if (completionFilter.value === 'completed') {
    list = list.filter(t => t.completed);
  }

  // 按日期分组（可选，示例：排序）
  if (groupByDate.value) {
    list.sort((a, b) => {
      const da = a.deadline ? new Date(a.deadline).getTime() : 0;
      const db = b.deadline ? new Date(b.deadline).getTime() : 0;
      return da - db;
    });
  }
  return list;
});


const baseFilteredTodos = computed(() => {
  let list = [...todos.value];

  // 搜索
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase();
    list = list.filter(t =>
      t.title.toLowerCase().includes(keyword)
    );
  }

  return list;
});

const activeTodos = computed(() => {
  // 浅拷贝
  let list = todos.value.slice();

  // 搜索过滤
  if (searchText.value) {
    list = list.filter(t => t.title.toLowerCase().includes(searchText.value.toLowerCase()));
  }

  // 根据 completionFilter 过滤
  if (completionFilter.value === 'active') {
    list = list.filter(t => !t.completed);
  } else if (completionFilter.value === 'completed') {
    list = list.filter(t => t.completed);
  }

  // 按日期分组排序（可选）
  if (groupByDate.value) {
    list.sort((a, b) => {
      const da = a.deadline ? new Date(a.deadline).getTime() : 0;
      const db = b.deadline ? new Date(b.deadline).getTime() : 0;
      return da - db;
    });
  }




  return list;
});


const completedTodos = computed(() => {
  return baseFilteredTodos.value.filter(t => t.completed);
});

function setCompletionFilter(filter) {
  completionFilter.value = filter;
  showCompletedSection.value = false; // 点击按钮隐藏折叠区
}

function toggleGroupByDate() {
  groupByDate.value = !groupByDate.value;
  showCompletedSection.value = false; // 点击按钮隐藏折叠区
}
function restartFilter() {
  completionFilter.value = 'active'
  showCompletedSection.value = true;
  showCompletedFold.value = true;
}


// 判断截止时间是否过期
function isExpired(deadline) {
  if (!deadline) return false;
  return new Date(deadline).getTime() < Date.now();
}
//格式化日期
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
// 当前选中任务
const selectedTask = ref(null);

// 点击任务选中
function selectTask(todo) {
  selectedTask.value = todo;
}
// 是否正在编辑标题
const isEditingTitle = ref(false);
// 编辑中的标题
const editingTitle = ref("");

// 开始编辑
function startEditTitle() {
  if (!selectedTask.value) return;
  editingTitle.value = selectedTask.value.title;
  isEditingTitle.value = true;
}

// 确认修改
function confirmEditTitle() {
  if (!editingTitle.value.trim()) return;
  selectedTask.value.title = editingTitle.value.trim();
  isEditingTitle.value = false;
}

// 取消修改
function cancelEditTitle() {
  isEditingTitle.value = false;
}

// ===== 描述编辑 =====
const isEditingDesc = ref(false);
const editingDesc = ref("");

// 开始编辑描述
function startEditDesc() {
  if (!selectedTask.value) return;
  editingDesc.value = selectedTask.value.description || "";
  isEditingDesc.value = true;
}

// 确认编辑
function confirmEditDesc() {
  selectedTask.value.description = editingDesc.value.trim();
  isEditingDesc.value = false;
}

// 取消编辑
function cancelEditDesc() {
  isEditingDesc.value = false;
}
// ==菜单打开 Created By Zane Xu 2025-12-19==
function openContextMenu(e, todo) {
  contextMenu.value = {
    visible: true,
    x: e.clientX,
    y: e.clientY,
    task: todo,
  };
}
// 复制功能
function copyTask() {
  const copied = JSON.parse(JSON.stringify(contextMenu.value.task));
  copied.id = Date.now();
  copied.title = copied.title + "（副本）";
  todos.value.push(copied);
}
// 新增
function createTask() {
  // 清空编辑状态
  editingTask.value = null;

  // 打开弹窗
  dialogVisible.value = true;
}

// ==拖拽每个任务 Created by Zane Xu 2025-12-19==
//开始拖拽
function onDragStart(index) {
  dragIndex.value = index;
}
//放下
function onDrop(dropIndex) {
  if (dragIndex.value === null) return;

  const sourceIndex = dragIndex.value;

  // 找到真实 todos 中的 index
  const draggedTodo = filteredTodos.value[sourceIndex];
  const targetTodo = filteredTodos.value[dropIndex];

  const from = todos.value.findIndex(t => t.id === draggedTodo.id);
  const to = todos.value.findIndex(t => t.id === targetTodo.id);

  if (from === -1 || to === -1) return;

  const moved = todos.value.splice(from, 1)[0];
  todos.value.splice(to, 0, moved);

  dragIndex.value = null;
}
//结束
function onDragEnd() {
  dragIndex.value = null;
}

watch(
  todos,
  (newVal) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
  },
  { deep: true }
);

function completedSubtasks(todo) {
  if (!todo.subtasks) return 0;
  return todo.subtasks.filter(s => s.completed).length;
}

function calcSubtaskProgress(todo) {
  if (!todo.subtasks || !todo.subtasks.length) return 0;
  return Math.round(
    (completedSubtasks(todo) / todo.subtasks.length) * 100
  );
}

function exportJson() {
  const data = {
    app: "Todo Pro",
    version: currentVersion.value,
    exportedAt: Date.now(),
    total: todos.value.length,
    todos: todos.value,
  };

  // 自动生成下载文件
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `todo-backup-v${currentVersion.value}-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  ElMessage.success(`数据已导出（v${currentVersion.value}）`);

  // 导出后版本号 +1 并存储 localStorage
  currentVersion.value += 1;
  localStorage.setItem(STORAGE_VERSION_KEY, currentVersion.value);
}


const fileInput = ref(null);

function triggerImport() {

  ElMessageBox.confirm(
    "导入将【完全覆盖】当前所有任务，且不可撤销，是否继续？",
    "确认导入",
    {
      type: "warning",
      confirmButtonText: "继续导入",
      cancelButtonText: "取消",
    }
  )
    .then(() => {
      fileInput.value.click();
    })
    .catch(() => { });
}

function importJson(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);

      if (!data.todos || !Array.isArray(data.todos)) {
        throw new Error("JSON 格式不正确");
      }

      // 版本校验
      if (data.version > currentVersion.value) {

        ElMessage.error(
          `导入失败：该备份来自更高版本（v${currentVersion.value}），当前版本 v${data.version.value} 暂不支持导入`
        );
        return;
      }

      todos.value = data.todos;
      localStorage.setItem("todo_list", JSON.stringify(data.todos));


      ElMessage.success(`导入成功，共 ${data.todos.length} 条任务`);
    } catch (err) {

      ElMessage.error("导入失败，请选择正确的 Todo JSON 文件", err);
    } finally {
      e.target.value = "";
    }
  };

  reader.readAsText(file);
}

// 读取 localStorage 中上次版本号，否则从 1 开始
const STORAGE_VERSION_KEY = "todo_version";
const currentVersion = ref(Number(localStorage.getItem(STORAGE_VERSION_KEY)) || 1);

// ==刷新列表==
function refreshTodos() {
  try {
    const raw = localStorage.getItem("todo_list");
    if (raw) {
      todos.value = JSON.parse(raw);

      ElMessage.success("任务列表已刷新");
    } else {
      todos.value = [];

      ElMessage.info("暂无任务，已清空列表");
    }
  } catch (err) {
    console.error(err);

    ElMessage.error("刷新失败，请检查数据格式");
  }
}

// ==单个任务完成后排序==
function onCompletedChange(todo) {
  const index = todos.value.findIndex(t => t.id === todo.id);
  if (index === -1) return;

  // 先移除
  const [item] = todos.value.splice(index, 1);

  if (item.completed) {
    // ✅ 完成 → 放到最后
    todos.value.push(item);
  } else {
    // ❌ 取消完成 → 放回未完成区末尾
    const firstCompletedIndex = todos.value.findIndex(t => t.completed);
    if (firstCompletedIndex === -1) {
      todos.value.push(item);
    } else {
      todos.value.splice(firstCompletedIndex, 0, item);
    }
  }
}




function removeSubtask(subId) {
  selectedTask.value.subtasks =
    selectedTask.value.subtasks.filter(s => s.id !== subId);
}

const subtaskDialogVisible = ref(false);
const editingSubtask = ref(null);

function openSubtaskDialog(subtask = null) {
  editingSubtask.value = subtask
    ? { ...subtask }     // 编辑：拷贝
    : { title: '' };    // 新建

  subtaskDialogVisible.value = true;
}


function saveSubtask(title) {
  if (!title.trim()) return;

  // 新建
  if (!editingSubtask.value.id) {
    if (!selectedTask.value.subtasks) {
      selectedTask.value.subtasks = [];
    }

    selectedTask.value.subtasks.push({
      id: Date.now(),
      title,
      completed: false,
    });
  }
  // 编辑
  else {
    const target = selectedTask.value.subtasks.find(
      s => s.id === editingSubtask.value.id
    );
    if (target) target.title = title;
  }

  subtaskDialogVisible.value = false;
}

//** 时间日期展示以及复制功能使用 Added By Zane Xu 2026-02-02 */
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
// 复制到剪贴板
const copyTimeToClipboard = async (value) => {
  /**
   * 1.复制到剪切板中
  */
  try {
    // 使用现代浏览器的Clipboard API
    await navigator.clipboard.writeText(value)
    ElNotification({
      title: '提示',
      message: `复制成功${formattedTime.value}`,
      type: 'success',
    })
  } catch (err) {
    ElNotification({
      title: '提示',
      message: `${err.message}`,
      type: 'error',
    })
  }
}

/**
 * 1，标签窗口的增加 Added By Zane Xu 2026-02-02
*/
const tagOptions = reactive(["祈福医院信息化建设", "孙逸仙南北院区建设", "其他"]);
const dialogTagVisible = ref(false)
const openAddTagDialog = () => {
  dialogTagVisible.value = true
}
// 处理添加标签
const handleAddTag = (tagName) => {
  if (tagName) {
    tagOptions.push(tagName)
    ElMessage.success(`标签 "${tagName}" 添加成功`)
  }
}
// 删除标签
const removeTag = (index) => {
  const tagName = tagOptions[index]
  ElMessageBox.confirm(
    `确定要删除标签 "${tagName}" 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    tagOptions.splice(index, 1)
    ElMessage.success('标签删除成功')
  }).catch(() => {
    // 取消删除
  })
}

/**
 * 1.项目窗口的增加 Added By Zane Xu 2026-02-04
 */
const dialogProjectVisible = ref(false)
const projectOptions = reactive(["学习", "工作", "生活"])
const openAddProjectDialog = () => {
  dialogProjectVisible.value = true
}
// 添加项目文件夹
const handleAddProject = (projectName) => {
  if (projectName) {
    projectOptions.push(projectName)
    ElMessage.success(`标签 "${projectName}" 添加成功`)
  }
}
</script>

<style lang="scss" scoped></style>
