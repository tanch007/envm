<template>
  <aside class="sidebar" data-component="Environment Sidebar" data-od-id="sidebar">
    <nav class="sidebar-header">
      <div class="sidebar-brand">ENVM</div>
      <button class="theme-toggle" @click="toggle" aria-label="切换主题" data-component="Theme Toggle" data-od-id="theme-toggle">
        <svg v-if="appearance === 'dark'" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="4"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41"/></svg>
        <svg v-else viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17 10.5A7 7 0 019.5 3 7 7 0 1017 10.5z"/></svg>
      </button>
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
        :aria-label="'选择 ' + env.name"
      >
        <span class="env-icon">{{ env.icon || env.name.slice(0,1).toUpperCase() }}</span>
        <span class="env-name">{{ env.name }}</span>
        <span class="env-actions">
          <button class="env-action-btn" @click.stop="$emit('edit', env)" :aria-label="'编辑 ' + env.name" title="编辑">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 1.5l3 3L5 14H2v-3z"/><path d="M9 4l3 3"/></svg>
          </button>
          <button class="env-action-btn env-delete" @click.stop="$emit('delete', env,index)" :aria-label="'删除 ' + env.name" title="删除">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h10M6 4V2h4v2M5 4v10h6V4"/></svg>
          </button>
        </span>
      </li>
    </ul>
    <button class="env-add-btn" @click="$emit('add')" data-component="Add Environment Button" data-od-id="env-add-btn" aria-label="添加环境">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M8 3v10M3 8h10"/></svg>
      添加环境
    </button>
    <!-- <div class="sidebar-footer">
      ENVM v0.0.1
    </div> -->
  </aside>
</template>

<script setup lang="ts">
import type { EnvGroup } from "@/apis/EnvGroup";
import { useTheme } from "@/comm/useTheme";

defineProps<{
  environments:Array<EnvGroup>,
  currentEnv?:EnvGroup
}>()

const { appearance, toggle } = useTheme()

defineEmits(['select', 'add', 'edit', 'delete'])

</script>