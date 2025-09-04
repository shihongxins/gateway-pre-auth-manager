<script setup>
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import UserEditor from '../views/user/UserEditor.vue';

const refUserEditor = useTemplateRef('refUserEditor');

const userStore = useUserStore();

const router = useRouter();

const userDropdownOptions = ref([
  { content: '个人信息', value: 'info' },
  { content: '退出登录', value: 'logout' },
]);

const handleUserDropdownClick = async (option) => {
  if (option?.value === 'info') {
    refUserEditor.value.show(userStore.userInfo);
  }
  if (option?.value === 'logout') {
    await userStore.logout();
    await MessagePlugin.success('退出登录成功');
    router.push({ name: 'login' });
  }
};
</script>

<template>
  <t-layout class="flex h-screen flex-col overflow-hidden">
    <t-header class="m-2 flex items-center justify-between rounded-2xl bg-white px-8 shadow-sm">
      <!-- logo and title -->
      <router-link to="/" class="flex items-center">
        <t-icon name="user-circle" class="mx-auto text-4xl text-blue-500" />
        <h1 class="p-0 text-center text-2xl font-bold">网关预登录认证管理</h1>
      </router-link>
      <div class="flex items-center space-x-8">
        <nav class="flex space-x-8">
          <router-link to="/" class="rounded p-2 transition hover:bg-blue-400/50">首页</router-link>
          <router-link
            to="/user"
            class="rounded p-2 transition hover:bg-blue-400/50"
            v-if="userStore.isAdmin"
          >
            用户管理
          </router-link>
          <router-link to="/file" class="rounded p-2 transition hover:bg-blue-400/50">
            素材管理
          </router-link>
          <router-link to="/template" class="rounded p-2 transition hover:bg-blue-400/50">
            模板管理
          </router-link>
        </nav>
        <t-dropdown :options="userDropdownOptions" @click="handleUserDropdownClick">
          <t-avatar class="cursor-pointer" shape="circle" size="large">
            <span>{{ userStore.userInfo?.name }}</span>
          </t-avatar>
        </t-dropdown>
      </div>
    </t-header>
    <t-content class="m-2 flex flex-1 flex-col overflow-auto rounded-2xl bg-white p-4 shadow-sm">
      <router-view />
    </t-content>
  </t-layout>
  <user-editor ref="refUserEditor"></user-editor>
</template>
