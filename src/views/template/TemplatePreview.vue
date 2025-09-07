<script setup>
import * as templateApi from '../../apis/template';
import FilePreview from '../file/FilePreview.vue';

const props = defineProps({
  id: {
    type: Number,
    default: 0,
  },
});
const route = useRoute();
const id = computed(() => +route.query.id || props.id);
const loading = ref(false);
/**
 * @type {import('vue').Ref<import('../../types/TemplateInfo').TemplateInfo>}
 */
const templateInfo = ref(null);
async function getTemplateInfo() {
  loading.value = true;
  if (id.value) {
    try {
      const res = await templateApi.getTemplateDetail(id.value);
      if (res instanceof Error) {
        throw res;
      } else if (res?.code !== 0) {
        MessagePlugin.error({ content: `获取模板详情失败：${res?.msg}` });
      } else {
        templateInfo.value = res.data;
        document.title = templateInfo.value.page_title || '网关预认证';
      }
    } catch (error) {
      MessagePlugin.error({ content: `获取模板详情出错：${error.message}` });
    } finally {
      loading.value = false;
    }
  }
}
const swiperFileList = computed(() => {
  return [
    ...(templateInfo.value?.video_list || []),
    ...(templateInfo.value?.picture_list || []),
  ].filter((file) => file?.path);
});
watch(id, getTemplateInfo);
</script>

<template>
  <div class="flex h-full w-full items-center justify-center" v-if="id === templateInfo?.id">
    <t-loading :loading="loading" fullscreeen />
    <div class="h-110 w-60 space-y-4 overflow-auto rounded-xl p-4 text-black ring-1 ring-inset">
      <div class="relative h-0 w-full bg-gray-300 pb-[56.25%]">
        <t-swiper class="absolute top-0 left-0 h-full w-full">
          <t-swiper-item v-for="file in swiperFileList" :key="file.uuid">
            <file-preview :src="file.path" />
          </t-swiper-item>
        </t-swiper>
      </div>
      <div class="flex items-center">
        <t-avatar
          shape="circle"
          size="large"
          hide-on-load-failed
          :src="templateInfo?.head_picture"
        ></t-avatar>
        <div class="ml-2 flex flex-1 flex-col overflow-hidden">
          <p class="text-lg font-bold text-nowrap text-ellipsis">{{ templateInfo?.page_title }}</p>
          <p class="text-sm text-nowrap text-ellipsis">{{ templateInfo?.contact }}</p>
        </div>
      </div>
      <p class="indent-8 text-sm">{{ templateInfo?.introduction }}</p>
    </div>
  </div>
</template>
