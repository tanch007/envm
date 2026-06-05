<template>
  <aside class="sidebar" data-component="Environment Sidebar" data-od-id="sidebar">
    <nav class="sidebar-header">
      <div class="sidebar-brand">{{ $t('sidebar.brand') }}</div>
      <div class="sidebar-header-actions">
        <el-dropdown trigger="click" @command="switchLang">
          <button class="theme-toggle" aria-label="Switch language">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;">
              <circle cx="10" cy="10" r="8"/>
              <path d="M2 10h16M10 2a15.3 15.3 0 010 16 15.3 15.3 0 010-16z"/>
            </svg>
          </button>
          <template #dropdown>
            <el-dropdown-item :class="{ active: locale === 'zh-CN' }" command="zh-CN">中文</el-dropdown-item>
            <el-dropdown-item :class="{ active: locale === 'en' }" command="en">English</el-dropdown-item>
          </template>
        </el-dropdown>
        <button class="theme-toggle" @click="toggle" :aria-label="$t('sidebar.toggleTheme')" data-component="Theme Toggle" data-od-id="theme-toggle">
        <svg v-if="appearance === 'dark'" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="4"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41"/></svg>
        <svg v-else viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17 10.5A7 7 0 019.5 3 7 7 0 1017 10.5z"/></svg>
      </button>
      </div>
    </nav>
    <ul class="env-list" data-component="Environment List" data-od-id="env-list">
      <li
        v-for="env,index in environments"
        :key="env.id"
        :class="['env-item', { active: env.id === currentEnv?.id }]"
        @click="$emit('select', env)"
        data-component="Environment Item"
        :data-od-id="'env-' + env.id"
        role="button"
        tabindex="0"
        :aria-label="$t('sidebar.selectEnv', { name: env.name })"
      >
        <span class="env-icon">{{ env.icon || env.name.slice(0,1).toUpperCase() }}</span>
        <span class="env-name">{{ env.name }}</span>
        <span class="env-actions">
          <button class="env-action-btn" @click.stop="$emit('edit', env)" :aria-label="$t('sidebar.editEnv', { name: env.name })" :title="$t('common.edit')">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 1.5l3 3L5 14H2v-3z"/><path d="M9 4l3 3"/></svg>
          </button>
          <button class="env-action-btn env-delete" @click.stop="$emit('delete', env,index)" :aria-label="$t('sidebar.deleteEnv', { name: env.name })" :title="$t('common.delete')">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h10M6 4V2h4v2M5 4v10h6V4"/></svg>
          </button>
        </span>
      </li>
    </ul>
    <button class="env-add-btn" @click="$emit('add')" data-component="Add Environment Button" data-od-id="env-add-btn" :aria-label="$t('sidebar.addEnv')">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M8 3v10M3 8h10"/></svg>
      {{ $t('sidebar.addEnv') }}
    </button>
  </aside>
</template>

<script setup lang="ts">
import type { EnvGroup } from "@/apis/EnvGroup";
import { useTheme } from "@/comm/useTheme";
import { useI18n } from 'vue-i18n'

defineProps<{
  environments:Array<EnvGroup>,
  currentEnv?:EnvGroup
}>()

const { appearance, toggle } = useTheme()
const { locale } = useI18n()

function switchLang(lang: string) {
  locale.value = lang
  localStorage.setItem('envm-locale', lang)
}

defineEmits(['select', 'add', 'edit', 'delete'])

</script>
<style scoped>
.sidebar-header-actions{
  display: flex;
  gap: 6px;
}
</style>