<script setup>
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();

const router = useRouter();

if (userStore.isLoggedIn) {
  MessagePlugin.success('您已登录').finally(() => {
    router.push({ name: 'home' });
  });
}

const form = ref(null);
const loading = ref(false);

const formData = ref({
  username: '',
  password: '',
});

const rules = {
  username: [
    { required: true, message: '用户名不能为空' },
    { min: 3, message: '用户名至少3个字符' },
  ],
  password: [
    { required: true, message: '密码不能为空' },
    { min: 6, message: '密码至少6个字符' },
  ],
};

/**
 * @param {import('tdesign-vue-next').SubmitContext<any>} context
 */
const handleSubmit = async (context) => {
  if (context?.validateResult === true) {
    loading.value = true;
    try {
      const res = await userStore.login(formData.value.username, formData.value.password);
      if (res) {
        MessagePlugin.success('登录成功');
        router.push({ name: 'home' });
      } else {
        MessagePlugin.error({ content: '登录失败' });
      }
    } catch (error) {
      MessagePlugin.error({
        content: `登录出错：${error instanceof Error ? error.message : String(error) || '未知错误'}`,
      });
    } finally {
      loading.value = false;
    }
  }
};
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
  >
    <div class="w-full max-w-md">
      <div class="overflow-hidden rounded-xl bg-white shadow-lg">
        <!-- 头部装饰 -->
        <div class="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-center">
          <t-icon name="user-circle" class="mx-auto text-5xl text-white" />
          <h1 class="mt-4 text-2xl font-bold text-white">网关预登录认证管理</h1>
          <p class="mt-2 text-blue-100">请输入您的账号和密码登录</p>
        </div>

        <!-- 表单区域 -->
        <div class="p-8">
          <t-form ref="form" :rules="rules" :data="formData" @submit="handleSubmit">
            <!-- 用户名输入 -->
            <t-form-item name="username" label="用户名">
              <t-input
                v-model="formData.username"
                placeholder="请输入用户名"
                clearable
                size="large"
              >
                <template #prefix-icon>
                  <t-icon name="user" />
                </template>
              </t-input>
            </t-form-item>

            <!-- 密码输入 -->
            <t-form-item name="password" label="密码">
              <t-input
                v-model="formData.password"
                type="password"
                placeholder="请输入密码"
                clearable
                size="large"
              >
                <template #prefix-icon>
                  <t-icon name="lock-on" />
                </template>
              </t-input>
            </t-form-item>

            <!-- 登录按钮 -->
            <div class="mt-8">
              <t-button theme="primary" size="large" block type="submit" :loading="loading">
                登录
              </t-button>
            </div>
          </t-form>
        </div>
      </div>
    </div>
  </div>
</template>
