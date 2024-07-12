# easy-detecting

公用库

## 作用
定时判断链接是否可用

## 安装
```bash
npm install easy-detecting
```

## API 使用

### detect
监测函数

```js
detect(config: {
  // 定时监测的链接
  urls: string[];
  // 时间间隔，单位 ms
  interval?: number;
  // 当出现失联链接时回调函数
  failCallback?: (urls: string[]) => void;
  // 每一次监测完的回调函数
  finishCallback?: (states: UrlState[]) => void;
}) => {
    // 停止监测
    stop: () => void;
    // 添加监测链接
    addPendingUrls: (urls: string | string[]) => void;
    // 设置监测时间间隔
    setTimerInterval: (interval: number) => void;
    // 删除监测链接
    removePendingUrl: (urls: string | string[]) => void;
};
```

### wait
接收函数

```js
wait(config: {
  // 地址
  hostname: string;
  // 端口
  port: number;
  // 接收监测请求的接口
  api: string;
  // 关闭接收时出错的回调函数
  onCloseErr?: (err: any) => void;
}) => Promise<() => void>; // 返回关闭函数

```