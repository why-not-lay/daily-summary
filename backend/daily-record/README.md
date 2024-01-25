# 操作记录

> 创建时间: 2024-01-25  
> 更新时间: 2023-01-25

用于存储各种操作记录

### 已实现功能
* 获取操作记录列表
* 接收并存储操作记录

### 如何运行
**下载代码**
```bash
git clone https://github.com/why-not-lay/daily-summary.git
```
**切换目录**
```bash
cd ./daily-summary/daily-record
```
**配置**

在项目根目录下创建 `.env` 文件，并在里面进行相应的配置，相关配置项可以看后面的配置项说明

**执行代码**

通过 docker 运行:
1. 构建镜像
```bash
docker build -t daily-record:lastest .
```
2. 执行 
```bash
docker run -p 127.0.0.l:10051:10051 -d daily-record:lastest
```

直接运行:
1. 下载相关依赖
```bash
npm install
```
2. 构建
```bash
npm run build
```
3. 执行
```bash
node ./dist/run.js
```
### env 配置项
```bash
###############
# server config
# 服务器配置
###############
# 服务器 host
SERVER_HOST=0.0.0.0
# 服务器 端口
SERVER_PORT=10000
# 当前服务运行 origin
SERVER_ORIGIN='http://127.0.0.1:10051'
# 服务注册 origin
SERVER_REGISTER_ORIGIN='http://127.0.0.1:10000'

###############
# db config
# 数据库配置 
###############
# 数据库 host
DB_HOST=127.0.0.1
# 数据库 端口
DB_PORT=13306
# 数据库操作用户
DB_USER=
# 数据库密码
DB_PASSWORD=
```

### src 各文件夹及文件说明
`config`: 配置目录，该目录下的文件是该记录服务的相关配置

`db`: 数据库 sql 语句目录

`errors`: 错误提示码及提示信息目录

`plugins`: fastify 插件

`types`: 类型定义

`wrapper`: 响应数据封装器

`run.ts`: 执行程序文件
