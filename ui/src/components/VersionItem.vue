<template>
    <div :class="['version-item', { 'active-version': ver.enable }]">
        <div class="version-info">
            <div class="version-number">{{ ver.version }}</div>
            <div class="version-date">{{ ver.date }}</div>
        </div>
        <div class="version-status">
            <!-- 正在下载 -->
            <template v-if="!!downloadStatus">
                <div class="progress-wrap">
                    <div class="progress-bar animating"
                        :style="{ width: (downloadStatus?.progress ?? 0) + '%' }"></div>
                </div>
                <span class="progress-text">
                    {{ (downloadStatus?.progress ?? 0).toFixed(1) }}%
                    <span class="speed-text">{{ formatSpeed(downloadStatus?.speed) }}</span>
                </span>
            </template>
            <!-- 未下载状态 -->
            <template v-else>
                <span v-if="!ver.dirPath" class="badge badge-available">未安装</span>
                <span v-else-if="ver.enable"class="badge badge-active">当前版本</span>
                <span v-else class="badge badge-installed">已安装</span>

                <button v-if="!ver.enable" class="btn btn-primary" @click="changeStatus()" :disabled="changeLoading">激活</button>
                <button v-else class="btn" @click="changeStatus()" :disabled="changeLoading">取消激活</button>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import api, { type EnvItem } from '@/apis/EnvItem.ts';
import { useRequest } from 'alova/client';

const props = defineProps<{
    ver: EnvItem,
    downloadStatus?:{ progress: number, speed?: number } | null,
    refreshList:Function
}>()

const emits = defineEmits(['download'])
const { loading: changeLoading, send,onSuccess } = useRequest(() => api.changeStatus({ id: props.ver.id, enable: !props.ver.enable }), { immediate: false })

onSuccess(()=>props.refreshList())

function formatSpeed(speed?: number): string {
  if (speed == null) return ''
  if (speed < 1024) return `${speed} B/s`
  if (speed < 1024 * 1024) return `${(speed / 1024).toFixed(1)} KB/s`
  return `${(speed / (1024 * 1024)).toFixed(1)} MB/s`
}

function changeStatus() {
    if(!props.ver.dirPath){
        emits('download', props.ver)
    }
    send()
}

</script>

<style scoped>
.speed-text {
    font-size: 11px;
    color: var(--muted);
    margin-left: 4px;
    opacity: 0.75;
}
</style>