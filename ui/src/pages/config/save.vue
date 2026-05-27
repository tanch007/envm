<template>
    <el-dialog v-model="dialogVisible" title="环境详情" width="600px">
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
            <el-form-item label="环境名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入环境名称" />
            </el-form-item>
            <el-form-item label="仓库URL" prop="routeUrl">
                <el-input v-model="formData.routeUrl" type="textarea" :rows="3" placeholder="请输入仓库URL" />
            </el-form-item>
            <el-form-item label="获取列表脚本" prop="getListScript">
                <el-button type="primary" link @click="editor.show('查询脚本', formData.getListScript || scriptDefines.getListScript)">设置</el-button>
            </el-form-item>
            <el-form-item label="序号" prop="sort">
                <el-input-number v-model="formData.sort" :min="1" control></el-input-number>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="loading" @click="confirm">保存</el-button>
        </template>
    </el-dialog>
    <Editor ref="editor" :libs="editorLibs" @change="onEditorSave"></Editor>
</template>

<script setup lang="ts">
import api, { type EnvGroup } from "@/apis/EnvGroup";
import { useRequest } from 'alova/client';
import type { FormRules, FormInstance } from 'element-plus';
import { ref, shallowRef } from 'vue';
import scriptDefines from "./scriptDefines";
import Editor from "@/components/TsEditorDialog.vue";


const dialogVisible = ref(false);
const formData = ref<EnvGroup>();
    const formRef = shallowRef<FormInstance>()

const emiter = defineEmits(['confirm'])
const rules: FormRules = {
  name: [{ required: true, message: "请输入环境名称", trigger: "blur" }],
};

const editor = shallowRef<InstanceType<typeof Editor>>();
const editorLibs = ref([{
  name: 'input-types',
  content: scriptDefines.getListScriptType
}])

const { send,loading,onSuccess } = useRequest(()=>api.save(formData.value),{immediate:false})

onSuccess(() => {
    dialogVisible.value = false
    emiter('confirm')
})
const confirm = async () => {
    await formRef.value.validate((valid, fields) => {
        if (valid) {
            send()
        }
    })
}

const onEditorSave = (value: string, other: { key: string }) => {
    formData.value.getListScript  = value
};

defineExpose({
    show(data:Partial<EnvGroup>){
        formData.value = data
        dialogVisible.value = true
    }
})
</script>