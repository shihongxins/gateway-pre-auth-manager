<script setup>
import * as fileApi from '../../apis/file';

const refDialog = ref(null);
const visible = defineModel('visible', { default: false });
const dialogHeader = computed(() => (formData.id ? '编辑文件' : '上传文件'));
const confirmLoading = ref(false);
/**
 * @param {import('../../types/FileInfo').FileInfo} [info]
 */
function show(info) {
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
 * @type {import('vue').Reactive<import('../../types/FileInfo').FileInfo>}
 */
const formData = reactive({
  id: 0,
  uuid: '',
  path: '',
  file_name: '',
  file_type: null,
  files: null,
});
const FORM_RULES = {
  file_name: [{ required: true, message: '文件名不能为空' }],
};

/**
 * @type {import('vue').Ref<import('tdesign-vue-next').TdUploadProps['status']>}
 */
const refUploadStatus = ref('default');
const refUploadTips = ref('');
/**
 * @param {File[]} files
 */
function handleUploadSelectChange(files) {
  if (formData.path) {
    try {
      URL.revokeObjectURL(formData.path);
    } catch (error) {
      console.error(error);
    }
  }
  refUploadStatus.value = 'default';
  refUploadTips.value = '';
  formData.files = files[0] || null;
  if (formData.files?.type?.startsWith('image')) {
    formData.file_type = 1;
  } else if (formData.files?.type?.startsWith('video')) {
    formData.file_type = 2;
  } else {
    formData.file_type = null;
    refUploadStatus.value = 'error';
    refUploadTips.value = '请上传图片或视频文件';
  }
  if (formData.file_type) {
    formData.file_name = formData.files.name;
    formData.path = URL.createObjectURL(formData.files);
  }
}

async function submitFormData() {
  try {
    confirmLoading.value = true;
    const valid = await refForm.value.validate();
    const validResult = Array.from(Object.values(valid).flat());
    if (!validResult.every((item) => item.result)) {
      return MessagePlugin.warning('请填写完整信息');
    }
    let res = await fileApi.addFile(formData);
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
async function deleteFile(ids = []) {
  try {
    if (!ids.length || ids.some((id) => !/^\d+$/.test(id.toString()) || id <= 0)) {
      return MessagePlugin.warning('请选择要删除的文件');
    }
    const res = await fileApi.deleteFile(ids);
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
  deleteFile,
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
      class="overflow-hidden"
      :rules="FORM_RULES"
      status-icon
      :data="formData"
      reset-type="initial"
      @submit="submitFormData"
    >
      <t-form-item label="上传文件">
        <t-upload
          theme="file-input"
          accept="image/*,video/*"
          :max="1"
          :status="refUploadStatus"
          :tips="refUploadTips"
          :autoUpload="false"
          :data="formData"
          showUploadProgress
          @select-change="handleUploadSelectChange"
        >
        </t-upload>
      </t-form-item>
      <t-form-item label="文件名称" name="file_name">
        <t-input placeholder="请输入文件名称" v-model.trim="formData.file_name" />
      </t-form-item>
    </t-form>
  </t-dialog>
</template>
