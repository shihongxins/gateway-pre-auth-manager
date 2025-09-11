<script setup>
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
});

// 判断是否为图片文件
const isImage = computed(() => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
  const extension = props.src.split('.').pop()?.toLowerCase();
  return imageExtensions.includes(extension);
});

// 判断是否为视频文件
const isVideo = computed(() => {
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];
  const extension = props.src.split('.').pop()?.toLowerCase();
  return videoExtensions.includes(extension);
});

const refElement = useTemplateRef('refElement');
defineExpose({
  refElement,
});
</script>
<template>
  <div class="w-full overflow-hidden">
    <slot>
      <img
        ref="refElement"
        v-if="isImage"
        :src="src"
        alt="Preview"
        class="m-auto h-full w-full object-cover"
        v-bind="$attrs"
      />
      <video
        ref="refElement"
        v-else-if="isVideo"
        :src="src"
        controls
        disable-picture-in-picture
        disable-remote-playback
        muted
        autoplay
        loop
        class="m-auto h-full w-full object-cover"
        v-bind="$attrs"
      />
    </slot>
    <template v-if="!isImage && !isVideo">
      <slot name="unsupported">
        <div class="text-center text-red-500">不支持的文件类型，请提供图片或视频文件</div>
      </slot>
    </template>
  </div>
</template>
