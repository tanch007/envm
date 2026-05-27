import {  createRouter, createWebHashHistory } from "vue-router";

const routes = [
    {
        path: "/",
        name: "defaul1t",
        component: () => import("@/pages/config/index.vue"),
        meta: {
            title: "配置",
            singlePage: true,
            isSkipAuth: true
        }
    },
    {
        path: "/config",
        name: "default",
        component: () => import("@/pages/config/index.vue"),
        meta: {
            title: "配置",
            singlePage: true,
            isSkipAuth: true
        }
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

router.beforeEach((to, from) => {
    return true;
});
export { routes };
export default router;
