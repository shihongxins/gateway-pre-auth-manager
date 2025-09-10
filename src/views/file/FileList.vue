<script setup>
import * as fileApi from '../../apis/file';
import TableLayout from '../../layouts/TableLayout.vue';
import { useRequestList } from '../../utils/useRequestList';
import FileEditor from './FileEditor.vue';
import FilePreview from './FilePreview.vue';

const props = defineProps({
  showAction: {
    type: Boolean,
    default: true,
  },
  fileType: {
    type: Number,
    default: null,
  },
});

/**
 * @type {import('tdesign-vue-next').PrimaryTableCol[]}
 */
const tableColumns = [
  {
    colKey: 'row-select',
    type: 'multiple',
    width: 46,
  },
  {
    colKey: 'file_name',
    title: '文件名',
  },
  {
    colKey: 'file_type',
    title: '文件类型',
  },
  {
    colKey: 'action',
    title: '操作',
    fixed: 'right',
  },
];

async function getFileListEffect() {
  try {
    fileList.loading.value = true;
    const res = await fileApi.getFileList(fileList.params);
    if (res instanceof Error) {
      throw res;
    } else if (res?.code !== 0) {
      MessagePlugin.error({ content: `获取文件列表失败：${res?.msg}` });
    } else {
      fileList.list.value = res.data.list || [];
      fileList.total.value = res.data.total || fileList.list.value.length;
    }
  } catch (error) {
    fileList.list.value = [];
    fileList.total.value = 0;
    MessagePlugin.error({ content: `获取文件列表出错：${error.message}` });
  } finally {
    fileList.loading.value = false;
  }
}
const fileList = useRequestList(getFileListEffect, { file_type: props.fileType });
const pageInfo = fileList.getPageInfoByConfigFromParams({
  pageKey: 'page',
  pageSizeKey: 'page_size',
  totalKey: 'total',
});
onMounted(() => {
  fileList.search();
});
watch(() => props.fileType, (newVal) => {
  fileList.params.file_type = newVal;
  fileList.search();
});

const refFileEditor = useTemplateRef('refFileEditor');

const previewVisible = ref(false);
const previewSrc = ref('');
const previewTitle = ref('');
const showPreview = (src = '', title = '') => {
  previewSrc.value = src;
  previewTitle.value = title || '文件预览';
  previewVisible.value = true;
};
const closePreview = () => {
  previewVisible.value = false;
  previewSrc.value = '';
  previewTitle.value = '';
};

defineExpose({
  fileList,
});
</script>

<template>
  <TableLayout>
    <template #header>
      <div class="flex items-center" v-if="props.showAction">
        <t-button shape="round" theme="primary" @click="refFileEditor.show()">
          <template #icon><t-icon name="add" /></template><span>添加文件</span>
        </t-button>
        <t-popconfirm
          theme="danger"
          content="确定删除选中的文件吗？"
          :confirmBtn="{ theme: 'danger' }"
          @confirm="refFileEditor.deleteFile(fileList.selected.value)"
        >
          <t-button shape="round" theme="danger" :disabled="fileList.selected.value.length === 0">
            <template #icon><t-icon name="delete" /></template><span>批量删除</span>
          </t-button>
        </t-popconfirm>
        <span class="px-2 text-sm text-nowrap text-gray-500">
          选中：{{ fileList.selected.value.length }} 条信息
        </span>
      </div>
      <div class="flex items-center justify-between">
        <t-select
          placeholder="请选择文件类型"
          clearable
          showArrow
          v-model="fileList.params.file_type"
          @change="fileList.searchOrReload()"
          v-show="props.fileType === null"
        >
          <t-option label="图片" :value="1"></t-option>
          <t-option label="视频" :value="2"></t-option>
        </t-select>
        <t-input
          placeholder="请输入内容"
          v-model="fileList.params.keyword"
          @change="fileList.searchOrReload()"
        >
          <template #suffixIcon>
            <t-icon name="search" class="cursor-pointer" @click="fileList.searchOrReload()" />
          </template>
        </t-input>
        <t-button shape="round" theme="default" @click="fileList.resetSearch()">重置</t-button>
        <t-button shape="round" theme="primary" @click="fileList.searchOrReload()">搜索</t-button>
      </div>
    </template>
    <t-table
      class="h-full overflow-hidden"
      max-height="calc(100% - 4rem)"
      bordered
      hover
      stripe
      row-key="id"
      :columns="tableColumns"
      :loading="fileList.loading.value"
      :data="fileList.list.value"
      :pagination="pageInfo"
      lazy-load
      v-model:selected-row-keys="fileList.selected.value"
      @page-change="fileList.pageInfoChange"
    >
      <template #file_type="{ row }">
        <t-tag>
          <t-icon :name="row.file_type === 1 ? 'image' : 'media-library'" />
          {{ row.file_type === 1 ? '图片' : '视频' }}
        </t-tag>
      </template>
      <template #action="{ row }">
        <t-button
          size="small"
          variant="outline"
          shape="round"
          theme="primary"
          @click="showPreview(row.path, row.file_name)"
        >
          <template #icon>
            <t-icon :name="row.file_type === 1 ? 'image' : 'media-library'" />
          </template>
          预览
        </t-button>
        <t-popconfirm
          v-if="props.showAction"
          theme="danger"
          content="确定删除此文件吗？"
          :confirmBtn="{ theme: 'danger' }"
          @confirm="refFileEditor.deleteFile([row.id])"
        >
          <t-button size="small" variant="outline" shape="round" theme="danger">
            <template #icon><t-icon name="delete" /></template>删除
          </t-button>
        </t-popconfirm>
      </template>
    </t-table>
    <file-editor v-if="props.showAction" ref="refFileEditor" @close="fileList.searchOrReload"></file-editor>
    <t-dialog v-model:visible="previewVisible" :header="previewTitle" :footer="false" @close="closePreview">
      <file-preview :src="previewSrc"></file-preview>
    </t-dialog>
  </TableLayout>
</template>
