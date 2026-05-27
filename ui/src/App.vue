<script setup lang="ts">
import zhCn from "element-plus/es/locale/lang/zh-cn";

</script>

<template>
    <el-config-provider :locale="zhCn">
        <router-view />
        <!-- 或其他根组件，如 <YourMainComponent /> -->
    </el-config-provider>
</template>
