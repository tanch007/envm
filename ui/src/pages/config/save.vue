<template>
    <el-dialog v-model="dialogVisible" :title="$t('envGroup.title')" width="600px">
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="150px">
            <el-form-item :label="$t('envGroup.name')" prop="name">
                <el-input v-model="formData.name" :placeholder="$t('envGroup.placeholderName')" />
            </el-form-item>
            <el-form-item :label="$t('envGroup.routeUrl')" prop="routeUrl">
                <el-input v-model="formData.routeUrl" type="textarea" :rows="3" :placeholder="$t('envGroup.placeholderUrl')" />
            </el-form-item>
            <el-form-item :label="$t('envGroup.getListScript')" prop="getListScript">
                <el-button type="primary" link @click="editor.show($t('editor.queryScript'), formData.getListScript || scriptDefines.getListScript)">{{ $t('common.setting') }}</el-button>
            </el-form-item>
            <el-form-item :label="$t('envGroup.sort')" prop="sort">
                <el-input-number v-model="formData.sort" :min="1" control></el-input-number>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" :loading="loading" @click="confirm">{{ $t('common.save') }}</el-button>
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
import { useI18n } from 'vue-i18n'

const { t } = useI18n()


const dialogVisible = ref(false);
const formData = ref<EnvGroup>();
    const formRef = shallowRef<FormInstance>()

const emiter = defineEmits(['confirm'])
const rules: FormRules = {
  name: [{ required: true, message: t("envGroup.placeholderName"), trigger: "blur" }],
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