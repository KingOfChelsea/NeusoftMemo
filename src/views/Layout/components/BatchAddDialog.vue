<template>
    <el-dialog
        v-model="visible"
        title="批量添加子任务"
        width="600px"
        :close-on-click-modal="false"
        @close="handleClose"
    >
        <el-form :model="batchForm" label-position="top">
            <el-form-item label="分隔符设置">
                <el-input
                    v-model="batchForm.separator"
                    placeholder="请输入分隔符，默认为英文分号 ;"
                    style="width: 200px"
                />
                <el-tag type="info" style="margin-left: 10px">
                    当前分隔符：{{ batchForm.separator || ';' }}
                </el-tag>
            </el-form-item>

            <el-form-item label="批量输入内容">
                <el-input
                    v-model="batchForm.content"
                    type="textarea"
                    :rows="8"
                    placeholder="请输入要批量添加的任务内容，使用分隔符进行分割&#10;例如：&#10;任务1内容;任务2内容;任务3内容"
                />
            </el-form-item>

            <el-form-item v-if="previewList.length > 0" label="预览">
                <el-table :data="previewList" border stripe max-height="300">
                    <el-table-column type="index" label="序号" width="60" />
                    <el-table-column prop="content" label="任务内容" min-width="200" show-overflow-tooltip />
                </el-table>
                <div style="margin-top: 10px; color: #909399; font-size: 12px">
                    共解析到 {{ previewList.length }} 条任务
                </div>
            </el-form-item>
        </el-form>

        <template #footer>
            <span class="dialog-footer">
                <el-button @click="handleClose">取消</el-button>
                <el-button
                    type="primary"
                    @click="handleConfirm"
                    :disabled="previewList.length === 0"
                >
                    确认添加 ({{ previewList.length }})
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, computed, defineEmits, defineExpose } from 'vue'

const emit = defineEmits(['confirm', 'update:visible'])

const visible = ref(false)

// 批量表单数据
const batchForm = ref({
    separator: ';',
    content: ''
})

// 预览列表
const previewList = computed(() => {
    if (!batchForm.value.content.trim()) return []

    const separator = batchForm.value.separator || ';'
    const items = batchForm.value.content
        .split(separator)
        .map(item => item.trim())
        .filter(item => item !== '')

    return items.map(content => ({ content }))
})

// 打开对话框
function open() {
    visible.value = true
}

// 关闭对话框
function handleClose() {
    visible.value = false
    batchForm.value.content = ''
}

// 确认添加
function handleConfirm() {
    const separator = batchForm.value.separator || ';'
    const items = batchForm.value.content
        .split(separator)
        .map(item => item.trim())
        .filter(item => item !== '')

    emit('confirm', items)
    handleClose()
}

defineExpose({
    open
})
</script>

<style lang="scss" scoped>
.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>
