<script setup>
import { getUserList } from '../../apis/user';
import TableLayout from '../../layouts/TableLayout.vue';
import { useUserStore } from '../../stores/user';
import { userRoles, userStatus } from '../../utils/index';
import { useRequestList } from '../../utils/useRequestList';
import UserEditor from './UserEditor.vue';

const userStore = useUserStore();

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
    colKey: 'name',
    title: '姓名',
  },
  {
    colKey: 'username',
    title: '用户名',
  },
  {
    colKey: 'phone',
    title: '手机号',
  },
  {
    colKey: 'email',
    title: '邮箱',
  },
  {
    colKey: 'roles',
    title: '角色',
  },
  {
    colKey: 'is_ok',
    title: '状态',
  },
  {
    colKey: 'action',
    title: '操作',
    fixed: 'right',
  },
];

async function getUserListEffect() {
  try {
    userList.loading.value = true;
    const res = await getUserList(userList.params);
    if (res instanceof Error) {
      throw res;
    } else if (res.code !== 0) {
      MessagePlugin.error({ content: `获取用户列表失败：${res.msg}` });
    } else {
      userList.list.value = res.data.list.map((item) => ({
        ...item,
        role: userRoles[item.roles],
        status: userStatus[item.is_ok],
      }));
      userList.total.value = res.data.total || userList.list.value.length;
    }
  } catch (error) {
    userList.list.value = [];
    userList.total.value = 0;
    MessagePlugin.error({ content: `获取用户列表出错：${error.message}` });
  } finally {
    userList.loading.value = false;
  }
}
const userList = useRequestList(getUserListEffect);
const pageInfo = userList.getPageInfoByConfigFromParams({
  pageKey: 'page',
  pageSizeKey: 'page_size',
  totalKey: 'total',
});
userList.search();

const refUserEditor = useTemplateRef('refUserEditor');
</script>

<template>
  <TableLayout>
    <template #header>
      <div class="flex items-center" v-if="userStore.isAdmin">
        <t-button shape="round" theme="primary" @click="refUserEditor.show()">
          <template #icon><t-icon name="add" /></template><span>添加用户</span>
        </t-button>
        <t-popconfirm
          theme="danger"
          content="确定删除选中的用户吗？"
          :confirmBtn="{ theme: 'danger' }"
          @confirm="refUserEditor.deleteUser(userList.selected.value)"
        >
          <t-button shape="round" theme="danger" :disabled="userList.selected.value.length === 0">
            <template #icon><t-icon name="delete" /></template><span>批量删除</span>
          </t-button>
        </t-popconfirm>
        <span class="pl-2 text-sm text-gray-500">
          选中：{{ userList.selected.value.length }} 条信息
        </span>
      </div>
      <div class="flex items-center justify-between">
        <t-input
          placeholder="请输入内容"
          class="!w-[300px]"
          v-model="userList.params.keyword"
          @change="userList.searchOrReload()"
        >
          <template #suffixIcon>
            <t-icon name="search" class="cursor-pointer" @click="userList.searchOrReload()" />
          </template>
        </t-input>
        <t-button shape="round" theme="default" @click="userList.resetSearch()">重置</t-button>
        <t-button shape="round" theme="primary" @click="userList.searchOrReload()">搜索</t-button>
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
      :loading="userList.loading.value"
      :data="userList.list.value"
      :pagination="pageInfo"
      lazy-load
      @select-change="userList.selectChange"
      @page-change="userList.pageInfoChange"
    >
      <template #roles="{ row }">
        <t-tag size="small" variant="outline" shape="round" :theme="row.role.theme">
          {{ row.role.name }}
        </t-tag>
      </template>
      <template #is_ok="{ row }">
        <t-tag
          size="small"
          variant="outline"
          shape="round"
          :theme="row.is_ok ? 'success' : 'default'"
        >
          {{ row.status }}
        </t-tag>
      </template>
      <template #action="{ row }" v-if="userStore.isAdmin">
        <t-button
          size="small"
          variant="outline"
          shape="round"
          theme="warning"
          @click="refUserEditor.show(row)"
        >
          <template #icon><t-icon name="edit" /></template>编辑
        </t-button>
        <t-popconfirm
          theme="danger"
          content="确定删除此用户吗？"
          :confirmBtn="{ theme: 'danger' }"
          @confirm="refUserEditor.deleteUser([row.id])"
        >
          <t-button size="small" variant="outline" shape="round" theme="danger">
            <template #icon><t-icon name="delete" /></template>删除
          </t-button>
        </t-popconfirm>
      </template>
    </t-table>
    <user-editor ref="refUserEditor" @close="userList.searchOrReload()"></user-editor>
  </TableLayout>
</template>
