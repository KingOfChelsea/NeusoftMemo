<template>
  <el-dialog title="新建任务" width="600px" :draggable="true" :model-value="visible" @close="handleClose"
    class="create-task-dialog" @keydown.enter.prevent="handleKeydown" @keydown.esc.prevent="handleClose">
    <!-- 改为一个 @keydown.enter.prevent -->
    <div class="dialog-body">
      <!-- 1.标题 -->
      <div class="form-item title">
        <el-input v-model="form.title" placeholder="请输入任务标题（必填）" size="large" />
      </div>

      <!-- 2.描述 -->
      <div class="form-item">
        <el-input type="textarea" :rows="3" v-model="form.description" placeholder="任务描述（可选）" />
      </div>

      <!-- 3.项目 / 优先级 -->
      <div class="form-row">
        <div class="form-item">
          <label>项目</label>
          <el-select v-model="form.project" placeholder="选择项目">
            <el-option v-for="(value, index) in projectOptions" :key="index" :label="value" :value="value" />

            <template #footer>
              <template v-if="!showCustomInput">
                <el-button type="text" size="small" @click="showCustomInput = true">自定义添加</el-button>
              </template>
              <template v-else>
                <div class="custom-input-area">
                  <el-input v-model="newTag" placeholder="请输入标签名称" size="small" class="custom-input"
                    @keyup.enter="addTag" clearable />
                  <el-button type="text" size="small" @click="addTag">添加</el-button>
                </div>
              </template>
            </template>
          </el-select>

        </div>

        <!-- 4.优先级 -->
        <div class="form-item">
          <label style="display: flex; align-items: center;">优先级
            <!-- <span>
              <el-button type='primary' size="small" text @click="openPriorityDialog">
                <el-icon>
                  <Plus />
                </el-icon>
              </el-button>
            </span> -->
          </label>

          <el-select v-model="form.priority" placeholder="选择优先级" clearable>

            <el-option v-for="priority in priorityList" :key="priority.value"
              :label="priority.label + ' - ' + priority.desc" :value="priority.label + ' - ' + priority.desc">
              <div class="priority-option">
                <el-tag :type="getTagType(priority.value)" size="small" :effect="priority.fixed ? 'dark' : 'light'"
                  class="priority-badge">
                  {{ priority.label }}
                </el-tag>
                <span class="priority-desc">{{ priority.desc }}</span>
              </div>
            </el-option>
          </el-select>
        </div>

      </div>

      <!-- 5. 标签 / 截止时间 -->
      <div class="form-row">
        <div class="form-item">
          <label>标签</label>
          <el-select v-model="form.tags" multiple filterable allow-create default-first-option placeholder="选择或输入标签">
            <el-option v-for="(tag, index) in tagOptions" :key="index" :label="tag.name" :value="tag.name" />
          </el-select>
        </div>

        <div class="form-item">
          <label>截止时间</label>
          <el-date-picker v-model="form.deadline" type="date" placeholder="选择日期" style="width: 100%" format="YYYY-MM-DD"
            value-format="YYYY-MM-DD" />
        </div>
      </div>

      <!-- 子任务 -->
      <div class="subtask-section">
        <div class="subtask-header">
          <span>子任务</span>
          <el-button text size="small" @click="addSubtask">+ 添加子任务</el-button>
        </div>

        <div v-if="form.subtasks.length === 0" class="subtask-empty">
          <span>暂无子任务</span>
        </div>

        <div v-else class="subtask-list">
          <div class="subtask-item" v-for="(sub, index) in form.subtasks" :key="sub.id">
            <!-- 选择患者 -->
            <el-select v-model="sub.assignees" size="small" placeholder="选择或输入相关人"
              style="width: 300px; margin-right: 10px;" multiple>
              <el-option v-for="user in allUsers" :key="user.id" :label="user.name + ' - ' + user.department"
                :value="user.name + ' - ' + user.department">
                <div style="display: flex; align-items: center;">
                  <el-avatar :size="20" :src="user.avatar" style="margin-right: 8px;" />
                  <span>{{ user.name }}</span>
                  <span style="margin-left: 8px; color: #909399; font-size: 12px;">
                    {{ user.department }}
                  </span>
                </div>
              </el-option>
            </el-select>

            <el-input v-model="sub.title" placeholder="子任务标题" size="small" style="width: 80%" />
            <el-button type="primary" :icon="Link" size="small" @click="openUploadDialog(index)">上传</el-button>
            <el-button type="text" size="small" @click="removeSubtask(index)">删除</el-button>
          </div>
        </div>

      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="dialog-footer">
        <span class="tip">Enter 快速创建 · Esc 取消</span>
        <div>
          <el-button @click="handleReset">一键清空</el-button>
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleCreate">创建任务</el-button>
        </div>
      </div>
    </template>
  </el-dialog>

  <!-- 其他：创建优先级对话框 -->

  <!-- 1.创建优先级对话框 -->
  <PriorityEditDialog v-model:visible="showPriorityDialog" :mode="dialogMode" />
  <!-- 2.上传文件对话框 -->
  <UploadAttachmentDialog v-model="showUploadDialog" :visible="showUploadDialog" @success="handleUploadSuccess"
    @cancel="handleUploadCancel"></UploadAttachmentDialog>
