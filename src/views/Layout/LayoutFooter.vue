<template>
  <footer class="app-footer">
    <div class="footer-content">
      <!-- 基本信息 -->
      <div class="base-info">
        <el-text class="developer">开发者：徐振宇</el-text>
        <el-text class="app-name">Todo Pro</el-text>
        <el-tag size="small" type="primary">v1.0.0</el-tag>
        <el-text class="copyright" type="info">© 2026 个人作品</el-text>
        <el-text class="email" type="info">
          <el-icon>
            <Message />
          </el-icon>
          联系邮箱
        </el-text>
        <el-text class="update-time" type="info">
          <el-icon>
            <Clock />
          </el-icon>
          2026/2/26
        </el-text>
      </div>

      <!-- 链接区域 -->
      <div class="footer-links">
        <el-link type="info" underline="always" @click="openHelpCard">
          <el-icon>
            <QuestionFilled />
          </el-icon>
          使用帮助
        </el-link>
        <el-link type="info" underline="always" @click="openFeedbackCard">
          <el-icon>
            <ChatDotRound />
          </el-icon>
          意见反馈
        </el-link>
        <el-link type="info" underline="always" @click="openAuthorCard">
          <el-icon>
            <User />
          </el-icon>
          关于作者
        </el-link>
        <el-link type="info" underline="always" @click="openUpdateCard">
          <el-icon>
            <Histogram />
          </el-icon>
          更新日志
        </el-link>
        <el-link type="info" underline="always" class="social-link" @click="openGithubCard">
          <el-icon>
            <Platform />
          </el-icon>
          GitHub
        </el-link>
      </div>
    </div>

    <!-- 帮助卡片 -->
    <helpDialog v-model:helpDialogVisible="helpDialogVisible"></helpDialog>

    <!-- 反馈卡片 -->
    <el-dialog v-model="feedbackDialogVisible" title="意见反馈" width="500px" center :append-to-body="true">
      <div class="feedback-content">
        <el-form :model="feedbackForm" label-width="80px">
          <el-form-item label="反馈类型">
            <el-select v-model="feedbackForm.type" placeholder="请选择反馈类型">
              <el-option label="功能建议" value="suggestion" />
              <el-option label="问题反馈" value="problem" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="反馈内容">
            <el-input v-model="feedbackForm.content" type="textarea" :rows="4" placeholder="请详细描述您的建议或遇到的问题..."
              maxlength="300" show-word-limit />
          </el-form-item>
          <el-form-item label="联系方式">
            <el-input v-model="feedbackForm.contact" placeholder="邮箱/电话（选填）" />
          </el-form-item>
        </el-form>
        <div class="feedback-actions">
          <el-button @click="feedbackDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitFeedback">提交反馈</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 作者卡片 -->
    <author-dialog v-model:authorDialogVisible="authorDialogVisible"></author-dialog>
    <!-- 更新日志卡片 -->
    <update-dialog v-model:updateDialogVisible="updateDialogVisible"></update-dialog>
    <!-- Github卡片 -->
    <github-dialog v-model:githubDialogVisible="githubDialogVisible"></github-dialog>

  </footer>
</template>

<script setup>
import { ref } from 'vue'
import GithubDialog from './components/Footer/GithubDialog.vue'
import UpdateDialog from './components/Footer/UpdateDialog.vue'
import AuthorDialog from './components/Footer/AuthorDialog.vue'
import HelpDialog from './components/Footer/HelpDialog.vue'
// 弹窗控制
const helpDialogVisible = ref(false)
const feedbackDialogVisible = ref(false)
const authorDialogVisible = ref(false)
const updateDialogVisible = ref(false)
const githubDialogVisible = ref(false)

// 反馈表单
const feedbackForm = ref({
  type: '',
  content: '',
  contact: ''
})

// 打开弹窗
const openHelpCard = () => helpDialogVisible.value = true
const openFeedbackCard = () => feedbackDialogVisible.value = true
const openAuthorCard = () => authorDialogVisible.value = true
const openUpdateCard = () => updateDialogVisible.value = true
const openGithubCard = () => githubDialogVisible.value = true

// 提交反馈
const submitFeedback = () => {
  if (!feedbackForm.value.type || !feedbackForm.value.content) {
    ElMessage.warning('请填写反馈类型和内容')
    return
  }

  // 模拟提交
  console.log('提交反馈:', feedbackForm.value)
  ElMessage.success('感谢您的反馈！')
  feedbackDialogVisible.value = false
  feedbackForm.value = { type: '', content: '', contact: '' }
}
</script>

<style scoped>
.app-footer {
  background: var(--el-bg-color-page);
  border-top: 1px solid var(--el-border-color-light);
  padding: 12px 24px;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  gap: 20px;
}

.base-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 13px;
}

.base-info .el-text {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--el-text-color-secondary);
}

.app-name {
  font-weight: 600;
  color: var(--el-color-primary) !important;
  font-size: 13px;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.footer-links .el-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  transition: color 0.2s;
}

.footer-links .el-link:hover {
  color: var(--el-color-primary);
}



.feedback-content {
  padding: 8px 0;
}

.feedback-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}



.tech-stack {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.other-projects {
  display: flex;
  gap: 16px;
}



/* 响应式 */
@media (max-width: 1024px) {
  .footer-content {
    flex-wrap: wrap;
    justify-content: center;
    text-align: center;
  }

  .base-info,
  .footer-links {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .app-footer {
    padding: 12px 16px;
  }

  .footer-content {
    flex-direction: column;
    gap: 12px;
  }

  .base-info {
    flex-direction: column;
    gap: 8px;
  }

  .footer-links {
    gap: 12px;
  }

  .github-stats {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .footer-links {
    flex-direction: column;
    align-items: center;
  }

  .base-info .el-text,
  .footer-links .el-link {
    justify-content: center;
  }
}
</style>
