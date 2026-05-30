import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { ArchiveReader, libarchiveWasm } from "libarchive-wasm";
import path, { join } from "node:path";
import { $ } from "bun";

export async function createSymlink(source: string, target: string) {
    if (existsSync(target)) {
        await fs.rmdir(target);
    }
    let parentPath = path.dirname(target)
    if (!existsSync(parentPath)) {
        await fs.mkdir(parentPath);
    }
    await fs.symlink(source, target, "junction");
}

export async function folderExists(folderPath: string): Promise<boolean> {
    try {
        await fs.access(folderPath, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}


/**
 * 将压缩包解压到目标目录。
 * @param archivePath 压缩包文件路径，如 './data.zip' 或 './archive.rar'
 * @param targetDir   目标目录路径，如 './output'
 */
export async function extractTo(archivePath: string, targetDir: string) {
    // 1. 读取压缩包文件
    const fileBuffer = await fs.readFile(archivePath);
    const data = new Int8Array(fileBuffer);

    // 2. 加载 WASM 模块
    const mod = await libarchiveWasm();

    // 3. 创建 ArchiveReader 实例
    const reader = new ArchiveReader(mod, data);

    try {
        // 4. 检查第一层是否只有一个目录
        let flattenPath = "";

        // 5. 遍历压缩包内的每个条目
        let index = 0
        for (const entry of reader.entries()) {
            // 获取相对路径名（例如 "folder/file.txt"）
            const fullPathname = entry.getPathname();
            if (index === 0 && entry.getSize() == 0 && entry.getFiletype() === "Directory") {
                flattenPath = fullPathname
                index++;
                continue;
            }
            // 如果第一层只有一个目录，则去掉该目录前缀
            const relativePath = fullPathname.startsWith(flattenPath)
                ? fullPathname.slice(flattenPath.length)
                : fullPathname;

            // 跳过空的顶层目录名
            if (!relativePath) continue;

            // 拼接出完整的绝对路径或相对于当前工作目录的完整路径
            const fullPath = join(targetDir, relativePath);

            // 根据条目类型进行操作
            const entryType = entry.getFiletype();

            if (entryType === "Directory") {
                // 如果是目录，则创建目录
                await fs.mkdir(fullPath, { recursive: true });
                // console.log(`[目录] 已创建: ${relativePath}`);
            } else if (entryType === "File") {
                // 如果是文件，则确保其父目录存在，再写入文件内容
                const fileData = entry.readData();
                if (fileData) {
                    // 确保父目录存在
                    let parentPath = path.dirname(fullPath)
                    await fs.mkdir(parentPath, { recursive: true });
                    // 写入文件
                    await fs.writeFile(fullPath, Buffer.from(fileData));
                    // console.log(`[文件] 已写入: ${relativePath} (${entry.getSize()} bytes)`);
                }
            }
        }
    } finally {
        // 6. 手动释放资源
        reader.free();
    }
}


export async function getEnvs() {
    let envPath = await $`powershell -Command "[Environment]::GetEnvironmentVariable('PATH', 'User')"`.text()
    return envPath.split(';').map(a=>a.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$|[\r\n]+/g, ''))
}

export async  function hasEnv(path:string) {
    let envs = await getEnvs()
    return envs.includes(path)
}

export async  function setEnv(path:string) {
    if (!await hasEnv(path)) {
        let envs = await getEnvs()
        envs.push(path) 
        let envStr = envs.join(';')
        await $`powershell -Command "[Environment]::SetEnvironmentVariable('PATH', '${envStr}', 'User')"`
    }
}
export async  function rmEnv(path:string) {
    if (await hasEnv(path)) {
        let envs = await getEnvs()
        envs = envs.filter(a=>a!=path)
        let envStr = envs.join(';')
        await $`powershell -Command  "[Environment]::SetEnvironmentVariable('PATH', '${envStr}', 'User')"`
    }
}



export type Version = string | number
export enum VersionIs {
	LessThan = -1,
	EqualTo = 0,
	GreaterThan = 1,
}

/**
 * Compare two versions quickly.
 * @param current Is this version greater, equal to, or less than the other?
 * @param other The version to compare against the current version
 * @returns 1 if current is greater than other, 0 if they are equal or equivalent, and -1 if current is less than other
 */
export function versionCompare(current: Version, other: Version): VersionIs {
    const cp = String(current).split('.')
    const op = String(other).split('.')
    for (let depth = 0; depth < Math.min(cp.length, op.length); depth++) {
        const cn = Number(cp[depth])
        const on = Number(op[depth])
        if (cn > on) return VersionIs.GreaterThan
        if (on > cn) return VersionIs.LessThan
        if (!isNaN(cn) && isNaN(on)) return VersionIs.GreaterThan
        if (isNaN(cn) && !isNaN(on)) return VersionIs.LessThan
    }
    return VersionIs.EqualTo
}
