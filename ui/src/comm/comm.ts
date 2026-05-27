
export default {
    /**
     * 根据[数据对象]替换占位符号{key}内容
     * 示例：http://wwww.abc.com?operId={operId} => http://wwww.abc.com?operId=123
     * @param str 需要替换的字符串
     * @param data 数据对象
     * @returns 替换后的str
     */
    replaceStr(str: string, data: any) {
        let result = str;
        let vars = result.match(/{.*?}/g);
        if (vars && vars.length) {
            vars.forEach(key => {
                let regex = new RegExp(key, "g");
                let field = key.replace("{", "").replace("}", "");
                result = result.replace(regex, data[field]);
            });
        }
        return result;
    },
    /**
     * 执行脚本
     * @param script 脚本
     * @param params 传递参数
     * @returns 脚本结果
     */
    async executeScript(script: string, ...params: any) {
        let fun;
        eval(`fun = ${script}`);
        return await fun(...params);
    },
    /**
     * 下载文件
     * @param filename 下载文件名称
     * @param content 文件内容
     */
    async downloadFile(filename: string, content: Blob | string) {
        // 创建一个文本内容
        let blob;
        if (typeof content == "string") {
            blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        } else {
            blob = content;
        }

        // 创建一个可下载的URL
        let url = URL.createObjectURL(blob);

        // 创建一个<a>元素并模拟点击来下载文件
        let downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = filename; // 设置下载文件的名称
        document.body.appendChild(downloadLink);
        downloadLink.click();
        // 下载完成后移除链接
        document.body.removeChild(downloadLink);
    },
    /**
     * 选择并打开一个文件
     * @returns
     */
    async openFile(): Promise<string> {
        return new Promise((resolve, reject) => {
            // 创建一个input元素用于选择文件
            let fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.onchange = event => {
                let file = (event.target as HTMLInputElement).files[0];
                if (file) {
                    // 创建FileReader对象
                    let reader = new FileReader();

                    // 监听文件读取完成事件
                    reader.onload = function (e) {
                        // 打印读取的文件内容
                        resolve(e.target.result as string);
                    };

                    // 根据文件类型读取文本或二进制数据
                    reader.readAsText(file);
                } else {
                    return reject("未选择文件");
                }
            };
            fileInput.click()
        });
    },
    /**
     * 选择并打开一个文件
     * @returns
     */
    async openSelectFile(): Promise<File> {
        return new Promise((resolve, reject) => {
            // 创建一个input元素用于选择文件
            let fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.onchange = event => {
                let file = (event.target as HTMLInputElement).files[0];
                if (file) {
                    resolve(file)
                } else {
                    return reject("未选择文件");
                }
            };
            fileInput.click()
        });
    },
    /**
     * 
     * 将扁平数组转换成树形结构
     * @param {Array} array - 扁平数组
     * @param {Object} diagnosisOptions - 配置项
     * @param {string} diagnosisOptions.id - 节点唯一标识字段 (默认 'id')
     * @param {string} diagnosisOptions.parent - 父节点标识字段 (默认 'parentId')
     * @param {string} diagnosisOptions.children - 子节点存放字段 (默认 'children')
     * @returns {Array} 树形结构数据
     */
    toTree<T>(array: Array<T>, options: { id: string, parent: string, children: string } = {} as any) {
        const { id = 'id', parent = 'parentId', children = 'children' } = options;

        // 创建映射表，便于快速查找节点
        const map = new Map();
        array.forEach(item => {
            map.set(item[id], { ...item, [children]: [] });
        });

        const result = [];
        map.forEach(node => {
            const parentId = node[parent];
            // 如果 parentId 是 null、undefined 或空字符串，则作为顶级节点
            if (parentId == null || parentId === '' || !map.has(parentId)) {
                result.push(node);
            } else {
                // 否则添加到父节点的 children 中
                const parentNode = map.get(parentId);
                if (parentNode) {
                    parentNode[children].push(node);
                }
            }
        });
        return result;
    },
    /**
     * 树结构展开
     * @param treeData 
     */
    flattenTree(treeData) {
        const result = [];

        function traverse(node) {
            if (!node) return;

            // 使用解构删除指定属性并保留其他属性
            const { Children, _X_ROW_CHILD, _X_ROW_KEY, ...rest } = node;

            // 添加处理后的节点到结果数组
            result.push(rest);

            // 递归处理子节点（如果存在）
            if (Children && Children.length > 0) {
                Children.forEach(child => traverse(child));
            }
        }

        // 遍历根节点数组
        treeData.forEach(rootNode => traverse(rootNode));

        return result;
    },
};
