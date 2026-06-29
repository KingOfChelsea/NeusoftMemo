<template>
    <el-dialog
        v-model="visible"
        title="个人信息中心"
        width="720px"
        :close-on-click-modal="false"
        @close="handleClose"
        class="profile-dialog"
        destroy-on-close
    >
        <div class="profile-header">
            <div class="avatar-section">
                <div
                    class="avatar-wrapper"
                    :class="{ 'has-avatar': formData.avatar }"
                >
                    <!-- 根据条件显示不同头像 -->
                    <el-avatar
                        v-if="!isGeneratingAvatar"
                        :size="90"
                        :src="currentAvatarUrl"
                        class="profile-avatar"
                        shape="circle"
                        fit="cover"
                        @error="handleAvatarError"
                    >
                        <span class="avatar-placeholder">
                            {{
                                formData.name
                                    ? formData.name.charAt(0).toUpperCase()
                                    : '?'
                            }}
                        </span>
                    </el-avatar>

                    <!-- 生成中的占位 -->
                    <div v-else class="generating-avatar">
                        <el-icon class="loading-icon"><Loading /></el-icon>
                        <span>生成中...</span>
                    </div>

                    <div class="avatar-ring"></div>

                    <div
                        class="avatar-overlay"
                        @click="showAvatarMenu = !showAvatarMenu"
                    >
                        <div class="overlay-content">
                            <el-icon class="camera-icon"
                                ><CameraFilled
                            /></el-icon>
                            <span>更换头像</span>
                        </div>
                    </div>

                    <div class="status-indicator online">
                        <span class="status-dot"></span>
                    </div>
                </div>

                <!-- 头像操作菜单 -->
                <transition name="slide-fade">
                    <div v-if="showAvatarMenu" class="avatar-menu">
                        <div class="menu-item" @click="openUrlInput">
                            <el-icon><Link /></el-icon>
                            <span>网络图片</span>
                        </div>
                        <div class="menu-item" @click="generateByName">
                            <el-icon><MagicStick /></el-icon>
                            <span>姓名生成</span>
                        </div>
                        <div class="menu-item" @click="generateByInitials">
                            <el-icon><MagicStick /></el-icon>
                            <span>首字母生成</span>
                        </div>
                        <div class="menu-item" @click="generateRandomColor">
                            <el-icon><MagicStick /> </el-icon>
                            <span>随机色彩</span>
                        </div>
                    </div>
                </transition>

                <div class="avatar-info">
                    <h2 class="user-name">
                        {{ formData.name || '未设置姓名' }}
                    </h2>
                    <p class="user-nickname" v-if="formData.nickname">
                        @{{ formData.nickname }}
                    </p>
                    <p class="user-signature">
                        {{ formData.signature || '这个人很懒，什么都没留下~' }}
                    </p>
                </div>
            </div>
        </div>

        <!-- URL输入对话框 -->
        <el-dialog
            v-model="showUrlDialog"
            title="输入图片链接"
            width="400px"
            append-to-body
            class="url-dialog"
        >
            <el-input
                v-model="tempUrl"
                placeholder="请输入图片URL地址"
                clearable
                @keyup.enter="confirmUrl"
            >
                <template #prefix>
                    <el-icon><Link /></el-icon>
                </template>
            </el-input>
            <div v-if="tempUrl" class="url-preview">
                <img
                    :src="tempUrl"
                    @error="previewError = true"
                    @load="previewError = false"
                />
                <p v-if="previewError" class="error-text">
                    图片加载失败，请检查链接
                </p>
            </div>
            <template #footer>
                <el-button @click="showUrlDialog = false">取消</el-button>
                <el-button type="primary" @click="confirmUrl">确认</el-button>
            </template>
        </el-dialog>

        <el-divider />

        <!-- 其余标签页内容保持不变 -->
        <el-tabs v-model="activeTab" class="profile-tabs" :stretch="true">
            <!-- 基本信息 -->
            <el-tab-pane label="基本信息" name="basic">
                <div class="tab-content">
                    <el-form
                        ref="basicFormRef"
                        :model="formData"
                        :rules="basicRules"
                        label-position="top"
                        class="info-form"
                    >
                        <el-row :gutter="24">
                            <el-col :span="12">
                                <el-form-item label="真实姓名" prop="name">
                                    <el-input
                                        v-model="formData.name"
                                        placeholder="请输入真实姓名"
                                        clearable
                                        @input="handleNameChange"
                                    >
                                        <template #prefix>
                                            <el-icon><User /></el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="昵称" prop="nickname">
                                    <el-input
                                        v-model="formData.nickname"
                                        placeholder="给自己取个昵称吧"
                                        clearable
                                    >
                                        <template #prefix>
                                            <el-icon><EditPen /></el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row :gutter="24">
                            <el-col :span="12">
                                <el-form-item label="性别">
                                    <el-radio-group
                                        v-model="formData.gender"
                                        class="gender-group"
                                    >
                                        <el-radio-button label="男">
                                            <el-icon><Male /></el-icon>
                                            男
                                        </el-radio-button>
                                        <el-radio-button label="女">
                                            <el-icon><Female /></el-icon>
                                            女
                                        </el-radio-button>
                                        <el-radio-button label="保密">
                                            <el-icon><Hide /></el-icon>
                                            保密
                                        </el-radio-button>
                                    </el-radio-group>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="出生日期">
                                    <el-date-picker
                                        v-model="formData.birthday"
                                        type="date"
                                        placeholder="选择出生日期"
                                        format="YYYY年MM月DD日"
                                        value-format="YYYY-MM-DD"
                                        style="width: 100%"
                                    />
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-form-item label="个人签名">
                            <el-input
                                v-model="formData.signature"
                                type="textarea"
                                :rows="2"
                                placeholder="用一句话介绍自己..."
                                maxlength="100"
                                show-word-limit
                                class="styled-textarea"
                            />
                        </el-form-item>

                        <el-form-item label="个人简介">
                            <el-input
                                v-model="formData.bio"
                                type="textarea"
                                :rows="3"
                                placeholder="详细介绍一下自己的经历、特长和兴趣..."
                                maxlength="500"
                                show-word-limit
                                class="styled-textarea"
                            />
                        </el-form-item>
                    </el-form>
                </div>
            </el-tab-pane>

            <!-- 联系方式 -->
            <el-tab-pane label="联系方式" name="contact">
                <div class="tab-content">
                    <el-form
                        ref="contactFormRef"
                        :model="formData"
                        :rules="contactRules"
                        label-position="top"
                        class="info-form"
                    >
                        <el-row :gutter="24">
                            <el-col :span="12">
                                <el-form-item label="电子邮箱" prop="email">
                                    <el-input
                                        v-model="formData.email"
                                        placeholder="example@email.com"
                                        clearable
                                    >
                                        <template #prefix>
                                            <el-icon><Message /></el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="手机号码" prop="phone">
                                    <el-input
                                        v-model="formData.phone"
                                        placeholder="138****0000"
                                        clearable
                                    >
                                        <template #prefix>
                                            <el-icon><Phone /></el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row :gutter="24">
                            <el-col :span="12">
                                <el-form-item label="微信号">
                                    <el-input
                                        v-model="formData.wechat"
                                        placeholder="微信号"
                                        clearable
                                    >
                                        <template #prefix>
                                            <el-icon><ChatDotSquare /></el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="QQ号">
                                    <el-input
                                        v-model="formData.qq"
                                        placeholder="QQ号码"
                                        clearable
                                    >
                                        <template #prefix>
                                            <el-icon><ChatLineRound /></el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-form-item label="所在地">
                            <el-cascader
                                v-model="formData.address"
                                :options="regionOptions"
                                placeholder="选择省/市/区"
                                style="width: 360px"
                                clearable
                            />
                        </el-form-item>

                        <el-form-item label="详细地址">
                            <el-input
                                v-model="formData.detailAddress"
                                placeholder="街道、门牌号等详细信息"
                                clearable
                            >
                                <template #prefix>
                                    <el-icon><Location /></el-icon>
                                </template>
                            </el-input>
                        </el-form-item>
                    </el-form>
                </div>
            </el-tab-pane>

            <!-- 职业信息 -->
            <el-tab-pane label="职业信息" name="career">
                <div class="tab-content">
                    <el-form
                        ref="careerFormRef"
                        :model="formData"
                        label-position="top"
                        class="info-form"
                    >
                        <el-row :gutter="24">
                            <el-col :span="12">
                                <el-form-item label="所在公司">
                                    <el-input
                                        v-model="formData.company"
                                        placeholder="输入公司名称"
                                        clearable
                                    >
                                        <template #prefix>
                                            <el-icon
                                                ><OfficeBuilding
                                            /></el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="担任职位">
                                    <el-input
                                        v-model="formData.position"
                                        placeholder="输入职位名称"
                                        clearable
                                    >
                                        <template #prefix>
                                            <el-icon><Briefcase /></el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row :gutter="24">
                            <el-col :span="12">
                                <el-form-item label="所属行业">
                                    <el-select
                                        v-model="formData.industry"
                                        placeholder="选择行业"
                                        style="width: 100%"
                                        clearable
                                    >
                                        <el-option
                                            v-for="item in industryOptions"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="工作年限">
                                    <el-select
                                        v-model="formData.workYears"
                                        placeholder="选择年限"
                                        style="width: 100%"
                                        clearable
                                    >
                                        <el-option
                                            v-for="item in workYearOptions"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-form-item label="技能标签">
                            <el-select
                                v-model="formData.skills"
                                multiple
                                filterable
                                allow-create
                                default-first-option
                                placeholder="输入技能后按回车添加"
                                style="width: 480px"
                                class="skills-select"
                            >
                                <el-option
                                    v-for="skill in commonSkills"
                                    :key="skill"
                                    :label="skill"
                                    :value="skill"
                                />
                            </el-select>
                        </el-form-item>

                        <el-form-item label="教育经历">
                            <div
                                v-for="(edu, index) in formData.education"
                                :key="index"
                                class="education-card"
                            >
                                <div class="education-header">
                                    <span class="edu-index"
                                        >#{{ index + 1 }}</span
                                    >
                                    <el-button
                                        type="danger"
                                        :icon="Delete"
                                        circle
                                        size="small"
                                        @click="removeEducation(index)"
                                    />
                                </div>
                                <el-row :gutter="16">
                                    <el-col :span="8">
                                        <el-input
                                            v-model="edu.school"
                                            placeholder="学校名称"
                                            size="default"
                                        />
                                    </el-col>
                                    <el-col :span="6">
                                        <el-input
                                            v-model="edu.major"
                                            placeholder="专业"
                                            size="default"
                                        />
                                    </el-col>
                                    <el-col :span="5">
                                        <el-select
                                            v-model="edu.degree"
                                            placeholder="学历"
                                            style="width: 100%"
                                            size="default"
                                        >
                                            <el-option
                                                label="高中"
                                                value="high"
                                            />
                                            <el-option
                                                label="大专"
                                                value="college"
                                            />
                                            <el-option
                                                label="本科"
                                                value="bachelor"
                                            />
                                            <el-option
                                                label="硕士"
                                                value="master"
                                            />
                                            <el-option
                                                label="博士"
                                                value="doctor"
                                            />
                                        </el-select>
                                    </el-col>
                                    <el-col :span="5">
                                        <el-date-picker
                                            v-model="edu.year"
                                            type="year"
                                            placeholder="毕业年份"
                                            value-format="YYYY"
                                            style="width: 100%"
                                            size="default"
                                        />
                                    </el-col>
                                </el-row>
                            </div>
                            <el-button
                                type="primary"
                                plain
                                @click="addEducation"
                                class="add-btn"
                            >
                                <el-icon><Plus /></el-icon>
                                添加教育经历
                            </el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </el-tab-pane>

            <!-- 社交账号 -->
            <el-tab-pane label="社交账号" name="social">
                <div class="tab-content">
                    <el-form
                        ref="socialFormRef"
                        :model="formData"
                        label-position="top"
                        class="info-form"
                    >
                        <el-row :gutter="24">
                            <el-col :span="12">
                                <el-form-item label="GitHub">
                                    <el-input
                                        v-model="formData.github"
                                        placeholder="GitHub主页链接"
                                        clearable
                                    >
                                        <template #prefix>
                                            <el-icon><Connection /></el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="个人博客">
                                    <el-input
                                        v-model="formData.blog"
                                        placeholder="博客或网站地址"
                                        clearable
                                    >
                                        <template #prefix>
                                            <el-icon><Link /></el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row :gutter="24">
                            <el-col :span="12">
                                <el-form-item label="微博">
                                    <el-input
                                        v-model="formData.weibo"
                                        placeholder="微博主页链接"
                                        clearable
                                    >
                                        <template #prefix>
                                            <el-icon><Promotion /></el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="知乎">
                                    <el-input
                                        v-model="formData.zhihu"
                                        placeholder="知乎主页链接"
                                        clearable
                                    >
                                        <template #prefix>
                                            <el-icon><Reading /></el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row :gutter="24">
                            <el-col :span="12">
                                <el-form-item label="B站">
                                    <el-input
                                        v-model="formData.bilibili"
                                        placeholder="B站空间链接"
                                        clearable
                                    >
                                        <template #prefix>
                                            <el-icon><VideoCamera /></el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="抖音">
                                    <el-input
                                        v-model="formData.tiktok"
                                        placeholder="抖音主页链接"
                                        clearable
                                    >
                                        <template #prefix>
                                            <el-icon><Microphone /></el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                </div>
            </el-tab-pane>

            <!-- 个人偏好 -->
            <el-tab-pane label="个人偏好" name="preferences">
                <div class="tab-content">
                    <el-form
                        ref="prefFormRef"
                        :model="formData"
                        label-position="top"
                        class="info-form"
                    >
                        <el-form-item label="兴趣爱好">
                            <el-checkbox-group
                                v-model="formData.hobbies"
                                class="hobby-group"
                            >
                                <el-checkbox
                                    v-for="hobby in hobbyOptions"
                                    :key="hobby"
                                    :label="hobby"
                                    border
                                >
                                    {{ hobby }}
                                </el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>

                        <el-row :gutter="24">
                            <el-col :span="8">
                                <el-form-item label="喜欢的音乐">
                                    <el-input
                                        v-model="formData.favoriteMusic"
                                        placeholder="音乐风格或歌手"
                                        clearable
                                    />
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="喜欢的电影">
                                    <el-input
                                        v-model="formData.favoriteMovies"
                                        placeholder="电影类型或影片"
                                        clearable
                                    />
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="喜欢的书籍">
                                    <el-input
                                        v-model="formData.favoriteBooks"
                                        placeholder="书籍类型"
                                        clearable
                                    />
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-form-item label="饮食习惯">
                            <el-checkbox-group
                                v-model="formData.dietary"
                                class="diet-group"
                            >
                                <el-checkbox
                                    v-for="diet in dietOptions"
                                    :key="diet"
                                    :label="diet"
                                    border
                                >
                                    {{ diet }}
                                </el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>

                        <el-form-item label="运动习惯">
                            <el-select
                                v-model="formData.sports"
                                multiple
                                filterable
                                allow-create
                                placeholder="选择或输入运动项目"
                                style="width: 420px"
                                class="sports-select"
                            >
                                <el-option
                                    v-for="sport in sportOptions"
                                    :key="sport"
                                    :label="sport"
                                    :value="sport"
                                />
                            </el-select>
                        </el-form-item>

                        <el-form-item label="作息时间">
                            <div class="sleep-time-wrapper">
                                <el-slider
                                    v-model="formData.sleepTime"
                                    :min="0"
                                    :max="24"
                                    range
                                    :marks="sleepMarks"
                                    show-stops
                                    style="width: 460px"
                                />
                                <span class="sleep-time-label">
                                    睡眠时段：{{ formData.sleepTime[0] }}:00 -
                                    {{ formData.sleepTime[1] }}:00
                                </span>
                            </div>
                        </el-form-item>
                    </el-form>
                </div>
            </el-tab-pane>
        </el-tabs>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="resetAll" :icon="Refresh"
                    >重置全部</el-button
                >
                <el-button @click="visible = false">取消</el-button>
                <el-button
                    type="primary"
                    @click="submitSave"
                    :icon="Check"
                    size="large"
                >
                    保存信息
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import {
    User,
    EditPen,
    Male,
    Female,
    Hide,
    CameraFilled,
    Message,
    Phone,
    ChatDotSquare,
    ChatLineRound,
    Location,
    OfficeBuilding,
    Briefcase,
    Delete,
    Plus,
    Connection,
    Link,
    Promotion,
    Reading,
    VideoCamera,
    Microphone,
    Refresh,
    Check,
    Loading,
    MagicStick,
} from '@element-plus/icons-vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    userData: {
        type: Object,
        default: () => ({}),
    },
});

