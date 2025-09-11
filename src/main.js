import 'tdesign-vue-next/es/style/index.css';
import { createApp } from 'vue';
import App from './App.vue';
import './assets/styles/index.css';
import router from './router';
import { pinia } from './stores';

const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount('#app');

import './permission';
console.log(import.meta.env);
