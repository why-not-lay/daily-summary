FROM node:16
# 设置工作目录
WORKDIR /usr/src/app

# 将当前目录下的所有文件复制到工作目录
COPY . .

# 安装应用依赖
RUN npm --registry http://mirrors.cloud.tencent.com/npm/ install
RUN npm run build

# 设置环境变量，用于指定应用监听的端口，默认为 10050
ENV PORT 10050

# 暴露应用监听的端口
EXPOSE $PORT

# 定义容器启动命令
CMD ["node", "./dist/run.js"]