import js from '@eslint/js';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import pluginVue from 'eslint-plugin-vue';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import fs from 'node:fs';
import path from 'node:path';

// 使用fs模块读取和解析JSON文件
const autoImportJson = JSON.parse(fs.readFileSync(path.resolve('./.eslintrc-auto-import.json'), 'utf8'));

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...autoImportJson.globals,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  skipFormatting,
]);
