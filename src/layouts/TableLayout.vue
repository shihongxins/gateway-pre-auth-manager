<template>
  <div class="flex h-full flex-1 flex-col space-y-4">
    <div class="flex items-center justify-between" v-if="$slots.header">
      <slot name="header"></slot>
    </div>
    <div class="flex-1 overflow-hidden" v-if="$slots.default">
      <slot></slot>
    </div>
    <div class="flex items-center justify-between" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
