# 认证中心

> 创建时间: 2024-01-29  
> 更新时间: 2024-02-05

基于 fastify 的认证中心

### 已实现功能
* 用户和 token 认证
* 新建和删除 token

### 如何运行
**下载代码**
```bash
git clone https://github.com/why-not-lay/daily-summary.git
```
**切换目录**
```bash
cd ./daily-summary/backend/auth-center
```

**配置**

在项目根目录下创建 `.env` 文件，并在里面进行相应的配置，相关配置项可以看后面的配置项说明

**执行代码**

通过 docker 运行:
1. 构建镜像
```bash
docker build -t auth-center:lastest .
```
2. 执行 
```bash
docker run -p 127.0.0.l:10052:10052 -d auth-center:lastest
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
# 服务配置
###############
# 服务 host
SERVER_HOST=0.0.0.0
# 服务端口
SERVER_PORT=10052
# 是否需要注册服务
SERVER_IS_REGISTER=1
# 当前服务运行 origin
SERVER_ORIGIN='http://127.0.0.1:10052'
# 服务注册 origin
SERVER_REGISTER_ORIGIN='http://127.0.0.1:10000'
# 临时 token 持续时间
SERVER_DEFAULT_TOKEN_LIFETIME=86400 # 一天(秒)
# 长期 token 持续时间
SERVER_DEFAULT_TOKEN_UNLIMIT=31536000 # 100 年(秒)

###############
# db config
# 数据库配置
###############
DB_HOST=127.0.0.1
DB_PORT=13306
DB_USER=
DB_PASSWORD=

###############
# redis config
# redis 配置
###############
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### src 各文件夹及文件说明
`config`: 配置目录，该目录下的文件是该拦截器的相关配置

`db`: 数据库 sql 语句目录

`errors`: 错误提示码及提示信息目录

`interceptor`: 请求拦截器

`plugins`: fastify 插件

`types`: 类型定义

`wrapper`: 响应数据封装器

`run.ts`: 执行程序文件
