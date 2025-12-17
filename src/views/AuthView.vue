<script setup>
import { getTemplateDetail } from '@/apis/template';
import { useMediaQuery, useScreenOrientation } from '@vueuse/core';
import FilePreview from './file/FilePreview.vue';

const props = defineProps({
  id: {
    type: Number,
    default: 0,
  },
});
const router = useRouter();
const templateId = computed(() => props.id || +router.currentRoute.value.params.id || 0);
/**
 * @type {import('vue').Ref<import('../types/TemplateInfo').TemplateInfo|null>}
 */
const templateInfo = ref(null);
const loading = ref(false);
const swiperFileList = computed(() => {
  return [
    ...(templateInfo.value?.video_list || []),
    ...(templateInfo.value?.picture_list || []),
  ].filter((file) => file?.path);
});
/**
 * @type {import('tdesign-vue-next').ImageProps}
 */
const avatarImageProp = {
  fit: 'cover',
  lazy: true,
};
async function getTemplateInfo() {
  authDrawerVisible.value = false;
  loading.value = true;
  if (templateId.value) {
    try {
      const res = await getTemplateDetail(templateId.value);
      if (res instanceof Error) {
        throw res;
      } else if (res.code !== 0) {
        throw new Error(res.msg);
      } else {
        templateInfo.value = res.data;
        loading.value = false;
        if (!props.id) {
          window.document.title =
            /** @type {string} */ (templateInfo.value?.page_title) || '网关预登录认证管理系统';
        }
        startTimerForWaitTime();
      }
    } catch (error) {
      MessagePlugin.error(error.message);
      setTimeout(getTemplateInfo, 10000);
    }
  }
}

function startTimerForWaitTime() {
  if (!templateInfo.value?.wait_time || templateInfo.value.wait_time <= 0) {
    MessagePlugin.warning('未设置等待时间，默认30秒');
  }
  const wait_time = (+templateInfo.value?.wait_time || 30) * 1000;
  setTimeout(() => {
    authDrawerVisible.value = true;
  }, wait_time);
}

function handleAuth(type = 0) {
  if (![1, 2, 11].includes(type)) {
    return MessagePlugin.warning('未知认证方式');
  }
  const search = window.self.location.search;
  window.self.location.href = `	http://portal.ikuai8-wifi.com/Action/webauth-up?type=${type}${search.replace('?', '&')}`;
}

const swiperAutoPlay = ref(false);
const swiperInterval = ref(5000);
const refFilePreview = useTemplateRef('refFilePreview');
const visibleRefFilePreviewList = computed(() => {
  let list = [...refFilePreview.value];
  return list.slice(1, list.length - 1);
});
function handleSwiperChange(current = 0) {
  // console.log('当前轮播索引', current);
  visibleRefFilePreviewList.value.forEach((item) => {
    if (item.refElement instanceof HTMLVideoElement) {
      item.refElement.pause();
    }
  });
  const currentElement = visibleRefFilePreviewList.value.at(current)?.refElement;
  if (currentElement instanceof HTMLVideoElement) {
    currentElement.play();
    swiperAutoPlay.value = false;
    // console.log('当前视频，开始播放，自动轮播关闭');
  }
  if (currentElement instanceof HTMLImageElement) {
    swiperAutoPlay.value = true;
    // console.log('当前图片，自动轮播开启');
  }
}
/**
 * @param {Event} event
 */
function handleVideoTimeUpdate(event) {
  const currentElement = /** @type {HTMLVideoElement} */ (event.target);
  const restTime = (currentElement.duration - currentElement.currentTime) * 1000;
  // console.log('当前视频，剩余时间', restTime);
  swiperAutoPlay.value = restTime < swiperInterval.value;
  // if (swiperAutoPlay.value) {
  //   console.log('当前视频，播放即将结束，自动轮播开启', restTime);
  // }
}
const videoMuted = ref(true);
function handleUnmuted() {
  videoMuted.value = false;
}

const authDrawerVisible = ref(false);
watch(templateId, getTemplateInfo, { immediate: true });

const { isSupported: isScreenOrientationSupported, orientation } = useScreenOrientation();
const isLargeScreen = useMediaQuery('(min-width: 1024px)');
const authDrawerSize = computed(() => {
  let size = 'small';
  if (isScreenOrientationSupported.value && orientation.value.includes('landscape')) {
    size = isLargeScreen.value ? '12rem' : '11rem';
  }
  return size;
});
</script>

