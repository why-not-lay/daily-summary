FROM node:18
# 设置工作目录
WORKDIR /usr/src/app

# 将当前目录下的所有文件复制到工作目录
COPY . .

RUN npm install --registry http://mirrors.cloud.tencent.com/npm

# 设置环境变量，用于指定应用监听的端口，默认为 3000
ENV PORT 10000

# 暴露应用监听的端口
EXPOSE $PORT

# 定义容器启动命令
CMD ["node", "./index.cjs"]
