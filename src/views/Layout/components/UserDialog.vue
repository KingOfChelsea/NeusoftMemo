<template>
  <el-dialog :model-value="visible" :title="userForm.id ? '编辑负责人' : '添加负责人'" width="400px" @close="handleClose"
    draggable>
    <el-form ref="userFormRef" :model="userForm" :rules="userRules" label-width="60px">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="userForm.name" size="small" clearable>
          <template #prefix>
            <el-icon>
              <User />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="部门" prop="department">
        <el-select v-model="userForm.department" size="small" style="width: 100%" clearable>
          <template #prefix>
            <el-icon>
              <OfficeBuilding />
            </el-icon>
          </template>
          <el-option v-for="dept in departments" :key="dept" :label="dept" :value="dept" />
        </el-select>
      </el-form-item>

      <el-form-item label="头像" prop="avatar">
        <div class="avatar-input-wrapper">
          <el-input v-model="userForm.avatar" placeholder="请输入头像URL或上传图片" size="small" clearable>
            <template #prefix>
              <el-icon>
                <Picture />
              </el-icon>
            </template>
          </el-input>

          <div class="icon-search-hint">
            <el-link type="primary" :underline="false" href="https://www.iconfont.cn/" target="_blank"
              class="hint-link">
              <el-icon>
                <Search />
              </el-icon>
              在 iconfont 搜索图标
            </el-link>
            <div class="hint-text">
              推荐搜索：用户、头像、个人、profile 等关键词
            </div>
          </div>
        </div>
      </el-form-item>

      <el-form-item v-if="userForm.avatar" label="预览">
        <div class="avatar-preview-area">
          <el-avatar :size="60" :src="userForm.avatar" />
          <div class="preview-actions">
            <el-button type="text" size="small" @click="userForm.avatar = ''">
              清空
            </el-button>

          </div>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="warning" size="small" @click="handleClose">取消</el-button>
        <el-button type="danger" size="small" @click="resetForm">
          清空
        </el-button>
        <el-button type="primary" size="small" @click="handleSubmit">
          {{ userForm.id ? '保存' : '添加' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { v4 as uuidv4 } from 'uuid';


// 1. 部门定义数据
const departments = ['技术部', '产品部', '设计部', '市场部', '运营部', '人事部', '财务部']
// 2. 表单验证规则
const userFormRef = ref()
// 3. 表单数据
const userForm = reactive({
  id: null,
  name: '',
  department: '',
  avatar: ''
})
// 4.props父级数据
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userData: {
    type: Object,
    default: () => ({})
  }
})
//5. 表单规则
const userRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 0, max: 4, message: '长度在 0 到 4 个字符', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ],
  avatar: [
    { required: true, message: '请输入头像URL', trigger: 'blur' }
  ]
}
//6. 定义emit
const emit = defineEmits(['update:visible', 'save']);

// 7.关闭对话框
const handleClose = () => {
  emit('update:visible', false);
};

// 8. 添加用户
const handleSubmit = () => {
  const uuid = uuidv4();
  userFormRef.value.validate(valid => {
    if (valid) {
      // 添加用户
      emit('save', { ...userForm, id: uuid })
      // console.log('添加用户成功', { ...userForm, id: uuid })
      // 关闭对话框
      handleClose()
      // 清空表单数据
      resetForm()
    }
  })
}

// 9. 重置表单数据
const resetForm = () => {
  userFormRef.value.resetFields()
  userForm.id = null
  userForm.name = ''
  userForm.department = ''
  userForm.avatar = ''
}

</script>

<style scoped></style>
