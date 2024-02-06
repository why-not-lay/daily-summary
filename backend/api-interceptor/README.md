# api 拦截器

> 创建时间: 2024-01-25  
> 更新时间: 2023-01-25

基于 fastify 实现的拦截器

### 已实现功能
* 功能的注册和绑定
* 数据的加密和解密

> 数据加解密功能是为了 http 数据传输时数据安全，不是必须启用。  
> 启用条件：  
> 1、服务端 .env 文件做好相关的加密设置  
> 2、请求端需要根据配置好相应的公钥与 AES 密钥  
> 3、请求头设置 encrypted 为 1

### 待实现功能
* 日志格式更改
* 动态加解密
* 功能的心跳保障机制
* 数据库及缓存出错保底机制

### 如何运行
**下载代码**
```bash
git clone https://github.com/why-not-lay/daily-summary.git
```
**切换目录**
```bash
cd ./daily-summary/api-interceptor
```

**配置**

在项目根目录下创建 `.env` 文件，并在里面进行相应的配置，相关配置项可以看后面的配置项说明

**执行代码**

通过 docker 运行:
1. 构建镜像
```bash
docker build -t api-interceptor:lastest .
```
2. 执行 
```bash
docker run -p 127.0.0.l:10000:10000 -d api-interceptor:lastest
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
# 服务器注册与解绑接口的白名单，并不是所有接口白名单
SERVER_WHITE_LIST='127.0.0.1'
# token服务
SERVER_AUTH_ORIGIN='http://127.0.0.1:10052'

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

###############
# redis config
# redis 配置  
###############
# redis host
REDIS_HOST=127.0.0.1
# redis 端口
REDIS_PORT=6379

###############
# key
# 加密相关配置
###############
# AES-256-CBC 加密 IV
KEY_IV=
# RSA 公钥
KEY_RSA=
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
