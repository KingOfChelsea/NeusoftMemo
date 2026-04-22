<template>
  <el-dialog v-model="dialogVisible" title="上传附件" width="600px" :before-close="handleBeforeClose">
    <!-- 附件上传区域 -->
    <div class="upload-container">
      <el-upload ref="uploadRef" class="upload-demo" :action="uploadUrl" :headers="uploadHeaders" :data="uploadData"
        :on-preview="handlePreview" :on-remove="handleRemove" :before-remove="beforeRemove" :on-success="handleSuccess"
        :on-error="handleError" :on-exceed="handleExceed" :before-upload="beforeUpload" :file-list="fileList"
        :auto-upload="false" :limit="1" :on-change="handleChange" :show-file-list="false" drag>
        <el-icon class="el-icon--upload">
          <upload-filled />
        </el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持上传图片、文档、压缩包等文件，单个文件不超过 50MB
            <br />
            注意：每次只能上传一个文件
          </div>
        </template>
      </el-upload>

      <!-- 已选文件显示区域 -->
      <div v-if="currentFile" class="file-preview">
        <div class="preview-header">
          <h4>已选文件</h4>
          <el-button type="danger" size="small" @click="clearFile" :disabled="uploading">
            清空
          </el-button>
        </div>

        <div class="file-info">
          <el-icon>
            <document />
          </el-icon>
          <div class="file-details">
            <div class="file-name">{{ currentFile.name }}</div>
            <div class="file-meta">
              <span class="file-size">{{ formatFileSize(currentFile.size) }}</span>
              <span class="file-type">{{ getFileType(currentFile) }}</span>
            </div>
          </div>
        </div>

        <!-- 图片预览 -->
        <div v-if="isImageFile" class="image-preview">
          <img :src="previewUrl" :alt="currentFile.name" />
        </div>
      </div>

      <!-- 上传进度 -->
      <div v-if="uploading" class="upload-progress">
        <el-progress :percentage="uploadProgress" :status="uploadStatus" :stroke-width="6" />
        <div class="progress-text">
          {{ progressText }}
        </div>
      </div>
    </div>

    <!-- 弹窗底部操作按钮 -->
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel" :disabled="uploading">取消</el-button>
        <el-button type="primary" @click="submitUpload" :loading="uploading" :disabled="!currentFile">
          {{ uploading ? '上传中...' : '上传文件' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import {
  UploadFilled,
  Document,
  Close
} from '@element-plus/icons-vue';
import axios from 'axios';

// 定义props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  visible: {
    type: Boolean,
    default: false
  }
});

// 定义emit事件
const emit = defineEmits(['update:modelValue', 'success', 'cancel']);

// 响应式数据
const uploadRef = ref(null);
const fileList = ref([]);
const currentFile = ref(null);
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadStatus = ref('');
const previewUrl = ref('');

// 上传配置 - 使用你的接口地址
const uploadUrl = ref('http://localhost:25734/api/v1/PicGoUploadAPI');
const uploadHeaders = ref({
  'Content-Type': 'multipart/form-data',
  'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
});

// 上传数据 - 使用 form-data 格式
const uploadData = ref({});

// 控制弹窗显示
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => {
    emit('update:modelValue', value);
  }
});

// 计算属性
const isImageFile = computed(() => {
  if (!currentFile.value) return false;
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
  return imageTypes.includes(currentFile.value.raw?.type || '');
});

const progressText = computed(() => {
  if (uploadStatus.value === 'success') return '上传完成';
  if (uploadStatus.value === 'exception') return '上传失败';
  return `上传中 ${uploadProgress.value}%`;
});

// 监视弹窗关闭，清空文件列表
watch(dialogVisible, (val) => {
  if (!val) {
    resetUpload();
  }
});

// 文件大小格式化
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 获取文件类型
const getFileType = (file) => {
  if (!file.raw) return '未知类型';
  const type = file.raw.type;
  if (type) {
    const parts = type.split('/');
    if (parts.length > 1) {
      return parts[1].toUpperCase();
    }
  }
  return file.name.split('.').pop()?.toUpperCase() || '文件';
};

// 文件选择变化
const handleChange = (file) => {
  currentFile.value = file;
  fileList.value = [file];

  // 如果是图片文件，生成预览URL
  if (isImageFile.value && file.raw) {
    previewUrl.value = URL.createObjectURL(file.raw);
  }
};

// 清空当前文件
const clearFile = () => {
  currentFile.value = null;
  fileList.value = [];
  previewUrl.value = '';
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
};

// 重置上传状态
const resetUpload = () => {
  clearFile();
  uploading.value = false;
  uploadProgress.value = 0;
  uploadStatus.value = '';
};

// 上传前处理
const beforeUpload = (file) => {
  console.log('上传文件:', file);
  return true;
};