const emit = defineEmits(['update:modelValue', 'save']);

const basicFormRef = ref(null);
const contactFormRef = ref(null);
const careerFormRef = ref(null);
const socialFormRef = ref(null);
const prefFormRef = ref(null);
const activeTab = ref('basic');

// 头像相关状态
const showAvatarMenu = ref(false);
const showUrlDialog = ref(false);
const tempUrl = ref('');
const previewError = ref(false);
const isGeneratingAvatar = ref(false);
const avatarError = ref(false);

// 预设头像颜色
const avatarColors = [
    '#409eff',
    '#67c23a',
    '#e6a23c',
    '#f56c6c',
    '#909399',
    '#b37feb',
    '#5cdbd3',
    '#ff85c0',
    '#597ef7',
    '#73d13d',
    '#ffc53d',
    '#ff7875',
];

const defaultFormData = {
    name: '',
    nickname: '',
    gender: '保密',
    birthday: '',
    signature: '',
    bio: '',
    avatar: '',
    email: '',
    phone: '',
    wechat: '',
    qq: '',
    address: [],
    detailAddress: '',
    company: '',
    position: '',
    industry: '',
    workYears: '',
    skills: [],
    education: [],
    github: '',
    blog: '',
    weibo: '',
    zhihu: '',
    bilibili: '',
    tiktok: '',
    hobbies: [],
    favoriteMusic: '',
    favoriteMovies: '',
    favoriteBooks: '',
    dietary: [],
    sports: [],
    sleepTime: [22, 7],
};

