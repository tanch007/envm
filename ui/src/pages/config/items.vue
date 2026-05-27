<template>
    <section class="flex-1">
        <el-empty v-if="!currentGroup"></el-empty>
        <template v-else>
            <h2 class="font-bold mb-4 flex flex-content-center">
                版本列表
                <button class="i-mdi-refresh w-6 h-6 text-blue" @click="refreshList" title="重新获取版本列表" v-loading="refreshLoading"></button>
            </h2>
            <el-table class="w-full" style="height:600px;" :data="data" border stripe v-loading="loading">
                <el-table-column  type="index" label="#" width="60" />
                <el-table-column  prop="version" label="版本"></el-table-column>
                <el-table-column  prop="enable" label="当前环境版本" width="200">
                    <template #default="{row}">
                        <el-switch v-if="row" v-model="row.enable" :active-value="1" :inactive-value="0" @click="changeStatus(row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column  label="操作" width="200">
                    <template #default="{row,$index}">
                        <button class="i-mdi-delete p-1 mr-1" @click="handleDelete(row,$index)"></button>
                    </template>
                </el-table-column>
            </el-table>
        </template>
    </section>
</template>

<script setup lang="ts">
import api,{ type EnvItem } from '@/apis/EnvItem.ts';
import groupApi from '@/apis/EnvGroup.ts';
import { useRequest } from 'alova/client';
import { computed, onMounted, ref, shallowRef, watch } from 'vue';

const props = defineProps<{
    currentGroup:string
}>()

/**
 * 
 */

watch(()=>props.currentGroup,()=>{
    loadData()
})
const { data,loading,send:loadData } = useRequest(() => api.getItems(props.currentGroup), { immediate: false })
const { send:refreshList,loading:refreshLoading,onSuccess } = useRequest(() => groupApi.refreshList(props.currentGroup), { immediate: false })

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
        await api.changeStatus({ id:row.id, enable: row.enable });
        if (row.enable) {
            data.value.forEach(item => {
                if (item.id != row.id) {
                    item.enable = false
                }
            })
        }
        ElMessage.success("操作成功");
    } catch (e) {
        ElMessage.error("操作失败");
    }
}

onMounted(() => {
    props.currentGroup && loadData();
});

</script>