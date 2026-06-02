<template>
    <div class="app-shell " data-component="App Shell" data-od-id="app-shell">
    <EnvSidebar
      :environments="tableData"
      :currentEnv="currentEnv"
      @select="changeGroup"
      @add="saveDialogRef.show({ sort: tableData.length + 1 })"
      @edit="saveDialogRef?.show"
      @delete="handleDelete"
    />
    <VersionList :currentEnv="currentEnv" />
  </div>
    <SaveDialog ref="saveDialogRef" @confirm="loadData"></SaveDialog>
  <!-- </div> -->
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, shallowRef, computed } from "vue";
import { usePagination, useRequest } from "alova/client";
import SaveDialog from "./save.vue";
import api, { type EnvGroup } from "@/apis/EnvGroup";
import systemApi from "@/apis/System.ts";
import EnvSidebar from '@/components/EnvSidebar.vue'
import VersionList from '@/components/VersionList.vue'
const saveDialogRef = shallowRef()
const currentGroup = ref('')
const currentEnv = computed(()=>{
  if (!currentGroup.value) {
    return null
  }
  return tableData.value.find(a=>a.id==currentGroup.value)
})
const { data: tableData, loading, send: loadData,onSuccess } =useRequest(api.getAll,{ initialData:[] })
onSuccess(()=>!currentGroup.value && tableData.value[0] && changeGroup(tableData.value[0]))

function changeGroup(item:EnvGroup) {
  currentGroup.value = item.id
}

async function handleDelete(row: EnvGroup,index:number) {
  ElMessageBox.confirm("确认删除该项？").then(async () => {
    try {
      await api.remove(row.id);
      ElMessage.success("删除成功");
      tableData.value.splice(index,1)
    } catch (e) {
      ElMessage.error("删除失败");
    }
  })
}

</script>

<style scoped lang="less">
li{
  padding: 8px;
  background: #f1f1f1;
  border-radius: 6px;
  margin-bottom: 4px;
  transition: .3s;
  cursor: pointer;
  color: #333;
  position: relative;
  &:hover{
    background: #ddd;
    .actions{
      display: block;
    }
  }
  &.active{
    @apply bg-blue-200;
  }
  .actions{
    position: absolute;
    right:0;
    top:6px;
    z-index:1;
    display: none;
    float: right;
  }
}
</style>
