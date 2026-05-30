import { Configuration } from 'electron-builder';

const config: Configuration = {
    appId: 'com.yourcompany.yourapp',
    productName: 'YourAppName',
    artifactName: "${productName}-${version}-${os}.${ext}",
    // ... 其他配置
    directories: {
        output: 'release',
        buildResources: "build"
    },
    asar: false,
    files: ["dist/*","!node_modules/**/*","node_modules/better-sqlite3/**/*"],
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