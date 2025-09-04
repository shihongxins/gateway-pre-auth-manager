import { cwd } from 'node:process';
import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';

import { TDesignResolver } from '@tdesign-vue-next/auto-import-resolver';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), '');
  return {
    plugins: [
      vue(),
      vueDevTools(),
      AutoImport({
        dts: true,
        imports: ['vue', 'vue-router', 'pinia'],
        resolvers: [
          TDesignResolver({
            library: 'vue-next',
          }),
        ],
        eslintrc: {
          enabled: true,
          filepath: '.eslintrc-auto-import.json',
          globalsPropValue: true,
        },
      }),
      Components({
        dts: true,
        resolvers: [
          TDesignResolver({
            library: 'vue-next',
          }),
        ],
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/v1': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
        },
      },
    },
  };
});
