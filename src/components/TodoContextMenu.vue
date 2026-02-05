<template>
  <div v-if="visible" class="context-menu" :style="{ left: x + 'px', top: y + 'px' }">
    <div class="menu-item" @click="onEdit">
      ✏️ 编辑
    </div>
    <div class="menu-item" @click="onCopy">
      📋 复制
    </div>
    <div class="menu-item" @click="onCreate" style="display: flex; align-items: center; gap: 6px;">
      <el-icon :size="15" style="display: flex; align-items: center;">
        <Edit />
      </el-icon>
      <span>新增</span>
    </div>
    <div class="menu-item danger" @click="onDelete">
      🗑 删除
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";

defineProps({
  visible: Boolean,
  x: Number,
  y: Number,
});

const emit = defineEmits(["edit", "copy", "delete", "close", "create"]);

function onEdit() {
  emit("edit");
  emit("close");
}

function onCopy() {
  emit("copy");
  emit("close");
}

function onDelete() {
  emit("delete");
  emit("close");
}

function handleClickOutside() {
  emit("close");
}

function onCreate() {
  emit("create");
  emit("close");
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped lang="scss">
.context-menu {
  position: fixed;
  z-index: 3000;
  width: 140px;
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;

  .menu-item {
    padding: 8px 12px;
    font-size: 13px;
    cursor: pointer;

    &:hover {
      background: #f5f7fa;
    }

    &.danger {
      color: #f56c6c;

      &:hover {
        background: #fde2e2;
      }
    }
  }
}
</style>
