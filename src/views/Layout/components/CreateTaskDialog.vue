<template>
  <el-dialog title="新建任务" width="600px" :draggable="true" :model-value="visible" @close="handleClose"
    class="create-task-dialog" @keydown.enter.prevent="handleKeydown" @keydown.esc.prevent="handleClose">
    <!-- 改为一个 @keydown.enter.prevent -->
    <div class="dialog-body">
      <!-- 标题 -->
      <div class="form-item title">
        <el-input v-model="form.title" placeholder="请输入任务标题（必填）" size="large" />
      </div>

      <!-- 描述 -->
      <div class="form-item">
        <el-input type="textarea" :rows="3" v-model="form.description" placeholder="任务描述（可选）" />
      </div>

      <!-- 项目 / 优先级 -->
      <div class="form-row">
        <div class="form-item">
          <label>项目</label>
          <el-select v-model="form.project" placeholder="选择项目">
            <el-option label="工作" value="work" />
            <el-option label="学习" value="study" />
            <el-option label="生活" value="life" />
          </el-select>
        </div>

        <div class="form-item">
          <label>优先级</label>
          <el-select v-model="form.priority" placeholder="选择优先级">
            <el-option label="P1 - 紧急" value="p1" />
            <el-option label="P2 - 高" value="p2" />
            <el-option label="P3 - 中" value="p3" />
            <el-option label="P4 - 低" value="p4" />
          </el-select>
        </div>
      </div>

      <!-- 标签 / 截止时间 -->
      <div class="form-row">
        <div class="form-item">
          <label>标签</label>
          <el-select v-model="form.tags" multiple filterable allow-create default-first-option placeholder="选择或输入标签">
            <el-option v-for="tag in tagOptions" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </div>

        <div class="form-item">
          <label>截止时间</label>
          <el-date-picker v-model="form.deadline" type="date" placeholder="选择日期" style="width: 100%" />
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
            <el-input v-model="sub.title" placeholder="子任务标题" size="small" style="width: 80%" />
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
</template>

<script setup>
import { reactive, watch, defineProps, defineEmits } from "vue";

const emit = defineEmits(["update:visible", "create"]);

const props = defineProps({
  visible: Boolean,
  task: Object, // 编辑时传入任务
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

// 可选标签列表
const tagOptions = reactive(["祈福医院信息化建设", "孙逸仙南北院区建设", "其他"]);



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
      if (!tagOptions.includes(tag)) {
        tagOptions.push(tag);
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
    console.warn("请输入任务标题");
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
    completed: false  // 添加完成状态
  });
}

// 删除子任务
function removeSubtask(index) {
  form.subtasks.splice(index, 1);
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
</style>
