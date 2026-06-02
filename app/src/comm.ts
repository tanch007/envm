import fs from "fs-extra";
import { existsSync } from "node:fs";
import path, { join } from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import _7z from "7zip-min"

const execAsync = promisify(exec);

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
        let list = await fs.readdir(folderPath)
        return list.length > 0;
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
    //修复7zip-min 在 asar 包内无法找到 7z.exe 的问题
    if(!process.env.VSCODE_DEBUG){
        process.argv[1]='app.asar'
        console.log(`process.argv`,process.argv.join(','))
    }

    let fileDir = path.dirname(archivePath);
    let tempDir = join(fileDir, `temp_${Date.now()}`);
    return new Promise((resolve, reject) => {
        _7z.unpack(archivePath,tempDir,async (err:Error| null, output?: string)=>{
           if(err) reject(err);

            let list = await fs.readdir(tempDir, { withFileTypes: true })
            if(list.length==1 && list[0].isDirectory()){
                //如果解压后只有一个文件夹，直接将该文件夹移动到目标目录
                const sourceDir = join(tempDir, list[0].name);
                await fs.move(sourceDir, targetDir, { overwrite: true })
            }
            else
            {
                //否则将解压后的所有文件移动到目标目录
                await fs.move(tempDir, targetDir, { overwrite: true })
            }
            await fs.rmdir(tempDir);
            resolve(true);
        });
    })
}


export async function getEnvs() {
    const { stdout } = await execAsync(
        'powershell -Command "[Environment]::GetEnvironmentVariable(\'PATH\', \'User\')"'
    );
    return stdout.split(';').map(a => a.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$|[\r\n]+/g, ''));
}

export async  function hasEnv(path:string) {
    let envs = await getEnvs()
    return envs.includes(path)
}

export async function setEnv(path: string) {
    if (!await hasEnv(path)) {
        let envs = await getEnvs();
        envs.push(path);
        let envStr = envs.join(';');
        await execAsync(
            `powershell -Command "[Environment]::SetEnvironmentVariable('PATH', '${envStr}', 'User')"`
        );
    }
}

export async function rmEnv(path: string) {
    if (await hasEnv(path)) {
        let envs = await getEnvs();
        envs = envs.filter(a => a != path);
        let envStr = envs.join(';');
        await execAsync(
            `powershell -Command "[Environment]::SetEnvironmentVariable('PATH', '${envStr}', 'User')"`
        );
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
