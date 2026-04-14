# Vue常见代码	

[TOC]



## Vue架构类

### 1.父传子实现

#### 1.1父组件通讯

```vue
<template>
  <div>
    <!-- 静态传递 -->
    <ChildComponent 
      title="静态标题"
      :count="5"
    />
    <!-- 动态传递 -->
    <ChildComponent 
      :title="title"
      :count="count"
      :user="user"
      :items="items"
    />
    
    <button @click="updateCount">增加计数</button>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import ChildComponent from './ChildComponent.vue'

// 定义要传递的数据
const title = ref('这是标题')
const count = ref(10)

const user = reactive({
  name: '张三',
  age: 25
})

const items = reactive([
  { id: 1, name: '项目1' },
  { id: 2, name: '项目2' }
])

// 可以更新的函数
function updateCount() {
  count.value++
}
</script>
```

#### 1.2子组件实现

```vue
<template>
  <div>
    <h2>{{ title }}</h2>
    <p>计数: {{ count }}</p>
    <p>用户名: {{ user.name }}</p>
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.name }}</li>
    </ul>
  </div>
</template>

<script setup>
// 使用defineProps定义props
const props = defineProps({
  // 基本类型
  title: {
    type: String,
    required: true
  },
  // 带默认值
  count: {
    type: Number,
    default: 0
  },
  // 对象类型
  user: {
    type: Object,
    default: () => ({})
  },
  // 数组类型
  items: {
    type: Array,
    default: () => []
  }
})

// 在模板中使用props
console.log(props.title) // 访问props
console.log(props.count) // 访问props
</script>
```

### 2.子传父通讯

#### 2.1 子组件

```vue
<template>
  <div>
    <!-- 通过输入框触发 -->
    <input 
      :value="modelValue" 
      @input="handleInput"
      placeholder="输入内容"
    />
    <!-- 通过按钮触发 -->
    <button @click="handleSubmit">提交</button>
    <!-- 带参数的点击事件 -->
    <button @click="handleClick(1)">删除项目1</button>
    <!-- 直接触发 -->
    <button @click="triggerCustomEvent">触发自定义事件</button>
  </div>
</template>

<script setup>
// 使用defineEmits定义要触发的事件
const emit = defineEmits([
  'update:title',  // 更新title事件
  'submit',         // 提交事件
  'delete',         // 删除事件
  'custom-event'    // 自定义事件
])

// 或者定义带验证的事件对象
const emit = defineEmits({
  // 无验证
  'update:title': null,
  
  // 带验证函数
  'submit': (payload) => {
    // 验证payload
    if (payload && payload.name) {
      return true
    }
    console.warn('提交数据无效')
    return false
  }
})

// 触发事件的函数
function handleInput(event) {
  // 传递一个值
  emit('update:title', event.target.value)
}

function handleSubmit() {
  // 传递多个值（通过对象）
  emit('submit', {
    name: '数据',
    value: 123
  })
}

function handleClick(id) {
  // 传递参数
  emit('delete', id)
}

function triggerCustomEvent() {
  // 触发自定义事件
  emit('custom-event', { data: '自定义数据' })
}
</script>

```

#### 2,2 父组件实现

```vue
<template>
  <div>
    <h1>当前标题: {{ title }}</h1>
    
    <!-- 监听子组件事件 -->
    <ChildComponent
      :modelValue="title"
      @update:title="handleTitleUpdate"
      @submit="handleSubmit"
      @delete="handleDelete"
      @custom-event="handleCustomEvent"
    />
    
    <!-- 内联处理 -->
    <ChildComponent
      @submit="(data) => console.log('内联处理:', data)"
    />
  </div>
</template>

// ParentComponent.vue
<script setup>
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

// 父组件的数据
const title = ref('初始标题')
const formData = ref({})

// 处理子组件事件的方法
function handleTitleUpdate(newTitle) {
  console.log('收到新标题:', newTitle)
  title.value = newTitle
}

function handleSubmit(data) {
  console.log('收到提交数据:', data)
  formData.value = data
  // 可以在这里发送API请求等
}

function handleDelete(id) {
  console.log('要删除的项目ID:', id)
  // 执行删除操作
}

function handleCustomEvent(data) {
  console.log('自定义事件数据:', data)
}
</script>


```

### 3.子传父Vue3特性版本

#### 3.1 多v-model绑定（Vue3新特性）

```vue
// ChildComponent.vue 子组件写法
<script setup>
defineProps(['firstName', 'lastName'])
const emit = defineEmits(['update:firstName', 'update:lastName'])

function updateFirstName(e) {
  emit('update:firstName', e.target.value)
}

function updateLastName(e) {
  emit('update:lastName', e.target.value)
}
</script>

<template>
  <input :value="firstName" @input="updateFirstName" />
  <input :value="lastName" @input="updateLastName" />
</template>

// ParentComponent.vue
<script setup>
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

const firstName = ref('张')
const lastName = ref('三')
</script>

<template>
  <!-- 多v-model绑定 -->
  <ChildComponent
    v-model:firstName="firstName"
    v-model:lastName="lastName"
  />
</template>
```

## JS代码类

### 1 数组类

#### 1.1 数组中是否包含重复内容

- searchElement：要查找的元素。

- fromIndex（可选）：从该索引位置开始查找，默认为 0。如果为负值，则从 array.length + fromIndex开始查找。

```js
array.includes(searchElement, fromIndex)
```

