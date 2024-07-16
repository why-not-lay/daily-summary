# 日志

> 创建时间: 2024-01-25  
> 更新时间: 2024-07-16

基于 influxdb 存储日志，目前接口不对外

## 已实现功能
* 日志存储

## 如何运行
### 下载代码
```bash
git clone https://github.com/why-not-lay/daily-summary.git
```
### 切换目录
```bash
cd ./daily-summary/logger
```
### 配置

在项目根目录下创建 `.env` 文件，并在里面进行相应的配置，相关配置项可以看后面的配置项说明

### 构建

下载依赖
```bash
npm install
```

构建项目
```bash
npm run build
```
### 执行代码

通过 docker 运行:
1. 移动到构建目录
```bash
cp ./dist/index.cjs ./build
cd ./build
```
2. 构建镜像
```bash
docker build -t logger:lastest .
```
3. 执行 
```bash
docker run -p 127.0.0.l:10050:10050 -d logger:lastest
```

直接运行:
1. 执行
```bash
node ./dist/index.cjs
```
## env 配置项
```bash
###############
# server config
# 服务器配置
###############
# 服务器 host
SERVER_HOST=127.0.0.1
# 服务器 端口
SERVER_PORT=10050

###############
# db config
# influxdb 数据库配置 
###############
# 数据库 host
DB_HOST=127.0.0.1
# 数据库 端口
DB_PORT=13306
# 数据库操作用户
DB_USER=
# 数据库密码
DB_PASSWORD=
# 数据库名称
DB_NAME=test_log_db
```
