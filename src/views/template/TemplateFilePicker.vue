<script setup>
import FilePreview from '../file/FilePreview.vue';
import FileList from '../file/FileList.vue';

const props = defineProps({
  multiple: {
    type: Boolean,
    default: false,
  },
  maxCount: {
    type: Number,
    default: 1,
  },
  fileType: {
    type: Number,
    default: null,
  },
});
/**
 * @type {import('vue').ModelRef<import('../../types/FileInfo').FileInfo[]|null>}
 */
const modelValue = defineModel({
  type: Array,
  default: () => null,
});

const filePickerVisible = ref(false);
const refFileList = useTemplateRef('refFileList');
function openFilePicker() {
  filePickerVisible.value = true;
  nextTick(() => {
    refFileList.value.fileList.search();
  });
}
function closeFilePicker() {
  const selectedFileId = refFileList.value.fileList.selected.value;
  const selectedFile = refFileList.value.fileList.list.value.filter((item) =>
    selectedFileId.includes(item.id),
  );
  let newModelValue = [...modelValue.value, ...selectedFile]
    .filter((item) => (props.fileType ? item.file_type === props.fileType : true))
    .slice(0, props.maxCount)
    .sort((a, b) => b.file_type - a.file_type);
  newModelValue = newModelValue.filter(
    (item, index) => newModelValue.findIndex((i) => i.uuid === item.uuid) === index,
  );
  modelValue.value = newModelValue;
  filePickerVisible.value = false;
}
/**
 * @param {import('../../types/FileInfo').FileInfo} file
 */
function removeFile(file) {
  modelValue.value = modelValue.value.filter((item) => item.uuid !== file.uuid);
}
</script>

<template>
  <div class="flex h-full w-full space-x-2 overflow-hidden overflow-x-auto">
    <template v-for="file in modelValue" :key="file.uuid">
      <div
        class="group relative flex h-20 w-20 shrink-0 items-center justify-center rounded p-1 ring-1 ring-inset"
      >
        <file-preview
          :src="file.path"
          :autoplay="false"
          :controls="false"
          class="ring ring-gray-400"
        ></file-preview>
        <t-icon
          name="close-circle"
          size="medium"
          class="absolute top-0 right-0 cursor-pointer text-white group-hover:text-black"
          @click="removeFile(file)"
        />
      </div>
    </template>
    <div
      v-show="modelValue.length < props.maxCount"
      class="flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center rounded ring-1 ring-inset"
      @click="openFilePicker"
    >
      <t-icon name="upload" />
    </div>
    <t-dialog
      title="选择文件"
      width="700"
      destroy-on-close
      v-model:visible="filePickerVisible"
      @confirm="closeFilePicker"
      @close="closeFilePicker"
    >
      <file-list
        ref="refFileList"
        v-if="filePickerVisible"
        :file-type="props.fileType"
        v-bind="$attrs"
      ></file-list>
    </t-dialog>
  </div>
</template>
