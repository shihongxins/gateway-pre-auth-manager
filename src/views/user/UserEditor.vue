<script setup>
import * as userApi from '../../apis/user';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

const refDialog = ref(null);
const visible = defineModel('visible', { default: false });
const dialogHeader = computed(() => (formData.id ? '编辑用户' : '注册用户'));
const confirmLoading = ref(false);
/**
 * @param {import('../../types/UserInfo').UserInfo} [info]
 */
function show(info) {
  if (info?.id) {
    for (const key in formData) {
      // @ts-ignore
      formData[key] = info[key] ?? formData[key];
    }
    if (!userStore.isAdmin) {
      formData.roles = 0;
    }
  }
  visible.value = true;
}
function close() {
  refForm.value?.reset();
  visible.value = false;
  emits('close');
}
function confirm() {
  refForm.value?.submit();
}

const changePassword = ref(false);
async function currentUserLogout() {
  MessagePlugin.warning('当前用户关键信息已变更，请重新登录');
  await userStore.logout();
  const router = useRouter();
  router.push({ name: 'login' });
}

/**
 * @type {import('vue').Ref<import('tdesign-vue-next').FormInstanceFunctions>}
 */
const refForm = ref(null);
const formData = reactive({
  id: 0,
  uuid: '',
  username: '',
  password: '',
  confirmPassword: '',
  roles: 0,
  name: '',
  phone: '',
  email: '',
  is_ok: 0,
});
const FORM_RULES = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 4, max: 20, message: '用户名长度在 4 到 20 个字符' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符' },
    { pattern: /^[\w@$!%*?&]+$/, message: '密码只能包含字母、数字和部分特殊字符' },
    {
      pattern: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]+$/,
      message: '密码必须包含字母、数字和特殊字符',
    },
  ],
  confirmPassword: [
    { required: true, message: '请输入确认密码' },
    {
      validator: (val) => val === formData.password,
      message: '两次输入密码不一致',
    },
  ],
  roles: [{ required: true, message: '请选择角色' }],
  name: [{ required: true, message: '请输入姓名' }],
  phone: [
    { required: true, message: '请输入手机号' },
    { telnumber: true, message: '请输入正确的手机号格式' },
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { email: { ignore_max_length: true }, message: '请输入正确的邮箱格式' },
  ],
};

async function submitFormData() {
  try {
    confirmLoading.value = true;
    const valid = await refForm.value.validate();
    const validResult = Array.from(Object.values(valid).flat());
    if (!validResult.every((item) => item.result)) {
      return MessagePlugin.warning('请填写完整信息');
    }
    let res;
    if (formData.id) {
      res = await userApi.updateUser(formData);
    } else {
      res = await userApi.addUser(formData);
    }
    if (res instanceof Error) {
      throw res;
    } else if (res?.code !== 0) {
      MessagePlugin.error({ content: `操作失败：${res.msg}` });
    } else {
      MessagePlugin.success('操作成功');
      // 如果是当前用户，并且修改了密码或角色，则重新登录
      if (
        formData.id === userStore.userInfo.id &&
        (formData.password || formData.roles !== userStore.userInfo.roles)
      ) {
        await currentUserLogout();
      }
      close();
    }
  } catch (error) {
    MessagePlugin.error({ content: `提交数据出错：${error.message}` });
  } finally {
    confirmLoading.value = false;
  }
}

/**
 * @param {number[]} ids
 */
async function deleteUser(ids = []) {
  try {
    if (!ids.length || ids.some((id) => !/^\d+$/.test(id.toString()) || id <= 0)) {
      return MessagePlugin.warning('请选择要删除的用户');
    }
    const res = await userApi.deleteUser(ids);
    if (res instanceof Error) {
      throw res;
    } else if (res?.code !== 0) {
      MessagePlugin.error({ content: `删除失败：${res?.msg}` });
    } else {
      MessagePlugin.success('删除成功');
      // 如果是当前用户，则退出登录
      if (ids.includes(userStore.userInfo.id)) {
        await currentUserLogout();
      }
      close();
    }
  } catch (error) {
    MessagePlugin.error({ content: `删除出错：${error.message}` });
  }
}

const emits = defineEmits(['close']);

defineExpose({
  refDialog,
  refForm,
  show,
  close,
  deleteUser,
});
</script>

<template>
  <t-dialog
    ref="refDialog"
    mode="modal"
    :header="dialogHeader"
    v-model:visible="visible"
    :closeOnOverlayClick="false"
    confirmBtn="保存"
    confirmOnEnter
    :confirmLoading="confirmLoading"
    @confirm="confirm"
    @close="close"
  >
    <t-form
      ref="refForm"
      :rules="FORM_RULES"
      status-icon
      :data="formData"
      reset-type="initial"
      @submit="submitFormData"
    >
      <div class="hidden">
        <input type="text" disabled style="opacity: 0; position: absolute; top: -99px" />
        <input type="password" disabled style="opacity: 0; position: absolute; top: -99px" />
      </div>
      <t-form-item label="用户名" name="username">
        <t-input
          placeholder="请输入用户名"
          clearable
          v-model.trim="formData.username"
          :readonly="formData.id > 0"
        />
      </t-form-item>
      <!-- FEATURE: 管理员和自己才能修改密码 -->
      <t-form-item
        label="更改密码"
        v-if="userStore.isAdmin || userStore.userInfo?.username === formData.username"
      >
        <t-switch v-model="changePassword" />
      </t-form-item>
      <template v-if="changePassword">
        <t-form-item label="密码" name="password">
          <t-input
            placeholder="请输入密码"
            type="password"
            clearable
            v-model.trim="formData.password"
          />
        </t-form-item>
        <t-form-item label="确认密码" name="confirmPassword">
          <t-input
            placeholder="请输入确认密码"
            type="password"
            clearable
            v-model.trim="formData.confirmPassword"
          />
        </t-form-item>
      </template>
      <t-form-item label="角色" name="roles">
        <t-radio-group v-model="formData.roles">
          <t-radio :value="0">普通用户</t-radio>
          <template v-if="userStore.isSuperAdmin">
            <t-radio :value="1">管理员</t-radio>
            <t-radio :value="2">超级管理员</t-radio>
          </template>
        </t-radio-group>
      </t-form-item>
      <t-form-item label="姓名" name="name">
        <t-input placeholder="请输入姓名" clearable v-model.trim="formData.name" />
      </t-form-item>
      <t-form-item label="手机号" name="phone">
        <t-input placeholder="请输入手机号" clearable v-model.trim="formData.phone" />
      </t-form-item>
      <t-form-item label="邮箱" name="email">
        <t-input placeholder="请输入邮箱" clearable v-model.trim="formData.email" />
      </t-form-item>
      <t-form-item label="状态" name="is_ok">
        <t-switch
          :label="['启用', '禁用']"
          :customValue="[1, 0]"
          v-model="formData.is_ok"
        ></t-switch>
      </t-form-item>
    </t-form>
  </t-dialog>
</template>
