import { alovaInstance } from "@/comm/alova";

export default {
    exit:()=>alovaInstance.Get('/system/exit'),
}