</template>

<script setup>
import { reactive, watch, defineProps, defineEmits, ref } from "vue";
import PriorityEditDialog from "./PriorityEditDialog.vue";
import { Link } from "@element-plus/icons-vue";
import UploadAttachmentDialog from './UploadFileDialog.vue';

const emit = defineEmits(["update:visible", "create", "update:tagOptions", "update:projectOptions"]);

const props = defineProps({
  visible: Boolean,
  task: Object, // 编辑时传入任务
  tagOptions: Object, // 标签
  projectOptions: Object, //文件夹
  priorityList: Array // 优先级列表
});

const form = reactive({
  id: null,
  title: "",
  description: "",
  project: "",
  priority: "",
  tags: [],
  deadline: "",
  subtasks: [] // 新增子任务数组
});



// 当 task 改变时，更新 form
watch(
  () => props.task,
  (val) => {
    if (val) {
      Object.assign(form, val);
    } else {
      handleReset();
    }
  },
  { immediate: true }
);

// 当用户创建新标签时自动加入选项列表
watch(
  () => form.tags,
  (newVal) => {
    newVal.forEach(tag => {
      if (!props.tagOptions.some(tag1 => tag1.name === tag)) {
        const newTag = {
          name: tag,        // 标签名
          color: '#ffffff' // 默认背景颜色
        }
        emit('update:tagOptions', newTag)
      }
    });
  }
);

// 关闭窗体
function handleClose() {
  emit("update:visible", false);
  handleReset(); // 关闭时也可选择清空表单
}

// 触发创建
function handleCreate() {
  if (!form.title.trim()) {
    // 可以添加提示
    ElMessage.error('请输入任务标题')
    return;
  }
  emit("create", { ...form });
  handleClose(); // 关闭弹窗
}

// 触发重置
function handleReset() {
  form.id = null;
  form.title = "";
  form.description = "";
  form.project = "";
  form.priority = "";
  form.tags = [];
  form.deadline = "";
  form.subtasks = [];
}

// 快捷键 Enter / Esc
function handleKeydown(e) {
  if (e.key === "Enter") {
    handleCreate();  // ✅ 修正：调用 handleCreate 而不是 createTask
  } else if (e.key === "Escape") {
    handleClose();
  }
}

// 添加子任务
function addSubtask() {
  form.subtasks.push({
    id: Date.now() + Math.random(), // 简单唯一 id
    title: "",
    completed: false,  // 添加完成状态
    Link: [], // 添加关联
    index: form.subtasks.length, // 记录索引
    assignees: [] // 存储相关人ID数组
  });
}

// 删除子任务
function removeSubtask(index) {
  form.subtasks.splice(index, 1);
}

const newTag = ref('')
const showCustomInput = ref(false)

// 添加标签方法 传值给父组件更新标签列表
const addTag = () => {
  newTag.value = newTag.value.trim()
  //  避免重复项目录入项目
  if (props.projectOptions.includes(newTag.value)) {
    ElMessage.error('标签名称已存在')
    return
  }
  emit('update:projectOptions', newTag.value)
  SharedWorker.value = false
}

const getTagType = (value) => {
  const typeMap = {
    'P1': 'danger',
    'P2': 'warning',
    'P3': 'success',
    'P4': 'info'
  };
  return typeMap[value] || 'primary';
};

/**
 * 创建优先级对话框组件/实现逻辑 Added By Zane Xu 2026-04-06
 */

// 0.对话框控制基本变量
const showPriorityDialog = ref(false);
const dialogMode = ref('add'); // 'add' 或 'edit'


// 1. 打开优先级对话框
const openPriorityDialog = () => {
  dialogMode.value = 'add'; // 默认添加模式
  showPriorityDialog.value = true;
};

/**
 * 2. 打开上传文件对话框
 */
// 控制弹窗显示
const showUploadDialog = ref(false);
// 当前正在上传的子任务索引
const currentSubtaskIndex = ref(-1);

