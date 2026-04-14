<template>
  <el-dialog :model-value="visible" :title="dialogTitle" width="500px" @close="handleClose">
    <el-form label-width="80px" label-position="right" size="default" ref="formRef" :model="form" :rules="rules">
      <el-form-item label="优先级标识">
        <el-input v-model="form.label" placeholder="请输入优先级标识，如：P1、HIGH等" clearable>
          <template #prefix>
            <el-icon>
              <PriceTag />
            </el-icon>
          </template>
        </el-input>
        <div class="form-tip">建议使用字母+数字组合，如P1、P2等</div>
      </el-form-item>

      <el-form-item label="唯一标识">
        <el-input v-model="form.value" placeholder="请输入唯一标识，如：P1、HIGH_PRIORITY等" clearable
          :disabled="props.mode === 'edit'">
          <template #prefix>
            <el-icon>
              <Key />
            </el-icon>
          </template>
        </el-input>
        <div class="form-tip" v-if="props.mode === 'edit'">编辑模式下不可修改唯一标识</div>
        <div class="form-tip" v-else>用于内部识别，不可重复，建议使用大写英文</div>
      </el-form-item>

      <el-form-item label="描述">
        <el-input v-model="form.desc" placeholder="请输入优先级描述，如：紧急、高、中等" type="textarea" :rows="3" resize="none" />
      </el-form-item>

      <el-form-item label="排序权重">
        <el-slider :min="1" :max="10" :step="1" show-stops show-input />
        <div class="form-tip">数值越大，优先级越高（影响排序）</div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button @click="handleSubmit" type="primary">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { PriceTag, Key } from '@element-plus/icons-vue';
import { watch, computed, ref, reactive, nextTick } from 'vue';
// 0.定义变量

// 表单引用
const formRef = ref();

// 表单数据
const form = reactive({
  label: '',
  value: '',
  desc: ''
});

// 1.父级传入的参数
const props = defineProps({
  visible: {
    type: Boolean,
    default: false, // 是否可见
  },
  priorityData: {
    type: Object,
    default: () => ({})
  },
  mode: {
    type: String,
    default: 'add',
    validator: (value) => ['add', 'edit'].includes(value)
  }
});
// 2.子级定义的参数
const emit = defineEmits(['update:visible', 'save']);

// 3. 重置表单的函数
const resetForm = () => {
  Object.assign(form, {
    label: '',
    value: '',
    desc: ''
  });
};

// 4.监听
watch(() => props.visible, (val) => {
  if (val) {
    // 对话框打开时，填充表单数据
    fillFormData();
    // 清空验证状态
    nextTick(() => {
      formRef.value?.clearValidate();
    });
  } else {
    // 对话框关闭时重置表单
    resetForm();
  }
}, { immediate: true });


// 5. 表单验证规则
const rules = {
  label: [
    { required: true, message: '请输入优先级标识', trigger: 'blur' },
    { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' },
    {
      pattern: /^[A-Za-z0-9]+$/,
      message: '只能包含字母和数字',
      trigger: 'blur'
    }
  ],
  value: [
    { required: true, message: '请输入唯一标识', trigger: 'blur' },
    {
      pattern: /^[A-Z0-9_]+$/,
      message: '只能包含大写字母、数字和下划线',
      trigger: 'blur'
    },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  desc: [
    { required: true, message: '请输入优先级描述', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ]
};

// 6.点击取消后触发关闭弹窗，并通知父组件更新 visible 状态
const handleClose = () => {
  emit('update:visible', false);
};

// 7.计算对话框标题
const dialogTitle = computed(() => {
  return props.mode === 'add' ? '添加优先级' : '编辑优先级';
});

// 8. 填充表单数据的函数
const fillFormData = () => {
  if (props.priorityData && Object.keys(props.priorityData).length > 0) {
    Object.assign(form, {
      label: props.priorityData.label || '',
      value: props.priorityData.value || '',
      desc: props.priorityData.desc || ''
    });
  } else {
    resetForm();
  }
};

// 9. 保存表单数据的函数
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 验证通过，向父组件传递表单数据
      emit('save', { ...form });
      // 关闭对话框
      emit('update:visible', false);
    } else {
      console.log('表单验证失败');
      return false;
    }
  });
};
</script>

<style scoped>
/* 对话框样式 */
:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  margin-right: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-dialog__body) {
  padding: 20px 20px 0;
}

:deep(.el-dialog__footer) {
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

/* 表单提示 */
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

/* 底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 滑块样式 */
:deep(.el-slider__marks-text) {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

/* 输入框前缀图标 */
:deep(.el-input__prefix) {
  display: flex;
  align-items: center;
  margin-left: 5px;
}
</style>
