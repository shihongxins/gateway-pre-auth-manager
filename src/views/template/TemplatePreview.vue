<script setup>
import AuthView from '../AuthView.vue';

const visible = ref(false);
const templateId = ref(0);
const templateLink = computed(() => {
  return `${window.location.origin}/#/auth?id=${unref(templateId)}`;
});
const showPreview = (id = 0) => {
  templateId.value = unref(id);
  visible.value = true;
};
const closePreview = () => {
  visible.value = false;
  templateId.value = 0;
};
const copyTip = ref('复制链接');
async function copyLink() {
  try {
    await navigator.clipboard.writeText(templateLink.value);
    copyTip.value = '复制成功';
  } catch (error) {
    console.error(error);
    copyTip.value = '复制失败，请手动复制';
  } finally {
    setTimeout(() => {
      copyTip.value = '复制链接';
    }, 1000);
  }
};
defineExpose({
  showPreview,
  closePreview,
});
</script>

<template>
  <t-dialog
    placement="center"
    header="模板预览"
    :footer="false"
    v-model:visible="visible"
    @close="closePreview"
  >
    <t-input :value="templateLink" readonly style="width: 375px; margin: 0 auto 1rem;">
      <template #suffix>
        <t-popup :content="copyTip">
            <t-button size="small" theme="default" @click="copyLink">
              <t-icon name="copy"></t-icon>
            </t-button>
        </t-popup>
      </template>
    </t-input>
    <div style="width: 375px; height: 667px; margin: 0 auto; box-shadow: 0 0 1px 0px #000; border-radius: 4px; overflow: hidden;">
      <auth-view :id="templateId"></auth-view>
    </div>
  </t-dialog>
</template>
