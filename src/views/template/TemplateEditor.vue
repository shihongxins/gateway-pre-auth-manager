<script setup>
import * as templateApi from '../../apis/template';
import TemplateFilePicker from './TemplateFilePicker.vue';

const refDialog = ref(null);
const visible = defineModel('visible', { default: false });
const dialogHeader = computed(() => (formData.id ? '编辑模板' : '上传模板'));
const confirmLoading = ref(false);
/**
 * @param {import('../../types/TemplateInfo').TemplateInfo} [info]
 */
function show(info) {
  Object.assign(formData, emptyTemplateInfo());
  if (info?.id) {
    for (const key in formData) {
      // @ts-ignore
      formData[key] = info[key] ?? formData[key];
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
/**
 * @type {import('vue').Ref<import('tdesign-vue-next').FormInstanceFunctions>}
 */
const refForm = ref(null);
/**
 * @return {import('../../types/TemplateInfo').TemplateInfo}
 */
const emptyTemplateInfo = () => ({
  id: 0,
  uuid: '',
  group_id: 1,
  template_name: '',
  template_link: null,
  video_list: [],
  picture_list: [],
  page_title: '',
  head_picture: null,
  contact: '',
  introduction: '',
  wait_time: 30,
  auth_success_link: null,
});
const formData = reactive(emptyTemplateInfo());
const FORM_RULES = templateApi.templateFieldRules;
const videoAndPictureFiles = computed({
  get() {
    return [...formData.video_list, ...formData.picture_list].filter((item) => item?.file_type);
  },
  set(value) {
    formData.video_list = value.filter((item) => item?.file_type === 2);
    formData.picture_list = value.filter((item) => item?.file_type === 1);
  },
});
const headPictureFiles = computed({
  get() {
    return [formData.head_picture].filter((item) => item?.file_type === 1);
  },
  set(value) {
    formData.head_picture = value[0]?.file_type === 1 ? value[0] : null;
  },
});

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
      res = await templateApi.updateTemplate(formData);
    } else {
      res = await templateApi.addTemplate(formData);
    }
    if (res instanceof Error) {
      throw res;
    } else if (res?.code !== 0) {
      MessagePlugin.error({ content: `操作失败：${res.msg}` });
    } else {
      MessagePlugin.success('操作成功');
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
async function deleteTemplate(ids = []) {
  try {
    if (!ids.length || ids.some((id) => !/^\d+$/.test(id.toString()) || id <= 0)) {
      return MessagePlugin.warning('请选择要删除的模板');
    }
    const res = await templateApi.deleteTemplate(ids);
    if (res instanceof Error) {
      throw res;
    } else if (res?.code !== 0) {
      MessagePlugin.error({ content: `删除失败：${res?.msg}` });
    } else {
      MessagePlugin.success('删除成功');
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
  deleteTemplate,
});
</script>

<template>
  <t-dialog
    ref="refDialog"
    mode="modal"
    placement="center"
    :header="dialogHeader"
    v-model:visible="visible"
    destroy-on-close
    :closeOnOverlayClick="false"
    confirmBtn="保存"
    confirmOnEnter
    :confirmLoading="confirmLoading"
    @confirm="confirm"
    @close="close"
  >
    <t-form
      ref="refForm"
      class="overflow-hidden"
      :rules="FORM_RULES"
      status-icon
      :data="formData"
      reset-type="initial"
      @submit="submitFormData"
    >
      <t-form-item label="模板名称" name="template_name">
        <t-input placeholder="请输入模板名称" v-model.trim="formData.template_name" />
      </t-form-item>
      <t-form-item label="轮播图" name="video_list" help="分辨率建议：600*340，支持 mp4,png,jpg,jpeg 格式，最多 5 项">
        <template-file-picker
          v-model="videoAndPictureFiles"
          :max-count="5"
          :multiple="true"
          :show-action="false"
        ></template-file-picker>
      </t-form-item>
      <t-form-item label="头像" name="head_picture" help="分辨率建议：150*150，支持 png,jpg,jpeg 格式">
        <template-file-picker v-model="headPictureFiles" :file-type="1" :show-action="false"></template-file-picker>
      </t-form-item>
      <t-form-item label="页面标题" name="page_title">
        <t-input placeholder="请输入页面标题" v-model.trim="formData.page_title" />
      </t-form-item>
      <t-form-item label="联系人" name="contact">
        <t-input placeholder="请输入联系人" v-model.trim="formData.contact" />
      </t-form-item>
      <t-form-item label="简介" name="introduction">
        <t-textarea placeholder="请输入简介" autosize v-model.trim="formData.introduction" />
      </t-form-item>
      <t-form-item label="等待时间" name="wait_time">
        <t-input
          placeholder="请输入等待时间"
          suffix="秒"
          type="number"
          v-model.number="formData.wait_time"
        />
      </t-form-item>
      <t-form-item label="成功跳转至" name="auth_success_link">
        <t-input
          placeholder="请输入成功跳转至"
          type="url"
          v-model.trim="formData.auth_success_link"
        />
      </t-form-item>
    </t-form>
  </t-dialog>
</template>
