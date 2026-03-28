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
            <el-option v-for="(tag, index) in tagOptions" :key="index" :label="tag.name" :value="tag.name" />
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
import { reactive, watch, defineProps, defineEmits, ref } from "vue";

const emit = defineEmits(["update:visible", "create", "update:tagOptions", "update:projectOptions"]);

const props = defineProps({
  visible: Boolean,
  task: Object, // 编辑时传入任务
  tagOptions: Object, // 标签
  projectOptions: Object //文件夹

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
      console.log(props.tagOptions);

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
    completed: false  // 添加完成状态
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
  // console.log(props.projectOptions);
  newTag.value = newTag.value.trim()
  //  避免重复项目录入项目
  if (props.projectOptions.includes(newTag.value)) {
    ElMessage.error('标签名称已存在')
    return
  }
  emit('update:projectOptions', newTag.value)
  SharedWorker.value = false
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