<template>
  <t-loading text="页面急速加载中..." :loading="loading" :indicator="false" fullscreen />
  <div
    class="relative"
    :class="props.id ? 'h-full w-full' : 'h-screen w-screen overflow-hidden'"
    @click="handleUnmuted"
  >
    <div
      class="m-auto flex h-full max-h-full w-full flex-col overflow-auto landscape:flex-row landscape:overflow-hidden"
    >
      <div
        class="relative h-0 pb-[calc(9/16*100%)] shadow landscape:h-full landscape:flex-1 landscape:p-0"
      >
        <div class="absolute top-0 left-0 h-full w-full overflow-hidden rounded bg-gray-200">
          <t-swiper
            :autoplay="swiperAutoPlay"
            class="!h-full overflow-hidden"
            @change="handleSwiperChange"
          >
            <t-swiper-item v-for="file in swiperFileList" :key="file.uuid" class="h-full">
              <file-preview
                ref="refFilePreview"
                class="h-full"
                :src="file.path"
                :muted="videoMuted"
                :controls="false"
                @timeupdate="handleVideoTimeUpdate"
              ></file-preview>
            </t-swiper-item>
          </t-swiper>
        </div>
      </div>
      <div
        class="m-4 flex flex-col space-y-4 landscape:h-full landscape:flex-2 landscape:overflow-auto"
      >
        <div class="flex items-center">
          <t-avatar
            shape="circle"
            size="4rem"
            :image="templateInfo?.head_picture?.path"
            :image-props="avatarImageProp"
            :alt="templateInfo?.page_title"
          ></t-avatar>
          <div class="ml-2 flex flex-1 flex-col overflow-hidden">
            <p
              class="text-lg font-medium text-nowrap text-ellipsis md:text-xl lg:text-2xl xl:text-3xl"
            >
              {{ templateInfo?.page_title }}
            </p>
            <p class="text-base text-nowrap text-ellipsis md:text-lg lg:text-xl xl:text-2xl">
              {{ templateInfo?.contact }}
            </p>
          </div>
        </div>
        <p class="indent-8 text-base md:text-lg lg:text-xl xl:text-2xl">
          {{ templateInfo?.introduction }}
        </p>
      </div>
    </div>
    <div class="absolute right-0 bottom-0 left-0 m-auto w-8 translate-y-1/3">
      <t-button shape="circle" theme="default" @click="authDrawerVisible = true">
        <t-icon name="caret-up"></t-icon>
      </t-button>
    </div>
    <t-drawer
      placement="bottom"
      :size="authDrawerSize"
      show-in-attached-element
      v-model:visible="authDrawerVisible"
      :footer="false"
    >
      <template #header>
        <div class="m-auto flex flex-col items-center justify-between">
          <span class="font-medium">选择联网方式</span>
          <span class="text-sm font-light text-gray-500">Network connection</span>
        </div>
      </template>
      <div class="auth_button_group">
        <button
          class="auth_button"
          style="background: linear-gradient(135deg, var(--user-auth-dark), var(--user-auth-light))"
          @click="handleAuth(1)"
        >
          <div class="icon-wrapper">
            <t-icon name="user" size="24" style="color: var(--user-auth-light)"></t-icon>
          </div>
          <div class="description">
            <span>用户认证</span>
            <span class="text-secondary">User Authorization</span>
          </div>
        </button>
        <button
          class="auth_button"
          style="
            background: linear-gradient(135deg, var(--trial-auth-dark), var(--trial-auth-light));
          "
          @click="handleAuth(11)"
        >
          <div class="icon-wrapper">
            <t-icon name="gift" size="24" style="color: var(--trial-auth-light)"></t-icon>
          </div>
          <div class="description">
            <span>试用认证</span>
            <span class="text-secondary">Trail Authorization</span>
          </div>
        </button>
        <button
          class="auth_button"
          style="
            background: linear-gradient(135deg, var(--coupon-auth-dark), var(--coupon-auth-light));
          "
          @click="handleAuth(2)"
        >
          <div class="icon-wrapper">
            <t-icon name="sim-card" size="24" style="color: var(--coupon-auth-light)"></t-icon>
          </div>
          <div class="description">
            <span>上网码认证</span>
            <span class="text-secondary">Coupon Authorization</span>
          </div>
        </button>
      </div>
    </t-drawer>
  </div>
</template>

<style lang="css" scoped>
@reference "../assets/styles/index.css";
.t-swiper :deep(.t-swiper__content) {
  height: 100%;
}
.t-avatar > :deep(.t-image__wrapper) {
  height: 100%;
  width: 100%;
}
.text-secondary {
  @apply text-xs font-light;
}
.auth_button_group {
  @apply m-auto flex w-8/10 flex-col items-center justify-between space-y-4;
  @apply landscape:m-4 landscape:w-auto landscape:flex-row landscape:space-y-0 landscape:space-x-4;
  --user-auth-dark: #3a6fc8;
  --user-auth-light: #6ec3f0;
  --trial-auth-dark: #e6456a;
  --trial-auth-light: #ff6b9d;
  --coupon-auth-dark: #7a4dcc;
  --coupon-auth-light: #b389ff;
}
.auth_button {
  @apply flex w-full flex-1 items-center rounded-4xl p-2 text-white ring-4 ring-gray-200 transition-all active:ring-gray-400;
  .icon-wrapper {
    @apply rounded-full bg-gray-200 p-2;
    color: var(--auth-text-color);
  }
  .description {
    @apply flex flex-1 flex-col px-4;
    span {
      @apply overflow-hidden text-left text-nowrap text-ellipsis;
    }
  }
}
</style>
