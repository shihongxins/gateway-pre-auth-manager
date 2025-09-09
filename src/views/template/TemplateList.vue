<script setup>
import * as templateApi from '../../apis/template';
import TableLayout from '../../layouts/TableLayout.vue';
import { useRequestList } from '../../utils/useRequestList';
import TemplateEditor from './TemplateEditor.vue';
import TemplatePreview from './TemplatePreview.vue';

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
    colKey: 'template_name',
    title: '模板名称',
  },
  {
    colKey: 'page_title',
    title: '页面标题',
  },
  {
    colKey: 'contact',
    title: '联系人',
  },
  {
    colKey: 'introduction',
    title: '简介',
  },
  {
    colKey: 'action',
    title: '操作',
    fixed: 'right',
  },
];

async function getTemplateListEffect() {
  try {
    templateList.loading.value = true;
    const res = await templateApi.getTemplateList(templateList.params);
    if (res instanceof Error) {
      throw res;
    } else if (res?.code !== 0) {
      MessagePlugin.error({ content: `获取模板列表失败：${res?.msg}` });
    } else {
      // FIXME: 临时处理字段 page_title 错误写成 page_tile
      templateList.list.value = (res.data.list || []).map((item) => {
        if (typeof item?.['page_tile'] === 'string') {
          item.page_title = item?.['page_tile'];
        }
        return item;
      });
      templateList.total.value = res.data.total || templateList.list.value.length;
    }
  } catch (error) {
    templateList.list.value = [];
    templateList.total.value = 0;
    MessagePlugin.error({ content: `获取模板列表出错：${error.message}` });
  } finally {
    templateList.loading.value = false;
  }
}
const templateList = useRequestList(getTemplateListEffect);
const pageInfo = templateList.getPageInfoByConfigFromParams({
  pageKey: 'page',
  pageSizeKey: 'page_size',
  totalKey: 'total',
});
templateList.search();

const refTemplateEditor = useTemplateRef('refTemplateEditor');

const previewVisible = ref(false);
const previewId = ref(0);
const showPreview = (id = 0) => {
  previewId.value = id;
  previewVisible.value = true;
};
const closePreview = () => {
  previewVisible.value = false;
  previewId.value = 0;
};
</script>

<template>
  <TableLayout>
    <template #header>
      <div class="flex items-center">
        <t-button shape="round" theme="primary" @click="refTemplateEditor.show()">
          <template #icon><t-icon name="add" /></template><span>添加模板</span>
        </t-button>
        <t-popconfirm
          theme="danger"
          content="确定删除选中的模板吗？"
          :confirmBtn="{ theme: 'danger' }"
          @confirm="refTemplateEditor.deleteTemplate(templateList.selected.value)"
        >
          <t-button
            shape="round"
            theme="danger"
            :disabled="templateList.selected.value.length === 0"
          >
            <template #icon><t-icon name="delete" /></template><span>批量删除</span>
          </t-button>
        </t-popconfirm>
        <span class="pl-2 text-sm text-gray-500"
          >选中：{{ templateList.selected.value.length }} 条信息</span
        >
      </div>
      <div class="flex items-center justify-between">
        <t-input
          placeholder="请输入内容"
          class="!w-[300px]"
          v-model="templateList.params.keyword"
          @change="templateList.searchOrReload()"
        >
          <template #suffixIcon>
            <t-icon name="search" class="cursor-pointer" @click="templateList.searchOrReload()" />
          </template>
        </t-input>
        <t-button shape="round" theme="default" @click="templateList.resetSearch()">重置</t-button>
        <t-button shape="round" theme="primary" @click="templateList.searchOrReload()"
          >搜索</t-button
        >
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
      :loading="templateList.loading.value"
      :data="templateList.list.value"
      :pagination="pageInfo"
      lazy-load
      v-model:selected-row-keys="templateList.selected.value"
      @page-change="templateList.pageInfoChange"
    >
      <template #action="{ row }">
        <t-button
          size="small"
          variant="outline"
          shape="round"
          theme="primary"
          @click="showPreview(row.id)"
        >
          <template #icon>
            <t-icon :name="row.file_type === 1 ? 'image' : 'media-library'" />
          </template>
          预览
        </t-button>
        <t-button
          size="small"
          variant="outline"
          shape="round"
          theme="warning"
          @click="refTemplateEditor.show(row)"
        >
          <template #icon><t-icon name="edit" /></template>编辑
        </t-button>
        <t-popconfirm
          theme="danger"
          content="确定删除此模板吗？"
          :confirmBtn="{ theme: 'danger' }"
          @confirm="refTemplateEditor.deleteTemplate([row.id])"
        >
          <t-button size="small" variant="outline" shape="round" theme="danger">
            <template #icon><t-icon name="delete" /></template>删除
          </t-button>
        </t-popconfirm>
      </template>
    </t-table>
    <template-editor ref="refTemplateEditor" @close="templateList.searchOrReload"></template-editor>
    <t-dialog
      placement="center"
      header="模板预览"
      v-model:visible="previewVisible"
      @close="closePreview"
    >
      <template-preview :id="previewId"></template-preview>
    </t-dialog>
  </TableLayout>
</template>
