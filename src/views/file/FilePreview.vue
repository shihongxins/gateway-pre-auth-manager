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
</script>
<template>
  <div class="overflow-hidden">
    <slot>
      <img
        v-if="isImage"
        :src="src"
        alt="Preview"
        class="mx-auto max-h-full max-w-full border object-contain"
        v-bind="$attrs"
      />
      <video
        v-else-if="isVideo"
        :src="src"
        controls
        loop
        autoplay
        muted
        class="mx-auto max-h-full max-w-full border object-contain"
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
