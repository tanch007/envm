import { Configuration } from 'electron-builder';

const config: Configuration = {
    appId: 'com.tanch.envm',
    productName: 'envm',
    artifactName: "${productName}-${version}-${os}.${ext}",
    // ... 其他配置
    directories: {
        output: 'dist/release',
        buildResources: "build"
    },
    asar: true,
    asarUnpack: [
        "node_modules/better-sqlite3/**/*",
        "node_modules/bindings/**/*",
        "node_modules/file-uri-to-path/**/*",
        "node_modules/7zip-bin/**/*"
    ],
    files: [
        {
            "from": "dist/main",
            "to": "",
            "filter": ["**/*"]
        },
        "package.json",
        "!node_modules/**/*",
        "node_modules/better-sqlite3/**/*",
        "node_modules/bindings/**/*",
        "node_modules/prebuild-install/**/*",
        "node_modules/file-uri-to-path/**/*",
        "node_modules/7zip-bin/**/*"
    ],
    extraResources: [{ from:"dist/ui",to:"ui",filter:["**/*"] }],
    win: {
        target: 'nsis',
        icon: 'build/icon.ico'
    },
    mac: {
        target: 'dmg',
        icon: 'build/icon.icns'
    },
    nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true
    }
};

export default config;