// 打开上传对话框，并保存当前子任务索引
function openUploadDialog(index) {
  currentSubtaskIndex.value = index;
  showUploadDialog.value = true;
}
// 上传成功回调
const handleUploadSuccess = (fileList) => {
  console.log('上传成功，文件列表：', fileList);
  ElMessage.success('上传成功');
  showUploadDialog.value = false;

  // 检查索引是否有效
  if (currentSubtaskIndex.value >= 0 && currentSubtaskIndex.value < form.subtasks.length) {
    // 将文件添加到对应子任务的 Link 数组
    if (Array.isArray(fileList)) {
      // 如果是数组，添加所有文件
      form.subtasks[currentSubtaskIndex.value].Link.push(...fileList);
    } else {
      // 如果是单个文件对象
      form.subtasks[currentSubtaskIndex.value].Link.push(fileList);
    }

    console.log('文件已添加到子任务:', currentSubtaskIndex.value, form.subtasks[currentSubtaskIndex.value]);
  } else {
    console.error('无效的子任务索引:', currentSubtaskIndex.value);
  }

  // 重置索引
  currentSubtaskIndex.value = -1;
};

// 取消上传回调
const handleUploadCancel = () => {
  ElMessage
  showUploadDialog.value = false;
};

/**
 * 3. 子任务添加相关人操作
 */
// 用户数据
const userOptions = ref([])
const loading = ref(false)
const allUsers = ref([
  { id: 1, name: '徐振宇', department: '技术部', avatar: 'https://raw.githubusercontent.com/KingOfChelsea/PicGo_MJ_ZY/master/20260415021739742.png' },
  { id: 2, name: 'NIS', department: '产品部', avatar: 'https://raw.githubusercontent.com/KingOfChelsea/PicGo_MJ_ZY/master/20260415021739742.png' },
  { id: 3, name: 'HIS', department: '设计部', avatar: 'https://raw.githubusercontent.com/KingOfChelsea/PicGo_MJ_ZY/master/20260415021739742.png' },
  { id: 4, name: 'LIS', department: '市场部', avatar: 'https://raw.githubusercontent.com/KingOfChelsea/PicGo_MJ_ZY/master/20260415021739742.png' },
  { id: 5, name: '护理管理', department: '运营部', avatar: 'https://raw.githubusercontent.com/KingOfChelsea/PicGo_MJ_ZY/master/20260415021739742.png' }
])

// 标签颜色配置
const tagColors = [
  '#409EFF', '#67C23A', '#E6A23C', '#F56C6C',
  '#909399', '#8E44AD', '#16A085', '#D35400'
]

// 根据用户ID获取标签颜色
const getTagColor = (userId) => {
  const index = userId % tagColors.length
  return tagColors[index]
}

// 搜索用户
const searchUsers = (query) => {
  if (query) {
    loading.value = true
    // 模拟异步搜索
    setTimeout(() => {
      userOptions.value = allUsers.value.filter(user =>
        user.name.includes(query) || user.department.includes(query)
      )
      loading.value = false
    }, 200)
  } else {
    userOptions.value = []
  }
}

// 获取相关人详细信息
const getAssigneeInfo = (assigneeIds) => {
  return assigneeIds.map(id => {
    const user = allUsers.value.find(u => u.id === id)
    return user || { id, name: '未知用户' }
  })
}

// 处理相关人变化
const handleAssigneeChange = (subtask) => {
  console.log('子任务相关人更新:', subtask)
  // 这里可以添加其他处理逻辑
}

// 移除单个相关人
const removeAssignee = (subtask, userId) => {
  const index = subtask.assignees.indexOf(userId)
  if (index > -1) {
    subtask.assignees.splice(index, 1)
  }
}

</script>

<style lang="scss" scoped>
.create-task-dialog {
  .el-dialog__body {
    padding: 20px 24px;
  }

  .dialog-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-item {
    display: flex;
    flex-direction: column;
    gap: 6px;

    &.title {
      .el-input__inner {
        font-size: 16px;
        font-weight: 500;
      }
    }

    label {
      font-size: 13px;
      color: #606266;
    }
  }

  .form-row {
    display: flex;
    gap: 16px;

    .form-item {
      flex: 1;
    }
  }

  .subtask-section {
    margin-top: 8px;
    border-top: 1px dashed #ebeef5;
    padding-top: 12px;

    .subtask-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      span {
        font-size: 14px;
        font-weight: 500;
      }
    }

    .subtask-empty {
      background: #f5f7fa;
      border-radius: 4px;
      padding: 10px;
      text-align: center;
      font-size: 13px;
      color: #909399;
    }

    .subtask-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .subtask-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .tip {
      font-size: 12px;
      color: #909399;
    }
  }
}

/* 移动端 */
@media (max-width: 768px) {
  .create-task-dialog {
    .el-dialog {
      width: 90% !important;
      margin-top: 10vh;
    }

    .form-row {
      flex-direction: column;
      gap: 12px;
    }

    .dialog-footer {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }
}

.priority-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.priority-badge {
  min-width: 40px;
  justify-content: center;
  font-weight: 500;
  flex-shrink: 0;
}

.priority-desc {
  color: #606266;
  font-size: 13px;
}
</style>
