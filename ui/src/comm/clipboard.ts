/**
 * 复制文本到剪切板
 * @param text 
 * @returns 
 */
function copyToClipboard(text:string) {
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }

    // 降级方案
    return new Promise((resolve, reject) => {
        try {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.left = "-9999px";
            textarea.style.top = "-9999px";

            document.body.appendChild(textarea);
            textarea.select();

            const successful = document.execCommand("copy");
            document.body.removeChild(textarea);

            successful ? resolve('ok') : reject(new Error("execCommand copy failed"));
        } catch (err) {
            reject(err);
        }
    });
}

export {
    copyToClipboard
};
