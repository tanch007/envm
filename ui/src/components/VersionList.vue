<template>
  <main class="main-panel" data-component="Version Panel" data-od-id="main-panel">
    <header class="panel-header" data-component="Panel Header" data-od-id="panel-header">
      <template v-if="currentEnv">
        <div class="panel-title">
          <span class="title-icon">{{ currentEnv.icon || currentEnv.name.slice(0,1).toUpperCase() }}</span>
          {{ currentEnv.name }}
          <button class="i-mdi-refresh mt-2 w-6 h-6 text-green" @click="refreshList" title="重新获取版本列表" v-loading="refreshLoading"></button>
        </div>
        <div class="panel-desc">{{ currentEnv.desc }}</div>
        <div class="panel-stats">
          <span class="stat-item">已安装 <span class="stat-value">{{ installedCount }}</span> 个版本</span>
          <span class="stat-item">当前版本 <span class="stat-value">{{ activeVersion || '未设置' }}</span></span>
        </div>
        <div class="panel-search">
          <span class="i-mdi-magnify search-icon"></span>
          <input v-model="searchQuery" placeholder="搜索版本号或文件名…" />
          <button v-if="searchQuery" class="search-clear i-mdi-close" @click="searchQuery = ''" title="清除搜索"></button>
        </div>
      </template>
      <template v-else>
        <div class="panel-title">请添加环境</div>
        <div class="panel-desc">点击左侧「添加环境」按钮创建新的运行时环境</div>
      </template>
    </header>
    <section class="flex-1 overflow-auto ">
      <section class="version-list" data-component="Version List" data-od-id="version-list">
        <template v-if="currentEnv && data.length > 0">
          <div
            v-for="(ver, index) in filteredData"
            :key="ver.version"
            :class="['version-item', { 'active-version': ver.enable }]"
            data-component="Version Item"
            :data-od-id="'ver-' + currentEnv.id + '-' + ver.version"
          >
            <div class="version-info">
              <div class="version-number">{{ ver.version }}</div>
              <div class="version-date">{{ ver.date }}</div>
            </div>
            <div class="version-status">
              <!-- Available -->
              <template v-if="!ver.dirPath && !ver.enable && !downloadingMap[ver.id]">
                <span class="badge badge-available">未安装</span>
                <button class="btn btn-primary" @click="changeStatus(ver)" :aria-label="'下载 ' + ver.version">下载</button>
              </template>
              <!-- Downloading (WebSocket real-time progress) -->
              <template v-if="downloadingMap[ver.id] || ver.status === 'downloading'">
                <div class="progress-wrap">
                  <div class="progress-bar animating" :style="{ width: (downloadingMap[ver.id]?.progress ?? ver.progress ?? 0) + '%' }"></div>
                </div>
                <span class="progress-text">
                  <template v-if="downloadingMap[ver.id]">
                    {{ (downloadingMap[ver.id]?.progress ?? 0).toFixed(1) }}%
                    <span class="speed-text">{{ formatSpeed(downloadingMap[ver.id]?.speed) }}</span>
                  </template>
                  <template v-else>
                    {{ ver.progress }}%
                  </template>
                </span>
              </template>
              <!-- Installed -->
              <template v-if="!!ver.dirPath && !ver.enable">
                <span class="badge badge-installed">已安装</span>
                <button class="btn"  @click="changeStatus(ver)" :aria-label="'激活 ' + ver.version">激活</button>
              </template>
              <!-- Active -->
              <template v-if="ver.enable">
                <span class="badge badge-active">当前版本</span>
                <span style="font-size:13px;color:var(--muted);letter-spacing:0.02em">✓ 已激活</span>
                <button class="btn" @click="changeStatus(ver)" :aria-label="'取消激活 ' + ver.version" :disabled="changeLoading">取消激活</button>
              </template>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="empty-state" data-component="Empty State" data-od-id="empty-state">
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="36" height="36" rx="4"/><path d="M6 16h36"/><path d="M16 6v36"/></svg>
            <p>{{ currentEnv ? '暂无可用版本' : '请先添加一个运行时环境' }}</p>
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

const props = defineProps<{
  currentEnv:EnvGroup
}>()

defineEmits(['download', 'activate'])

/* ── WebSocket 实时下载进度 ── */

interface DownloadingInfo {
  progress: number
  speed: number
}

const downloadingMap = reactive<Record<string, DownloadingInfo>>({})

function formatSpeed(speed?: number): string {
  if (speed == null) return ''
  if (speed < 1024) return `${speed} B/s`
  if (speed < 1024 * 1024) return `${(speed / 1024).toFixed(1)} KB/s`
  return `${(speed / (1024 * 1024)).toFixed(1)} MB/s`
}

function setupWebSocket() {
  const ws = getWsManager()

  ws.on('progress', (data: DownloadProgress) => {
    downloadingMap[data.itemId] = {
      progress: data.percentage,
      speed: data.speed,
    }
  })

  ws.on('complete', (data: DownloadComplete) => {
    delete downloadingMap[data.itemId]
    setTimeout(()=>{loadData()}, 500)
  })

  ws.on('error', (data: DownloadError) => {
    delete downloadingMap[data.itemId]
    ElMessage.error(`下载失败: ${data.error}`)
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
    loadData()
})
const { data,loading,send:loadData } = useRequest(() => api.getItems(props.currentEnv.id), { immediate: false,initialData:[] })
const { send:refreshList,loading:refreshLoading,onSuccess } = useRequest(() => groupApi.refreshList(props.currentEnv.id), { immediate: false })
const { loading:changeLoading,send:sendChangeStatus } = useRequest(api.changeStatus, { immediate: false })

onSuccess(()=>{
    loadData()
    ElMessage.success('获取成功')
})
async function handleDelete(row: EnvItem,index:number) {
  ElMessageBox.confirm("确认删除该项？").then(async () => {
    try {
      await api.remove(row.id);
      ElMessage.success("删除成功");
      data.value.splice(index,1)
    } catch (e) {
      ElMessage.error("删除失败");
    }
  })
}

async function changeStatus(row: EnvItem) {
  try {
    // 如果没有安装目录，走下载流程（后端根据行信息处理）
    if (!row.dirPath) {
      // 立即标记为下载中，等待 WebSocket 推送进度
      downloadingMap[row.id] = { progress: 0, speed: 0 }
    } 
    await sendChangeStatus({ id: row.id, enable: !row.enable } as EnvItem);
  } catch (e) {
    // 如果下载启动失败，清除下载状态
    if (!row.dirPath) {
      delete downloadingMap[row.id]
    }
    ElMessage.error("操作失败");
  }
  
  loadData()
}

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
const filteredData = computed(() => {
  if (!searchQuery.value) return data.value
  const q = searchQuery.value.toLowerCase()
  return data.value.filter(v => {
    return (v.version || '').toLowerCase().includes(q) || (v.fileName || '').toLowerCase().includes(q)
  })
})
</script>

<style scoped>
.panel-search {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
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

.speed-text {
  font-size: 11px;
  color: var(--muted);
  margin-left: 4px;
  opacity: 0.75;
}
</style>