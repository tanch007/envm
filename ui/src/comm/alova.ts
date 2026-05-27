import { createAlova } from "alova";
import VueHook from "alova/vue";
import GlobalFetch from 'alova/fetch';
import { ElMessage } from "element-plus";

export const alovaInstance = createAlova({
  baseURL:'/api/envm/',
  statesHook: VueHook,
  requestAdapter: GlobalFetch(),
  timeout: 30 * 1000,
  cacheFor: null,
  beforeRequest(method) {
    let urlParams = new URLSearchParams(window.location.hash.replace(/^.*\?/, ''));
    let token = urlParams.get('token');
    if (token) {
      method.config.headers['DyFormToken'] = token;
    }

    const params = method.config.params || {};
    
    // 创建一个 URLSearchParams 对象来构建查询字符串
    const searchParams = new URLSearchParams();
    
    // 遍历参数对象
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // 如果是数组，为每个元素添加一个相同的 key
        value.forEach(item => searchParams.append(key, item));
      } else if (value !== undefined && value !== null) {
        // 如果不是数组，正常添加
        searchParams.append(key, value);
      }
    });
    
    // 将序列化后的参数字符串赋值给 url
    // 注意：需要先将原始的 params 设置为 undefined 或空对象，以免 Alova 再次序列化
    method.config.params = {};
    // 将构建好的查询字符串拼接到 url 上
    const queryString = searchParams.toString();
    method.url = method.url + (method.url.includes('?') ? '&' : '?') + queryString;
  },
  responded: {
    onComplete(method) {
      // 请求完成的拦截器
    },
    async onSuccess(response, method) {
      // 请求成功的拦截器
      const contentType = response.headers.get('Content-Type');
      if (response.ok) {
        if(!contentType){
          return ''
        }
        if (contentType.includes('application/json')) {
            return response.json()
        }else if (contentType.includes('text/plain')) {
            return response.text()
        }
        
        return response
      } else {
        let body = await response.text()
        let errMsg = body ? body : response.statusText;
        ElMessage.error(errMsg);
        throw Error(errMsg);
      }
    },
  },
});