const formData = reactive({ ...defaultFormData });

// 当前头像URL（支持生成的SVG数据URL）
const currentAvatarUrl = computed(() => {
    if (formData.avatar && !avatarError.value) {
        return formData.avatar;
    }
    return generateInitialsAvatar();
});

// 生成首字母头像SVG
const generateInitialsAvatar = () => {
    const name = formData.name || '?';
    const initials = name.charAt(0).toUpperCase();
    const colorIndex = name.charCodeAt(0) % avatarColors.length;
    const bgColor = avatarColors[colorIndex];

    // 使用 encodeURIComponent 处理中文
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 90">
      <rect width="90" height="90" rx="45" fill="${bgColor}"/>
      <text x="45" y="58" text-anchor="middle" fill="white" font-size="36" font-weight="bold" font-family="Arial">${initials}</text>
    </svg>
  `;
    // 使用 encodeURIComponent 替代 btoa
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

// 生成基于姓名的多彩头像
const generateByNameAvatar = (name) => {
    if (!name) return;

    isGeneratingAvatar.value = true;
    setTimeout(() => {
        const colors = generateGradientColors(name);
        const initials = name.substring(0, 2).toUpperCase();

        const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 90">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors[0]}"/>
            <stop offset="100%" style="stop-color:${colors[1]}"/>
          </linearGradient>
        </defs>
        <rect width="90" height="90" rx="45" fill="url(#grad)"/>
        <text x="45" y="55" text-anchor="middle" fill="white" font-size="28" font-weight="bold" font-family="Arial">${initials}</text>
      </svg>
    `;
        // 使用 encodeURIComponent 替代 btoa
        formData.avatar = `data:image/svg+xml,${encodeURIComponent(svg)}`;
        avatarError.value = false;
        isGeneratingAvatar.value = false;
        showAvatarMenu.value = false;
        ElMessage.success('头像生成成功！');
    }, 500);
};

