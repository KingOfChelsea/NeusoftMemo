<template>
  <div ref="scrollContainer" class="virtual-scroll-container" @scroll="handleScroll">
    <div class="virtual-scroll-wrapper" :style="{ height: `${totalHeight}px` }">
      <div class="virtual-scroll-content" :style="{ transform: `translateY(${offset}px)` }">
        <slot v-for="item in visibleItems" :key="item.id" :item="item" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  itemHeight: {
    type: Number,
    default: 60
  },
  bufferSize: {
    type: Number,
    default: 5
  }
});

const emit = defineEmits(['visible-change']);

const scrollContainer = ref(null);
const containerHeight = ref(0);
const scrollTop = ref(0);
const visibleCount = ref(0);

// 计算可见项
const visibleItems = computed(() => {
  const start = Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.bufferSize);
  const end = Math.min(
    props.items.length,
    Math.ceil((scrollTop.value + containerHeight.value) / props.itemHeight) + props.bufferSize
  );

  return props.items.slice(start, end);
});

// 计算总高度
const totalHeight = computed(() => {
  return props.items.length * props.itemHeight;
});

// 计算偏移量
const offset = computed(() => {
  const start = Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.bufferSize);
  return start * props.itemHeight;
});

// 处理滚动
const handleScroll = () => {
  if (scrollContainer.value) {
    scrollTop.value = scrollContainer.value.scrollTop;
  }
};

// 更新容器高度
const updateContainerHeight = () => {
  if (scrollContainer.value) {
    containerHeight.value = scrollContainer.value.clientHeight;
    visibleCount.value = Math.ceil(containerHeight.value / props.itemHeight) + props.bufferSize * 2;
  }
};

// 观察可见项变化
watch(visibleItems, (newVisibleItems) => {
  emit('visible-change', newVisibleItems);
});

// 监听items变化
watch(() => props.items, () => {
  // 如果items变化，重置滚动位置
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0;
  }
});

// 生命周期
onMounted(() => {
  updateContainerHeight();
  window.addEventListener('resize', updateContainerHeight);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerHeight);
});
</script>

<style scoped lang="scss">
.virtual-scroll-container {
  height: 100%;
  overflow-y: auto;
  position: relative;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background: #a8a8a8;
    }
  }
}

.virtual-scroll-wrapper {
  position: relative;
  width: 100%;
}

.virtual-scroll-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  will-change: transform;
}
</style>
