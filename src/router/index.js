import LayoutIndex from '@/layouts/LayoutIndex.vue';
import LoginView from '@/views/LoginView.vue';
import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        title: '登录',
      },
    },
    {
      path: '/',
      alias: '/home',
      name: 'home',
      component: LayoutIndex,
      children: [
        {
          path: 'user',
          name: 'user',
          component: () => import('@/views/user/UserList.vue'),
          meta: {
            title: '用户管理',
          },
        },
        {
          path: 'file',
          name: 'file',
          component: () => import('@/views/file/FileList.vue'),
          meta: {
            title: '素材管理',
          },
        },
        {
          path: 'template',
          name: 'template',
          component: () => import('@/views/template/TemplateList.vue'),
          meta: {
            title: '模板管理',
          },
        },
      ],
    },
  ],
});

export default router;
