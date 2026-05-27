<template>
     <div ref="editorRef" style="height: 100%; width: 100%;">
        
    </div>
</template>
<script lang="ts" setup>
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { defineComponent, onMounted, onUnmounted, shallowRef, watch } from "vue";

self.MonacoEnvironment = {
    getWorker(_: any, label: any) {
        if (label === "json") {
            return new jsonWorker();
        }
        if (label === "css" || label === "scss" || label === "less") {
            return new cssWorker();
        }
        if (label === "html" || label === "handlebars" || label === "razor") {
            return new htmlWorker();
        }
        if (label === "typescript" || label === "javascript") {
            return new tsWorker();
        }
        return new editorWorker();
    }
};

export type LanguageType = 'javascript'|'typescript'|'json'|'css'|'html';
const props = defineProps<{
    language?:LanguageType,
    libs?:{ name:string,content:string  }[]
}>()
const emiter = defineEmits(['change'])
const modelValue = defineModel<string>()
const editorRef = shallowRef<HTMLDivElement>();
    
let editorInstance: monaco.editor.IStandaloneCodeEditor;
let loadedLibs = new Map()
let resizeObserver:ResizeObserver

//切换语言
function changeLanguage(newLanguage: LanguageType) {
    const model = editorInstance.getModel();
    if (model) {
        monaco.editor.setModelLanguage(model, newLanguage);
    }
}
// 添加类型定义
function addTypeLib(name: string, content: string, path = null) {
    const libPath = path || `ts:extraLibs/${name}.d.ts`;

    if (loadedLibs.has(name)) {
        // 更新现有类型定义
        removeTypeLib(name);
    }
    
    let model = monaco.editor.getModel(monaco.Uri.parse(libPath));
    if (!model) {
        monaco.editor.createModel(content, props.language||'javascript', monaco.Uri.parse(libPath));
    } else {
        model.setValue(content);
    }
    return model;
}
// 移除类型定义
function removeTypeLib(name: string) {
    const lib = loadedLibs.get(name);
    if (lib) {
        lib.dispose(); // 重要：释放资源
        loadedLibs.delete(name);
    }
}
function setValue(value:string) {
    editorInstance.setValue(value)
}
function getValue():string {
    return editorInstance.getValue()
}

watch(modelValue, (newValue) => {
    if (editorInstance && editorInstance.getValue() !== newValue) {
        editorInstance.setValue(newValue!);
    }
})
watch(()=>props.language, (newValue) => {
    changeLanguage(newValue!)
})
watch(()=>props.libs, (newLibs) => {
    if (newLibs) {
        // 先移除已有的类型定义
        loadedLibs.forEach((_, name) => {
            removeTypeLib(name);
        });
        // 添加新的类型定义
        newLibs.forEach(lib => {
            addTypeLib(lib.name, lib.content)
        });
    }
})

onMounted(()=>{
    console.log('init monaco')
    editorInstance = monaco.editor.create(editorRef.value!, {
        value: modelValue.value,
        language: props.language || 'javascript',
        theme: 'vs-dark',
    });
    
    if (props.libs) {
        props.libs.forEach(lib => {
            addTypeLib(lib.name, lib.content)
        });
    }
    // 监听内容变化
    editorInstance.onDidChangeModelContent(() => {
        const value = editorInstance.getValue();
        if (modelValue.value !== value) {
            modelValue.value = value;
            emiter('change', value);
        }
    });
    resizeObserver = new ResizeObserver(()=>editorInstance.layout())
    resizeObserver.observe(editorRef.value!)
})

onUnmounted(() => {
    if (editorInstance) {
        editorInstance.dispose();
    }
    if (resizeObserver) {
        resizeObserver.disconnect()
    }
})


defineExpose({
    changeLanguage,
    addTypeLib,
    removeTypeLib,
    setValue,
    getValue
})
</script>

<style scoped></style>
