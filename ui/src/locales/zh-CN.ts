export default {
  // 通用
  common: {
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    search: '搜索',
    refresh: '刷新',
    loading: '获取中…',
    setting: '设置',
    success: '成功',
    fail: '失败',
  },

  // 侧边栏
  sidebar: {
    brand: 'ENVM',
    addEnv: '添加环境',
    toggleTheme: '切换主题',
    selectEnv: '选择 {name}',
    editEnv: '编辑 {name}',
    deleteEnv: '删除 {name}',
  },

  // 主面板
  panel: {
    title: '请添加环境',
    desc: '点击左侧「添加环境」按钮创建新的运行时环境',
    installedCount: '已安装 {count} 个版本',
    currentVersion: '当前版本 {version}',
    notSet: '未设置',
    searchPlaceholder: '搜索版本号或文件名…',
    clearSearch: '清除搜索',
    refreshList: '重新获取版本列表',
    fetchVersions: '获取版本',
  },

  // 版本列表
  versionList: {
    all: '全部',
    installed: '已安装',
    uninstalled: '未安装',
    notInstalled: '未安装',
    currentVersion: '当前版本',
    alreadyInstalled: '已安装',
    activate: '激活',
    deactivate: '取消激活',
    emptyNoEnv: '请先添加一个运行时环境',
    emptyNoInstalled: '暂无已安装的版本',
    emptyAllInstalled: '所有版本均已安装',
    emptyNoVersions: '暂无可用版本',
    fetchSuccess: '获取成功',
    downloadFailed: '下载失败: {error}',
    downloadComplete: '下载完成',
  },

  // 环境组表单
  envGroup: {
    title: '环境详情',
    name: '环境名称',
    routeUrl: '仓库URL',
    getListScript: '获取列表脚本',
    sort: '序号',
    placeholderName: '请输入环境名称',
    placeholderUrl: '请输入仓库URL',
    confirmDelete: '确认删除该项？',
    deleteSuccess: '删除成功',
    deleteFail: '删除失败',
  },

  // 编辑器
  editor: {
    title: '详情',
    fullscreen: '全屏编辑',
    exitFullscreen: '关闭全屏',
    save: '保存',
    queryScript: '查询脚本',
  },

  // 下载相关
  download: {
    speedB: '{speed} B/s',
    speedKB: '{speed} KB/s',
    speedMB: '{speed} MB/s',
  },
}
