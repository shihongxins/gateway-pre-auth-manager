<script setup>
import { getTemplateDetail } from '@/apis/template';
import FilePreview from './file/FilePreview.vue';

const props = defineProps({
  id: {
    type: Number,
    default: 0,
  },
});
const router = useRouter();
const templateId = computed(() => props.id || +router.currentRoute.value.query.id || 0);
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
      }
    } catch (error) {
      MessagePlugin.error(error.message);
      setTimeout(getTemplateInfo, 10000);
    }
  }
}
watch(templateId, getTemplateInfo, { immediate: true });

// TODO: 视频播放与暂停和轮播自动切换功能待完善
const swiperIndex = ref(0);
const refFilePreview = useTemplateRef('refFilePreview');
function handleSwiperChange(current = 0) {
  const lastElement = refFilePreview.value?.at(swiperIndex.value)?.refElement;
  const currentElement = refFilePreview.value?.at(current)?.refElement;
  swiperIndex.value = current;
  if (lastElement instanceof HTMLVideoElement) {
    lastElement.pause();
  }
  if (currentElement instanceof HTMLVideoElement) {
    currentElement.currentTime = 0;
    currentElement.play();
  }
  if (currentElement instanceof HTMLImageElement) {
    setTimeout(() => {
      // handleSwiperChange(swiperIndex.value + 1);
    }, 5000);
  }
}
function handleVideoEnded() {
  console.log('视频播放结束');
  // handleSwiperChange(swiperIndex.value + 1);
}
</script>

<template>
  <t-loading text="页面急速加载中..." :loading="loading" :indicator="false" fullscreen />
  <div class="h-full overflow-auto">
    <div class="relative h-0 pb-[calc(9/16*100%)]">
      <div class="absolute top-0 left-0 h-full w-full overflow-hidden rounded bg-gray-200">
        <t-swiper v-model:current="swiperIndex" :autoplay="false" class="!h-full overflow-hidden" @change="handleSwiperChange">
          <t-swiper-item v-for="file in swiperFileList" :key="file.uuid" class="h-full">
            <file-preview
              ref="refFilePreview"
              class="h-full"
              :src="file.path"
              :controls="false"
              @ended="handleVideoEnded"
            ></file-preview>
          </t-swiper-item>
        </t-swiper>
      </div>
    </div>
    <div class="m-4 flex items-center">
      <t-avatar
        shape="circle"
        size="large"
        :image="templateInfo?.head_picture?.path"
        :image-props="avatarImageProp"
        :alt="templateInfo?.page_title"
      ></t-avatar>
      <div class="ml-2 flex flex-1 flex-col overflow-hidden">
        <p class="text-lg font-medium text-nowrap text-ellipsis">{{ templateInfo?.page_title }}</p>
        <p class="text-sm text-nowrap text-ellipsis">{{ templateInfo?.contact }}</p>
      </div>
    </div>
    <p class="mx-4 indent-8 text-sm">{{ templateInfo?.introduction }}</p>
  </div>
</template>

<style lang="css" scoped>
.t-swiper :deep(.t-swiper__content) {
  height: 100%;
}
.t-avatar > :deep(.t-image__wrapper) {
  height: 100%;
  width: 100%;
}
</style>
