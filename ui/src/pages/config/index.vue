<template>
  <div class="p-4">
    <div class="mb-4">
      <el-button type="primary" @click="saveDialogRef.show({ sort: tableData.length + 1 })">新增环境</el-button>
    </div>
    <section class="flex gap-4">
      <section class="w-60 min-w-60">
        <ul>
          <li v-for="item,index in tableData" :class="{ active:currentGroup==item.id }" @click="changeGroup(item)">
            <span>{{item.name}}</span>
            <div class="actions">
              <button class="i-mdi-language-javascript p-1 mr-2" @click="showEditSctipt(item)" title="查询脚本"></button>
              <button class="i-mdi-edit p-1 mr-2" @click="saveDialogRef.show(item)" title="编辑"></button>
              <button class="i-mdi-delete p-1 mr-1" @click="handleDelete(item,index as number)" title="删除"></button>
            </div>
          </li>
        </ul>
        <el-empty v-if="!tableData.length"></el-empty>
      </section>
      <ItemsPannel :currentGroup="currentGroup"></ItemsPannel>
    </section>
    <el-button  class="absolute right-4 top-4"  size="large" @click="onExit" text >
      <template #icon>
        <div class="i-mdi-exit-run text-black"></div>
      </template>
      <span>退出系统</span>
    </el-button>
    <SaveDialog ref="saveDialogRef" @confirm="loadData"></SaveDialog>
    <Editor ref="editor" :libs="editorLibs" @change="onEditorSave"></Editor>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, shallowRef, computed } from "vue";
import { type FormInstance, type FormRules } from "element-plus";
import { usePagination, useRequest } from "alova/client";
import Editor from "@/components/TsEditorDialog.vue";
import SaveDialog from "./save.vue";
import ItemsPannel from "./items.vue";
import scriptDefines from "./scriptDefines";
import { useRoute } from "vue-router";
import api, { type EnvGroup } from "@/apis/EnvGroup";
import systemApi from "@/apis/System.ts";

const saveDialogRef = shallowRef()
const currentGroup = ref('')

const editor = shallowRef<InstanceType<typeof Editor>>();
const editorLibs = ref([{
  name: 'input-types',
  content: scriptDefines.getListScriptType
}])
const { data: tableData, loading, send: loadData,onSuccess } =useRequest(api.getAll,{  })
onSuccess(()=>!currentGroup.value && tableData.value[0] && changeGroup(tableData.value[0]))

function changeGroup(item:EnvGroup) {
  currentGroup.value = item.id
}
function showEditSctipt(item:EnvGroup) {
  editor.value.show('查询脚本', item.getListScript || scriptDefines.getListScript, { key: item.id })
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

const onEditorSave = (value: string, other: { key: string }) => {
    let row = tableData.value.find(a=>a.id==other.key)
    //@ts-ignore
    row.getListScript = value
    api.save({ id:row.id,getListScript:value }).then(()=>{
        ElMessage.success('修改成功')
    })
};

const onExit=()=>{
  systemApi.exit().then(res=>{
    window.close()
    ElMessage.success('已退出')
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
