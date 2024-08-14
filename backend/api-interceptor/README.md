# api 拦截器

> 创建时间: 2024-01-25  
> 更新时间: 2024-08-13

基于 fastify 实现的拦截器

### 已实现功能
* 功能的注册和绑定
* 数据的加密和解密
* 用户验证 (2024-08-13)

> 数据加解密功能是为了 http 数据传输时数据安全，不是必须启用。  
> 启用条件：  
> 1、服务端 .env 文件做好相关的加密设置  
> 2、请求端需要根据配置好相应的公钥与 AES 密钥  
> 3、请求头设置 encrypted 为 1

### 待实现功能
* ~~日志格式更改~~(2024-08-13实现)
* 动态加解密
* 功能的心跳保障机制(2024-08-13基本实现)
* ~~数据库及缓存出错保底机制~~(暂不考虑)
* 公钥私钥可动态配置
* 生产时环境变量动态配置

### 如何运行
**下载代码**
```bash
git clone https://github.com/why-not-lay/daily-summary.git
```
**切换目录**
```bash
cd ./daily-summary/backend/api-interceptor
```

**下载依赖**
```bash
npm install
```

**配置**

在项目根目录下创建 `.env` 文件，并在里面进行相应的配置，相关配置项可以看后面的配置项说明

**打包**
```bash
npm run build:prod
```

**执行代码**

通过 docker 运行:
1. 移动打包文件
```bash
cp ./dist/index.cjs ./build/
```

2. 更改目录
```bash
cd ./build
```

3. 构建镜像
```bash
docker build -t api-interceptor:lastest .
```

4. 执行 
```bash
docker run -p 127.0.0.l:10000:10000 -d api-interceptor:lastest
```

直接运行:
```bash
node ./dist/index.cjs
```
### env 配置项
```bash
###############
# env config
# 运行环境设置
# 开发为 dev，生产为 prod
###############
NODE_ENV=dev

###############
# detect config
# 心跳检测设置
###############
DETECT_API='/detect'
DETECT_INTERVAL=60000

###############
# server config
# 服务器配置
###############
# 服务器 host
SERVER_HOST=0.0.0.0
# 服务器 端口
SERVER_PORT=10000
# 日志
SERVER_LOG_ORIGIN='http://127.0.0.1:10050'

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
# key
# 加密相关配置
###############
# AES-256-CBC 加密 IV
KEY_IV=
# RSA 私钥
KEY_PRIVATE_RSA=
# RSA 公钥
KEY_PUBLIC_RSA=
```

### src 各文件夹及文件说明
`config`: 配置目录，该目录下的文件是该拦截器的相关配置

`db`: 数据库 sql 语句目录

`errors`: 错误提示码及提示信息目录

`plugins`: fastify 插件

`types`: 类型定义

`wrapper`: 响应数据封装器

`run.ts`: 执行程序文件

### 备注
* `build` 构建文件夹下之所以会有 `package.json` 文件是因为数据库相关的库无法打包到一个文件里，需要在运行前进行专门下载。