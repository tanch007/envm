<template>
    <el-dialog class="me-dialog" :title="dialog.title" v-model="dialog.visible" width="80%" :fullscreen="dialog.isFullscreen" @before-close="onClose" >
        <MonacoEditor v-model="editorContent" :style="{ width:'100%',height:dialog.isFullscreen ? '100%':'350px' }" :libs="libs"></MonacoEditor>
        <template #footer>
            <span>
                <el-button @click="toggleFullscreen">{{ dialog.isFullscreen ? $t('editor.exitFullscreen'):$t('editor.fullscreen') }}</el-button>
                <el-button type="primary" @click="onSave" :loading="dialog.loading">{{ $t('editor.save') }}</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { nextTick, ref, shallowRef, toRaw } from 'vue';
import MonacoEditor from "./MonacoEditor.vue";

defineProps<{
    libs?:{ name:string,content:string  }[]
}>()
const dialog = ref({ visible: false, title: '详情', isFullscreen: false,atth:undefined,loading:false })

const editorContent = ref('')
const emiter = defineEmits(['change'])

const toggleFullscreen = () => {
    dialog.value.isFullscreen = !dialog.value.isFullscreen
}
const onSave = async () => {
    dialog.value.visible = false
    emiter('change',toRaw(editorContent.value),dialog.value.atth)
}
const onClose=()=>{
    dialog.value.visible = false
}
defineExpose({
    show(title: string,conent:string,atth?:any) {
        dialog.value.title = title
        dialog.value.atth = atth
        dialog.value.visible = true
        editorContent.value = conent
    }
})
</script>

<style scoped lang="less">

</style>