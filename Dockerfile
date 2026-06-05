# ============================================================
# 使用 electronuserland/builder:wine 镜像编译 Windows 版本
# 该镜像预装了 Node.js、Wine、Python、node-gyp 等编译工具
# ============================================================
FROM electronuserland/builder:wine AS build

#------------------------------------------------------------
# 构建参数
#------------------------------------------------------------
ARG ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
ARG ELECTRON_CUSTOM_DIR={{ version }}

# 设置 Electron 镜像源加速下载
ENV ELECTRON_MIRROR=${ELECTRON_MIRROR}
ENV ELECTRON_CUSTOM_DIR=${ELECTRON_CUSTOM_DIR}
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=0
ENV NODE_ENV=production

#------------------------------------------------------------
# 1) 安装 app 依赖（利用 Docker 层缓存）
#------------------------------------------------------------
WORKDIR /app
COPY app/package.json app/package-lock.json* ./
RUN npm config set registry https://registry.npmmirror.com && \
    npm install

#------------------------------------------------------------
# 2) 安装 ui 依赖
#------------------------------------------------------------
WORKDIR /ui
COPY ui/package.json ui/package-lock.json* ./
RUN npm config set registry https://registry.npmmirror.com && \
    npm install

#------------------------------------------------------------
# 3) 复制源码
#------------------------------------------------------------
WORKDIR /app
COPY app/ .
WORKDIR /ui
COPY ui/ .

#------------------------------------------------------------
# 4) 构建 UI 项目
#------------------------------------------------------------
WORKDIR /app
RUN node build/build-ui.js

#------------------------------------------------------------
# 5) 构建 main 进程（electron-vite 会自动编译 native 模块）
#------------------------------------------------------------
RUN npx electron-vite build

#------------------------------------------------------------
# 6) 使用 electron-builder 打包 Windows 安装程序
#    会自动重建 native 模块以匹配 Electron 的 Node.js ABI
#------------------------------------------------------------
RUN npx electron-builder --config electron-builder.ts --win --publish=never

#------------------------------------------------------------
# 输出目录
#  构建产物位于 /app/dist/release/ 下
#------------------------------------------------------------
# 使用示例：
#   docker build -t envm-builder .
#   docker run --rm -v ${PWD}/dist:/app/dist/release envm-builder
#   或直接在镜像内查看产物：
#   docker run --rm envm-builder ls -la /app/dist/release