// 自定义上传方法
const customUpload = async (file) => {
  const formData = new FormData();
  formData.append('files', file.raw); // 参数名称为files，值为file类型

  try {
    const response = await axios.post(uploadUrl.value, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...uploadHeaders.value
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          uploadProgress.value = percentCompleted;
        }
      }
    });

    return { data: response.data, status: 'success' };
  } catch (error) {
    console.error('上传失败:', error);
    throw error;
  }
};

// 提交上传
const submitUpload = async () => {
  if (!currentFile.value) {
    ElMessage.warning('请先选择文件');
    return;
  }

  uploading.value = true;
  uploadStatus.value = '';
  uploadProgress.value = 0;

  try {
    // 使用自定义上传方法
    const result = await customUpload(currentFile.value);

    // 上传成功
    uploadStatus.value = 'success';
    uploadProgress.value = 100;

    setTimeout(() => {
      ElMessage.success('文件上传成功');
      emit('success', [result.data.Message]);
      dialogVisible.value = false;
    }, 1000);
    // console.log(result.data.Message);

  } catch (error) {
    // 上传失败
    uploadStatus.value = 'exception';
    ElMessage.error('文件上传失败: ' + (error.response?.data?.message || error.message));
  } finally {
    uploading.value = false;
  }
};

// 文件上传成功的处理
const handleSuccess = (response, file, fileList) => {
  console.log('文件上传成功:', file.name, response);
};

// 文件上传失败的处理
const handleError = (error, file, fileList) => {
  console.error('文件上传失败:', file.name, error);
  ElMessage.error(`文件 ${file.name} 上传失败: ${error.message}`);
};

// 文件预览
const handlePreview = (file) => {
  if (isImageFile.value && previewUrl.value) {
    // 在新窗口打开图片
    window.open(previewUrl.value, '_blank');
  } else {
    ElMessage.info('该文件类型暂不支持预览');
  }
};

// 删除文件前的确认
const beforeRemove = (file, fileList) => {
  return new Promise((resolve) => {
    ElMessageBox.confirm(`确定要移除 ${file.name} 吗？`, '提示', {
      type: 'warning',
    }).then(() => {
      resolve(true);
    }).catch(() => {
      resolve(false);
    });
  });
};

// 处理文件移除
const handleRemove = (file, fileList) => {
  console.log('移除文件:', file.name);
  clearFile();
};

// 文件超出限制
const handleExceed = (files, fileList) => {
  ElMessage.warning('每次只能上传一个文件，请先移除当前文件');
};

// 弹窗关闭前确认
const handleBeforeClose = (done) => {
  if (currentFile.value && !uploading.value) {
    ElMessageBox.confirm('当前有已选择的文件，确定要关闭吗？', '提示', {
      type: 'warning',
    }).then(() => {
      resetUpload();
      done();
    }).catch(() => {
      // 取消关闭
    });
  } else if (uploading.value) {
    ElMessage.warning('文件正在上传中，请等待上传完成');
  } else {
    resetUpload();
    done();
  }
};

// 取消上传
const handleCancel = () => {
  if (uploading.value) {
    ElMessage.warning('文件正在上传中，请等待上传完成');
    return;
  }
  emit('cancel');
  dialogVisible.value = false;
};
</script>

<style scoped lang="scss">
.upload-container {
  padding: 20px 0;

  .upload-demo {
    width: 100%;

    :deep(.el-upload) {
      width: 100%;
    }

    :deep(.el-upload-dragger) {
      width: 100%;
      height: 180px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border: 2px dashed #dcdfe6;
      border-radius: 6px;
      transition: border-color 0.3s;

      &:hover {
        border-color: #409eff;
      }
    }

    .el-upload__tip {
      margin-top: 10px;
      color: #909399;
      font-size: 12px;
      text-align: center;
      line-height: 1.5;
    }
  }

  .file-preview {
    margin-top: 20px;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e4e7ed;

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e4e7ed;

      h4 {
        margin: 0;
        color: #303133;
        font-size: 16px;
        font-weight: 500;
      }
    }

    .file-info {
      display: flex;
      align-items: center;
      padding: 12px;
      background-color: white;
      border-radius: 6px;
      margin-bottom: 15px;

      .el-icon {
        font-size: 24px;
        color: #409eff;
        margin-right: 12px;
      }

      .file-details {
        flex: 1;

        .file-name {
          font-size: 14px;
          color: #303133;
          font-weight: 500;
          margin-bottom: 4px;
          word-break: break-all;
        }

        .file-meta {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: #909399;

          .file-size,
          .file-type {
            padding: 2px 6px;
            background-color: #f5f7fa;
            border-radius: 3px;
          }
        }
      }
    }

    .image-preview {
      margin-top: 15px;
      text-align: center;

      img {
        max-width: 100%;
        max-height: 200px;
        border-radius: 6px;
        border: 1px solid #e4e7ed;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
  }

  .upload-progress {
    margin-top: 20px;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;

    .progress-text {
      margin-top: 8px;
      text-align: center;
      font-size: 12px;
      color: #606266;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}
</style>
