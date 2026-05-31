<template>
  <svg class="svg-icon" aria-hidden="true">
    <!-- 使用 xlink:href 或 href 引用 Symbol ID -->
    <use :xlink:href="symbolId" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 图标名称（对应 iconfont 中的 symbol id）
  // 例如：icon-account 只需传 "account"
  name: {
    type: String,
    required: true
  },
  // 自定义类名
  className: {
    type: String,
    default: ''
  }
})

// 计算属性：拼接出完整的 Symbol ID（如 #icon-account）
const symbolId = computed(() => `#icon-${props.name}`)
</script>

<style scoped>
/* 样式已在 index.html 中全局定义，此处可不写 */
/* 若需局部微调，可在此添加 */
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
