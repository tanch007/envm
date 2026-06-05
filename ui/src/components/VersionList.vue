<template>
  <main class="main-panel" data-component="Version Panel" data-od-id="main-panel">
    <header class="panel-header" data-component="Panel Header" data-od-id="panel-header">
      <template v-if="currentEnv">
        <div class="panel-title">
          <span class="title-icon">{{ currentEnv.icon || currentEnv.name.slice(0,1).toUpperCase() }}</span>
          {{ currentEnv.name }}
        </div>
        <div class="panel-desc">{{ currentEnv.desc }}</div>
        <div class="panel-stats">
          <span class="stat-item">{{ $t('panel.installedCount', { count: installedCount }) }}</span>
          <span class="stat-item">{{ $t('panel.currentVersion', { version: activeVersion || $t('panel.notSet') }) }}</span>
        </div>
        <div class="panel-toolbar">
          <div class="panel-search">
            <span class="i-mdi-magnify search-icon"></span>
            <input v-model="searchQuery" :placeholder="$t('panel.searchPlaceholder')" />
            <button v-if="searchQuery" class="search-clear i-mdi-close" @click="searchQuery = ''" :title="$t('panel.clearSearch')"></button>
          </div>
          <div class="filter-tabs">
            <button
              v-for="tab in filterTabs"
              :key="tab.key"
              :class="['filter-tab', { active: filterStatus === tab.key }]"
              @click="filterStatus = tab.key"
            >{{ tab.label }}</button>
          </div>
          <button class="refresh-btn" :class="{ loading: refreshLoading }" @click="refreshList" :title="$t('panel.refreshList')">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 10a7 7 0 11-2.5-5.5"/>
              <path d="M17 3v4h-4"/>
            </svg>
            <span>{{ $t('common.refresh') }}</span>
          </button>
        </div>
      </template>
      <template v-else>
        <div class="panel-title">{{ $t('panel.title') }}</div>
        <div class="panel-desc">{{ $t('panel.desc') }}</div>
      </template>
    </header>
    <section class="flex-1 overflow-auto " v-loading="loading">
      <section class="version-list" data-component="Version List" data-od-id="version-list">
        <template v-if="currentEnv && filteredData.length > 0">
          <VersionItem v-for="(ver, index) in filteredData" :ver="ver" :download-status="downloadingMap[ver.id]" :refresh-list="loadData" @download="handleDownload" ></VersionItem>
        </template>
        <template v-else-if="currentEnv">
          <div class="empty-state" data-component="Empty State" data-od-id="empty-state">
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="36" height="36" rx="4"/><path d="M6 16h36"/><path d="M16 6v36"/></svg>
            <p>{{ emptyMessage }}</p>
            <button class="empty-refresh-btn" @click="refreshList" :disabled="refreshLoading">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 10a7 7 0 11-2.5-5.5"/>
                <path d="M17 3v4h-4"/>
              </svg>
              <span>{{ refreshLoading ? $t('common.loading') : $t('panel.fetchVersions') }}</span>
            </button>
          </div>
        </template>
        <template v-else>
          <div class="empty-state" data-component="Empty State" data-od-id="empty-state">
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="36" height="36" rx="4"/><path d="M6 16h36"/><path d="M16 6v36"/></svg>
            <p>{{ $t('versionList.emptyNoEnv') }}</p>
          </div>
        </template>
      </section>
    </section>
  </main>
</template>

<script setup  lang="ts">
import api,{ type EnvItem } from '@/apis/EnvItem.ts';
import groupApi from '@/apis/EnvGroup.ts';
import { useRequest } from 'alova/client';
import { computed, onMounted, onUnmounted, reactive, ref, shallowRef, watch } from 'vue';
import { type EnvGroup } from "@/apis/EnvGroup";
import { getWsManager } from '@/comm/websocket';
import type { DownloadProgress, DownloadComplete, DownloadError } from '@/comm/websocket';
import VersionItem from '@/components/VersionItem.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()


const props = defineProps<{
  currentEnv:EnvGroup
}>()

defineEmits(['download', 'activate'])

/* ── WebSocket 实时下载进度 ── */

interface DownloadingInfo {
  progress: number
  speed: number
}

const downloadingMap = ref<Record<string, DownloadingInfo>>({})

function handleDownload(item: EnvItem) {
  downloadingMap.value[item.id] = {
    progress: 0,
    speed: 0,
  }
}

function setupWebSocket() {
  const ws = getWsManager()

  ws.on('progress', (data: DownloadProgress) => {
    downloadingMap.value[data.itemId] = {
      progress: data.percentage,
      speed: data.speed,
    }
  })

  ws.on('complete', (data: DownloadComplete) => {
    delete downloadingMap.value[data.itemId]
    setTimeout(()=>{loadData()}, 500)
  })

  ws.on('error', (data: DownloadError) => {
    delete downloadingMap.value[data.itemId]
    ElMessage.error(t('versionList.downloadFailed', { error: data.error }))
    setTimeout(()=>{loadData()}, 500)
  })

  ws.connect()
}

