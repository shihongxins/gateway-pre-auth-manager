import router from './router';
import { useUserStore } from './stores/user';
import { request } from './utils/request';

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  if (to.path === '/login' && userStore.isLoggedIn) {
    next('/');
    return;
  }
  if (
    to.path !== '/login' &&
    (typeof to.meta.requiresAuth === 'undefined' || to.meta.requiresAuth) &&
    !userStore.isLoggedIn
  ) {
    MessagePlugin.warning('无权限访问，请先登录').finally(() => {
      userStore.logout().finally(() => {
        next('/login');
      });
    });
  } else {
    next();
  }
});

request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    if (!/login|loginOut/.test(config.url || '')) {
      if (!userStore.isLoggedIn || !userStore.token) {
        MessagePlugin.warning('登录过期，请重新登录').finally(() => {
          userStore.logout().finally(() => {
            router.replace('/login');
          });
        });
        return Promise.reject('登录过期，请重新登录');
      }
    }
    if (config.headers['x-token'] !== userStore.token) {
      config.headers['x-token'] = userStore.token;
    }
    if (config.headers['Content-Type'] === 'multipart/form-data') {
      if (config.data && !(config.data instanceof FormData)) {
        const formData = new FormData();
        Object.keys(config.data).forEach((key) => {
          formData.append(key, config.data[key]);
        });
        config.data = formData;
      }
    }
    if (config.data instanceof FormData || config.data instanceof Blob) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
request.interceptors.response.use(
  (response) => {
    /** @type {import('./types/Request').RequestResponse<any>} */
    const data = response.data;
    if (data.msg.includes('账户') && data.msg.includes('失效')) {
      MessagePlugin.warning('您的帐户异地登陆或令牌失效，请重新登录').finally(() => {
        if (!/loginOut/.test(response.config.url || '')) {
          useUserStore().logout();
        }
        router.replace('/login');
      });
    }
    return Promise.resolve(response);
  },
  (error) => {
    return Promise.reject(error);
  },
);
