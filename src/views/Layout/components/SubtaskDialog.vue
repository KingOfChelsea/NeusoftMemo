<template>
  <el-dialog title="子任务" width="500px" :model-value="modelValue" @close="close" :close-on-click-modal="false"
    align-center>
    <div class="subtask-dialog">
      <!-- 标题和说明 -->
      <div class="dialog-header">
        <h3 class="dialog-title">
          <i class="title-icon">📋</i>
          子任务
        </h3>
        <p class="dialog-desc">为任务添加具体的子任务内容，让任务更清晰可执行</p>
      </div>

      <!-- 输入区域 -->
      <div class="input-container">
        <div class="input-label-container">
          <label class="input-label">子任务内容</label>
          <span class="char-count">{{ title.length }}/200</span>
        </div>
        <el-input v-model="title" type="textarea" :autosize="{ minRows: 4, maxRows: 6 }"
          placeholder="请输入具体的子任务描述，例如：完成项目需求文档的初稿编写..." maxlength="200" resize="none" @keyup.enter="confirm"
          class="task-input" />
        <div class="input-hint-container">
          <div class="hint-text">
            <i class="hint-icon">💡</i>
            <span>按 <kbd>Enter</kbd> 键快速确认</span>
          </div>
          <div class="required-hint" v-if="!title.trim()">* 请输入子任务内容</div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="close" size="large" class="cancel-btn" :style="{ padding: '0 24px' }">
          取消
        </el-button>
        <el-button type="primary" @click="confirm" size="large" :disabled="!title.trim()" class="confirm-btn"
          :style="{ padding: '0 24px' }">
          <i class="btn-icon">{{ props.subtask?.id ? '🔄' : '➕' }}</i>
          {{ props.subtask?.id ? '更新子任务' : '添加子任务' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  subtask: Object,
});

const emit = defineEmits(['update:modelValue', 'save']);

const title = ref('');

watch(
  () => props.subtask,
  (val) => {
    title.value = val?.title || '';
  },
  { immediate: true }
);

function close() {
  emit('update:modelValue', false);
}

function confirm() {
  if (!title.value.trim()) return;
  emit('save', title.value.trim());
  close();
}
</script>

<style scoped>
.subtask-dialog {
  padding: 4px 8px 8px;
}

.dialog-header {
  margin-bottom: 28px;
  text-align: center;
  padding: 0 4px;
}

.dialog-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.title-icon {
  font-size: 18px;
  opacity: 0.9;
}

.dialog-desc {
  font-size: 13.5px;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.6;
  font-weight: 400;
}

.input-container {
  margin-bottom: 4px;
}

.input-label-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.input-label {
  font-size: 14.5px;
  font-weight: 600;
  color: #34495e;
  line-height: 1.4;
  letter-spacing: 0.2px;
}

.char-count {
  font-size: 12px;
  color: #95a5a6;
  font-weight: 400;
}

.task-input {
  font-size: 14.5px;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.task-input :deep(.el-textarea__inner) {
  border-radius: 10px;
  padding: 16px;
  border: 1.5px solid #e0e0e0;
  background-color: #fafafa;
  color: #2c3e50;
  font-size: 14.5px;
  line-height: 1.5;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.task-input :deep(.el-textarea__inner:hover) {
  border-color: #bdc3c7;
  background-color: #f8f9fa;
}

.task-input :deep(.el-textarea__inner:focus) {
  border-color: #3498db;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05);
  outline: none;
}

.task-input :deep(.el-textarea__inner::placeholder) {
  color: #a0a0a0;
  font-weight: 400;
}

.input-hint-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding: 0 2px;
}

.hint-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: #7f8c8d;
  font-weight: 400;
}

.hint-icon {
  font-size: 12px;
  opacity: 0.7;
}

kbd {
  background: #f0f0f0;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  font-family: monospace;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
  margin: 0 2px;
}

.required-hint {
  font-size: 12px;
  color: #e74c3c;
  font-weight: 500;
  opacity: 0.9;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 20px 0 8px;
  border-top: 1px solid #f0f0f0;
  margin-top: 4px;
}

.cancel-btn {
  min-width: 100px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1.5px solid #dfe6e9;
  border-radius: 10px;
  color: #636e72;
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
}

.cancel-btn:hover {
  background: linear-gradient(135deg, #f1f3f4 0%, #dfe6e9 100%);
  border-color: #b2bec3;
  color: #2d3436;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.cancel-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.confirm-btn {
  min-width: 120px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border: none;
  border-radius: 10px;
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(52, 152, 219, 0.2);
}

.confirm-btn:hover:not(.is-disabled) {
  background: linear-gradient(135deg, #2980b9 0%, #1f6397 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.confirm-btn:active:not(.is-disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(52, 152, 219, 0.2);
}

.confirm-btn.is-disabled {
  background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);
  border-color: #dfe6e9;
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
  transform: none;
}

.btn-icon {
  margin-right: 6px;
  font-size: 13px;
  opacity: 0.9;
}
</style>
