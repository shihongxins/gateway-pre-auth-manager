import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import * as userApi from '../apis/user';

export const useUserStore = defineStore(
  'user',
  () => {
    // FIXME: 登录后用户信息不完整，没有邮箱和状态
    /**
     * @type {import('vue').Ref<import('../types/UserInfo').UserInfo | null>}
     * @description 用户信息
     */
    const userInfo = ref(null);

    /**
     * @description 用户认证令牌
     * @type {import('vue').Ref<string>}
     */
    const token = ref('');

    /**
     * @description 令牌过期时间戳
     * @type {import('vue').Ref<number>}
     */
    const expiresAt = ref(0);

    /**
     * @description 用户是否已登录
     * @type {import('vue').ComputedRef<boolean>}
     */
    const isLoggedIn = computed(() => !!token.value && Date.now() < expiresAt.value);

    /**
     * @description 用户角色
     * @type {import('vue').ComputedRef<number>}
     */
    const userRole = computed(() => userInfo.value?.roles || 0);

    /**
     * @description 用户状态
     * @type {import('vue').ComputedRef<number>}
     */
    const userStatus = computed(() => userInfo.value?.is_ok || 0);

    /**
     * @description 是否为管理员
     * @type {import('vue').ComputedRef<boolean>}
     */
    const isAdmin = computed(() => userRole.value >= 1);

    /**
     * @description 是否为超级管理员
     * @type {import('vue').ComputedRef<boolean>}
     */
    const isSuperAdmin = computed(
      () => userRole.value === 2 || userInfo.value?.username === 'admin',
    );

    /**
     * @description 用户登录
     * @param {string} username 用户名
     * @param {string} password 密码
     * @returns {Promise<boolean>} 登录是否成功
     */
    const login = async (username, password) => {
      try {
        const res = await userApi.login(username, password);
        if (res instanceof Error) {
          return false;
        }
        if (res.code === 0) {
          setUserInfo(res.data.user);
          setToken(res.data.token, res.data.expiresAt);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Login failed:', error);
        return false;
      }
    };

    /**
     * @description 用户登出
     * @returns {Promise<boolean>} 登出是否成功
     */
    const logout = async () => {
      try {
        await userApi.logout();
        return true;
      } catch (error) {
        console.error('Logout failed:', error);
        // 即使API调用失败，也清除本地数据
        return false;
      } finally {
        clearUserInfo();
      }
    };

    /**
     * @description 设置用户信息
     * @param {import('../types/UserInfo').UserInfo} info 用户信息
     */
    const setUserInfo = (info) => {
      userInfo.value = { ...info };
    };

    /**
     * @description 清除用户信息
     */
    const clearUserInfo = () => {
      userInfo.value = null;
      token.value = '';
      expiresAt.value = 0;
    };

    /**
     * @description 设置令牌
     * @param {string} newToken 新的令牌
     * @param {number} newExpiresAt 新的过期时间戳
     */
    const setToken = (newToken, newExpiresAt) => {
      token.value = newToken;
      if (newExpiresAt) {
        expiresAt.value = newExpiresAt;
      }
    };

    /**
     * @description 清除令牌
     */
    const clearToken = () => {
      token.value = '';
      expiresAt.value = 0;
    };

    return {
      userInfo,
      token,
      expiresAt,
      isLoggedIn,
      userRole,
      userStatus,
      isAdmin,
      isSuperAdmin,
      login,
      logout,
      setUserInfo,
      clearUserInfo,
      setToken,
      clearToken,
    };
  },
  {
    persist: true,
  },
);