function teardownWebSocket() {
  const ws = getWsManager()
  ws.off('progress')
  ws.off('complete')
  ws.off('error')
}

watch(()=>props.currentEnv,()=>{
    downloadingMap.value={}
    data.value=[]
    loadData()
})
const { data,loading,send:loadData } = useRequest(() => api.getItems(props.currentEnv.id), { immediate: false,initialData:[] })
const { send:refreshList,loading:refreshLoading,onSuccess } = useRequest(() => groupApi.refreshList(props.currentEnv.id), { immediate: false })

onSuccess(()=>{
    loadData()
    ElMessage.success(t('versionList.fetchSuccess'))
})

onMounted(() => {
    props.currentEnv && loadData();
    setupWebSocket()
})

onUnmounted(() => {
  teardownWebSocket()
})

const installedCount = computed(() => {
  if (!props.currentEnv) return 0
  return data.value.filter(a=>!!a.dirPath).length
})

const activeVersion = computed(() => {
  if (!props.currentEnv) return null
  const active = data.value.find(a=>a.enable)
  return active?.version || null
})

const searchQuery = ref('')
type FilterStatus = 'all' | 'installed' | 'uninstalled'
const filterStatus = ref<FilterStatus>('all')
const filterTabs = computed(()=>[
  { key: 'all' as FilterStatus, label: t('versionList.all') },
  { key: 'installed' as FilterStatus, label: t('versionList.installed') },
  { key: 'uninstalled' as FilterStatus, label: t('versionList.uninstalled') },
])

const filteredData = computed(() => {
  let list = data.value
  // 安装状态过滤
  if (filterStatus.value === 'installed') {
    list = list.filter(v => !!v.dirPath)
  } else if (filterStatus.value === 'uninstalled') {
    list = list.filter(v => !v.dirPath)
  }
  // 搜索文本过滤
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(v => {
      return (v.version || '').toLowerCase().includes(q) || (v.fileName || '').toLowerCase().includes(q)
    })
  }
  return list
})

const emptyMessage = computed(() => {
  if (!props.currentEnv) return t('versionList.emptyNoEnv')
  if (filterStatus.value === 'installed') return t('versionList.emptyNoInstalled')
  if (filterStatus.value === 'uninstalled') return t('versionList.emptyAllInstalled')
  return t('versionList.emptyNoVersions')
})
</script>

<style scoped>
.panel-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 36px;
  border-radius: calc(var(--radius) + 2px);
  border: 1px solid var(--border);
  background: var(--card);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.panel-search:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
}

.panel-search .search-icon {
  font-size: 16px;
  color: var(--muted);
  flex-shrink: 0;
  opacity: 0.6;
}

.panel-search input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--fg);
  letter-spacing: 0.01em;
}

.panel-search input::placeholder {
  color: var(--muted);
  opacity: 0.6;
}

.panel-search .search-clear {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: color-mix(in srgb, var(--fg) 12%, transparent);
  color: var(--muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
  transition: background 0.15s ease, color 0.15s ease;
}

.panel-search .search-clear:hover {
  background: color-mix(in srgb, var(--fg) 20%, transparent);
  color: var(--fg);
}

.filter-tabs {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  background: color-mix(in srgb, var(--fg) 6%, var(--bg));
  padding: 3px;
  border-radius: calc(var(--radius) + 4px);
}

.filter-tab {
  padding: 5px 14px;
  border: none;
  border-radius: calc(var(--radius) + 2px);
  background: transparent;
  color: var(--muted);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 450;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
  white-space: nowrap;
}

.filter-tab:hover {
  color: var(--fg);
}

.filter-tab.active {
  background: var(--accent);
  color: var(--bg);
  font-weight: 540;
  box-shadow: 0 1px 4px color-mix(in srgb, var(--accent) 40%, transparent);
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0 12px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: calc(var(--radius) + 2px);
  background: var(--card);
  color: var(--muted);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 450;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  white-space: nowrap;
  flex-shrink: 0;
}

.refresh-btn:hover {
  border-color: var(--accent);
  color: var(--fg);
  background: color-mix(in srgb, var(--accent) 6%, var(--card));
}

.refresh-btn:active {
  transform: scale(0.96);
}

.refresh-btn svg {
  width: 15px;
  height: 15px;
  transition: transform 0.3s ease;
}

.refresh-btn.loading {
  pointer-events: none;
  opacity: 0.7;
}

.refresh-btn.loading svg {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.panel-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.panel-search {
  flex: 1;
}

.speed-text {
  font-size: 11px;
  color: var(--muted);
  margin-left: 4px;
  opacity: 0.75;
}

.empty-refresh-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 16px;
  padding: 4px 0;
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--accent);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 450;
  line-height: 1;
  cursor: pointer;
  transition: opacity 0.2s ease;
  outline: none;
}

.empty-refresh-btn:hover {
  opacity: 0.75;
}

.empty-refresh-btn:active {
  opacity: 0.6;
}

.empty-refresh-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.empty-refresh-btn svg {
  width: 15px;
  height: 15px;
  display: block;
}
</style>