// 生成渐变色
const generateGradientColors = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const color1 = `hsl(${Math.abs(hash) % 360}, 70%, 60%)`;
    const color2 = `hsl(${(Math.abs(hash) + 60) % 360}, 70%, 55%)`;

    return [color1, color2];
};

// 生成随机色彩头像
const generateRandomColorAvatar = () => {
    isGeneratingAvatar.value = true;
    setTimeout(() => {
        const hue1 = Math.floor(Math.random() * 360);
        const hue2 = (hue1 + 60 + Math.floor(Math.random() * 60)) % 360;

        const color1 = `hsl(${hue1}, 70%, 60%)`;
        const color2 = `hsl(${hue2}, 65%, 55%)`;

        const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 90">
        <defs>
          <radialGradient id="radGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" style="stop-color:${color1}"/>
            <stop offset="100%" style="stop-color:${color2}"/>
          </radialGradient>
        </defs>
        <rect width="90" height="90" rx="45" fill="url(#radGrad)"/>
        <circle cx="35" cy="35" r="8" fill="rgba(255,255,255,0.3)"/>
      </svg>
    `;
        // 使用 encodeURIComponent 替代 btoa
        formData.avatar = `data:image/svg+xml,${encodeURIComponent(svg)}`;
        avatarError.value = false;
        isGeneratingAvatar.value = false;
        showAvatarMenu.value = false;
        ElMessage.success('随机头像生成成功！');
    }, 500);
};

// 头像操作方法
const openUrlInput = () => {
    showAvatarMenu.value = false;
    tempUrl.value = '';
    previewError.value = false;
    showUrlDialog.value = true;
};

const confirmUrl = () => {
    if (!tempUrl.value) {
        ElMessage.warning('请输入图片链接');
        return;
    }
    formData.avatar = tempUrl.value;
    avatarError.value = false;
    showUrlDialog.value = false;
    showAvatarMenu.value = false;
    ElMessage.success('头像已更新');
};

const generateByName = () => {
    if (!formData.name) {
        ElMessage.warning('请先输入姓名');
        return;
    }
    generateByNameAvatar(formData.name);
};

const generateByInitials = () => {
    isGeneratingAvatar.value = true;
    setTimeout(() => {
        formData.avatar = generateInitialsAvatar();
        avatarError.value = false;
        isGeneratingAvatar.value = false;
        showAvatarMenu.value = false;
        ElMessage.success('首字母头像已生成');
    }, 300);
};

const generateRandomColor = () => {
    generateRandomColorAvatar();
};

const handleAvatarError = () => {
    avatarError.value = true;
    return false;
};

const handleNameChange = () => {
    // 如果当前没有自定义头像，自动更新首字母头像
    if (!formData.avatar || formData.avatar.startsWith('data:image/svg+xml')) {
        formData.avatar = generateInitialsAvatar();
    }
};

watch(
    () => props.userData,
    (newVal) => {
        if (Object.keys(newVal).length > 0) {
            Object.assign(formData, { ...defaultFormData, ...newVal });
            avatarError.value = false;
        }
    },
    { deep: true, immediate: true },
);

const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
});

const basicRules = {
    name: [
        { required: true, message: '请输入姓名', trigger: 'blur' },
        { min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'blur' },
    ],
    nickname: [
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
    ],
};

const contactRules = {
    email: [
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
    ],
    phone: [
        {
            pattern: /^1[3-9]\d{9}$/,
            message: '请输入正确的手机号',
            trigger: 'blur',
        },
    ],
};

const regionOptions = [
    {
        value: 'guangdong',
        label: '广东省',
        children: [
            { value: 'guangzhou', label: '广州市' },
            { value: 'shenzhen', label: '深圳市' },
            { value: 'zhuhai', label: '珠海市' },
        ],
    },
    {
        value: 'beijing',
        label: '北京市',
        children: [
            { value: 'haidian', label: '海淀区' },
            { value: 'chaoyang', label: '朝阳区' },
        ],
    },
    {
        value: 'shanghai',
        label: '上海市',
        children: [
            { value: 'pudong', label: '浦东新区' },
            { value: 'xuhui', label: '徐汇区' },
        ],
    },
];

const industryOptions = [
    { value: 'tech', label: '互联网/IT' },
    { value: 'finance', label: '金融' },
    { value: 'education', label: '教育' },
    { value: 'medical', label: '医疗' },
    { value: 'manufacturing', label: '制造业' },
    { value: 'realestate', label: '房地产' },
    { value: 'retail', label: '零售' },
    { value: 'media', label: '媒体' },
    { value: 'legal', label: '法律' },
    { value: 'consulting', label: '咨询' },
];

const workYearOptions = [
    { value: 'student', label: '在校学生' },
    { value: 'fresh', label: '应届毕业生' },
    { value: '1-3', label: '1-3年' },
    { value: '3-5', label: '3-5年' },
    { value: '5-10', label: '5-10年' },
    { value: '10+', label: '10年以上' },
];

const commonSkills = [
    'Vue.js',
    'React',
    'Node.js',
    'Python',
    'Java',
    'TypeScript',
    'Docker',
    'Kubernetes',
    'MySQL',
    'Redis',
    'Go',
    'Rust',
    'AWS',
    'Linux',
    'Git',
];

const hobbyOptions = [
    '阅读',
    '旅行',
    '摄影',
    '绘画',
    '音乐',
    '游戏',
    '烹饪',
    '健身',
    '编程',
    '写作',
    '园艺',
    '收藏',
];

const dietOptions = ['素食', '无辣不欢', '甜食爱好者', '咖啡依赖', '茶文化'];

const sportOptions = [
    '跑步',
    '游泳',
    '篮球',
    '足球',
    '羽毛球',
    '乒乓球',
    '瑜伽',
    '骑行',
    '滑雪',
    '攀岩',
];

const sleepMarks = {
    0: '0点',
    6: '6点',
    12: '12点',
    18: '18点',
    24: '24点',
};

const addEducation = () => {
    formData.education.push({
        school: '',
        major: '',
        degree: '',
        year: '',
    });
};

const removeEducation = (index) => {
    formData.education.splice(index, 1);
};

const submitSave = async () => {
    const forms = [
        basicFormRef,
        contactFormRef,
        careerFormRef,
        socialFormRef,
        prefFormRef,
    ];
    let isValid = true;

    for (const form of forms) {
        if (form.value) {
            try {
                await form.value.validate();
            } catch {
                isValid = false;
            }
        }
    }

    if (isValid) {
        emit('save', { ...formData });
        visible.value = false;
        ElMessage.success('个人信息保存成功！');
    } else {
        ElMessage.warning('请检查表单填写是否正确');
    }
};

const resetAll = () => {
    Object.assign(formData, { ...defaultFormData });
    activeTab.value = 'basic';
    avatarError.value = false;
    ElMessage.info('已重置为默认设置');
};

const handleClose = () => {
    showAvatarMenu.value = false;
};
</script>

<style lang="scss" scoped>
.profile-dialog {
    :deep(.el-dialog__header) {
        padding: 25px 32px 0;
    }

    :deep(.el-dialog__body) {
        padding: 20px 32px;
    }

    :deep(.el-dialog__footer) {
        padding: 0 32px 25px;
    }
}

.profile-header {
    padding: 15px 0;

    .avatar-section {
        display: flex;
        align-items: center;
        gap: 35px;
        position: relative;

        .avatar-wrapper {
            position: relative;
            width: 98px;
            height: 98px;
            flex-shrink: 0;

            .profile-avatar {
                width: 88px;
                height: 89px;
                position: absolute;
                top: 5px;
                left: 5px;
                z-index: 2;
                border: 3px solid #ecf5ff;
                box-shadow: 0 4px 15px rgba(64, 128, 240, 0.2);
                transition: all 0.4s cubic-bezier(0.34, 1.65, 0.54, 1);
                cursor: pointer;

                &:hover {
                    transform: scale(1.03);
                    box-shadow: 0 6px 20px rgba(64, 128, 240, 0.35);
                }

                .avatar-placeholder {
                    font-size: 42px;
                    font-weight: 800;
                    background: linear-gradient(
                        135deg,
                        #667eea 0%,
                        #764ba2 100%
                    );
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
            }

            .generating-avatar {
                width: 88px;
                height: 89px;
                position: absolute;
                top: 5px;
                left: 5px;
                z-index: 2;
                background: #f0f2f5;
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 4px;
                color: #909399;
                font-size: 12px;

                .loading-icon {
                    font-size: 24px;
                    animation: spin 1s linear infinite;
                }
            }

            .avatar-ring {
                position: absolute;
                top: 0;
                left: 0;
                width: 96px;
                height: 93px;
                border-radius: 55%;
                background: linear-gradient(
                    135deg,
                    #667eea 0%,
                    #764ba2 45%,
                    #f093fb 72%,
                    #4facfe 105%
                );
                animation: ringRotate 3s linear infinite;
                z-index: 1;

                &::before {
                    content: '';
                    position: absolute;
                    top: 5px;
                    left: 5px;
                    right: 5px;
                    bottom: 5px;
                    background: white;
                    border-radius: 53%;
                }
            }

            .avatar-overlay {
                position: absolute;
                top: 5px;
                left: 5px;
                width: 87px;
                height: 83px;
                border-radius: 51%;
                background: linear-gradient(
                    135deg,
                    rgba(107, 127, 237, 0.91),
                    rgba(121, 79, 168, 0.89)
                );
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 3;
                opacity: 0;
                transition: all 0.37s cubic-bezier(0.216, 0.62, 0.358, 1);
                cursor: pointer;

                .overlay-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    color: white;
                    font-size: 12px;
                    letter-spacing: 1px;
                    transform: translateY(5px);
                    transition: transform 0.31s;

                    .camera-icon {
                        font-size: 27px;
                        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.21));
                    }
                }

                &:hover {
                    .overlay-content {
                        transform: translateY(0);
                    }
                }
            }

            &:hover .avatar-overlay {
                opacity: 1;
            }

            .status-indicator {
                position: absolute;
                bottom: 7px;
                right: 7px;
                z-index: 4;
                width: 17px;
                height: 19px;
                background: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.153);

                &.online .status-dot {
                    background: #67c23a;
                    box-shadow: 0 0 6px rgba(106, 199, 59, 0.63);
                }

                .status-dot {
                    width: 11px;
                    height: 11px;
                    border-radius: 47%;
                    animation: pulse 2s ease-in-out infinite;
                }
            }
        }

        .avatar-menu {
            position: absolute;
            top: 110px;
            left: 0;
            z-index: 999;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
            padding: 8px;
            width: 160px;

            .menu-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 14px;
                cursor: pointer;
                border-radius: 8px;
                transition: all 0.2s;
                font-size: 14px;
                color: #303133;

                &:hover {
                    background: #f0f5ff;
                    color: #409eff;
                }

                .el-icon {
                    font-size: 18px;
                }
            }
        }

        .avatar-info {
            flex: 1;

            .user-name {
                margin: 0 0 4px;
                font-size: 24px;
                font-weight: 730;
                color: #303133;
                background: linear-gradient(136deg, #303133 0%, #606266 101%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .user-nickname {
                margin: 0 0 6px;
                font-size: 14px;
                color: #909399;
                font-style: italic;
            }

            .user-signature {
                margin: 0;
                font-size: 14px;
                color: #909399;
                line-height: 1.48;
                padding-left: 12px;
                position: relative;

                &::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    background: linear-gradient(181deg, #409eff, #67c23a);
                    border-radius: 2px;
                }
            }
        }
    }
}

.url-dialog {
    .url-preview {
        margin-top: 16px;
        text-align: center;

        img {
            max-width: 150px;
            max-height: 150px;
            border-radius: 8px;
            border: 1px solid #ebeef5;
        }

        .error-text {
            color: #f56c6c;
            font-size: 13px;
            margin-top: 8px;
        }
    }
}

.profile-tabs {
    :deep(.el-tabs__item) {
        font-size: 14px;
        padding: 0 20px;
    }

    :deep(.el-tabs__content) {
        padding: 24px 0 10px;
    }
}

.tab-content {
    min-height: 340px;
}

.info-form {
    :deep(.el-form-item__label) {
        font-weight: 510;
        color: #606266;
        padding-bottom: 6px;
    }

    :deep(.el-input__wrapper) {
        box-shadow: 0 0 0 1px #dcdfe6 inset;

        &:hover {
            box-shadow: 0 0 0 1px #c0c4cc inset;
        }

        &.is-focus {
            box-shadow: 0 0 0 1px #409eff inset;
        }
    }
}

.gender-group {
    :deep(.el-radio-button__inner) {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 20px;
    }
}

.styled-textarea {
    :deep(textarea) {
        line-height: 1.57;
    }
}

.education-card {
    background: #f8f9fb;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    transition: all 0.29s;

    &:hover {
        border-color: #c0c4cc;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.042);
    }

    .education-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .edu-index {
            font-size: 13px;
            color: #909399;
            font-weight: 507;
        }
    }
}

.add-btn {
    width: 210px;
    margin-top: 8px;
}

.hobby-group,
.diet-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    :deep(.el-checkbox) {
        margin-right: 0;
    }

    :deep(.el-checkbox__inner) {
        border-radius: 4px;
    }
}

.skills-select,
.sports-select {
    :deep(.el-select__tags) {
        gap: 4px;
    }

    :deep(.el-tag) {
        margin: 2px;
        border-radius: 4px;
    }
}

.sleep-time-wrapper {
    width: 530px;

    .sleep-time-label {
        display: block;
        margin-top: 12px;
        font-size: 13px;
        color: #909399;
        text-align: center;
    }
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>
