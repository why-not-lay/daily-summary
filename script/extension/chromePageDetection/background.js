importScripts('main.js');

let uploadQueue = [];
const urlMap = new Map();
const windowMap = new Map();
const INTERVAL = 30 * 1000;
const STATUS = {
	ACTIVATED: 'activated',
}
const SOURCE = 'browser:chrome';
// 加密初始值
const IV = '';
// 密钥
const KEY = '';
// TID
const TID = '';
const ORIGIN = ''
const API = '';
const bits = [...'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'];

const getID = () => Array.from({length: 16}, () => bits[Math.floor(Math.random() * bits.length)]).join('');
const isUrl = url => typeof url === 'string' && url.startsWith('http');

const encryptByAes = (data) => {
	return self.encryptByAes(IV, KEY, data);
}

const decryptByAes = (data) => {
	return self.decryptByAes(IV, KEY, data);
}

const request = async (data) => {
	const encrypted = encryptByAes(JSON.stringify({records: data}));
  const urlObj = new URL(API, ORIGIN);
  const url = urlObj.href;
  const init = {
  	method: 'POST',
  	headers: {
    	encrypted: '1',
  	  "Content-Type": "application/json",
  	},
		body: JSON.stringify({
			tid: TID,
      xxx: encrypted
		})
	};

  const req = new Request(url, init);
  const rawResp = await fetch(req);
  const resp = await rawResp.json();
	const { xxx } = resp;
	const decrypted = decryptByAes(xxx);
	return JSON.parse(decrypted);
	
}

const saveData = async (key, value) => {
	return new Promise((resolve) => {
		chrome.storage.local.set({[key]: value}, () => {
			console.log('保存数据');
			resolve(true);
		});
	});
}

const getCurTab = async () => {
  const queryOptions = { active: true, lastFocusedWindow: true };
  const [ tab ] = await chrome.tabs.query(queryOptions);
	const { url, windowId, id: tabId } = tab ?? {};
	if(isUrl(url) && windowId) {
		windowMap.set(windowId, tabId);
		push({
			id: getID(),
			source: SOURCE,
			action: url,
			status: STATUS.ACTIVATED,
			create_time: Date.now(),
		});
	}
}

const upload = async () => {
	try {
		await getCurTab();
		const endIdx = uploadQueue.length - 1;
		if(endIdx >= 0) {
			await saveData('uploadQueue', uploadQueue);
			const pendingUploads = uploadQueue.slice(0, endIdx + 1);
			const resp = await request(pendingUploads);
			const { code, msg } = resp;
			if(code === 0) {
				console.log(`成功上传${endIdx + 1}项`);
				uploadQueue = uploadQueue.slice(endIdx + 1);
				await saveData('uploadQueue', uploadQueue);
			} else {
				console.error(msg);
			}
		}
	} catch (error) {
		console.error(error);
	}
}

const getData = async (key) => {
	return new Promise((resolve) => {
		chrome.storage.local.get(key, (result) => {
			console.log('读取数据', key, result[key]);
			resolve(result[key] ? result[key] : []);
		});
	});
}

const init = async () => {
	try {
		const data = await getData('uploadQueue');
		if(data instanceof Array) {
			uploadQueue = data;
		}
	} catch (error) {
		console.error(error);
	} 
	// 定时发送队列
	setInterval(async () => {
		upload();
	}, INTERVAL);
}

/**
 * upload:
 * 	id: string
 * 	source: string,
 * 	action: string,
 * 	status: string,
 * 	create_time: number,
 */
const push = (upload) => {
	if(upload.status)
	uploadQueue.push(upload);
}

// 新建标签
chrome.tabs.onCreated.addListener((tab) => {
	const { id, url, pendingUrl} = tab;
	if(isUrl(url) || isUrl(pendingUrl)) {
		urlMap.set(id, url ? url : pendingUrl);
	}
});

// 聚焦标签
chrome.tabs.onActivated.addListener((activeInfo) => {
	const { tabId, windowId } = activeInfo
	const url = urlMap.get(tabId);
	if(isUrl(url)) {
		windowMap.set(windowId, tabId);
		push({
			id: getID(),
			source: SOURCE,
			action: url,
			status: STATUS.ACTIVATED,
			create_time: Date.now(),
		});
	}
});

// 监听标签页更新（页面切换和打开）
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if(changeInfo.status === 'complete') {
		const {id, url, active, windowId} = tab;
		if(active) {
			urlMap.delete(id);
			if(isUrl(url)) {
				windowMap.set(windowId, id);
				urlMap.set(id, url);
				push({
					id: getID(),
					source: SOURCE,
					action: url,
					status: STATUS.ACTIVATED,
					create_time: Date.now(),
				});
			}
		}
	}
});

// 聚焦窗口
chrome.windows.onFocusChanged.addListener((windowId) => {
	if(windowId !== chrome.windows.WINDOW_ID_NONE) {
		const tabId = windowMap.get(windowId)
		const url = urlMap.get(tabId);
		if(isUrl(url)) {
			push({
				id: getID(),
				source: SOURCE,
				action: url,
				status: STATUS.ACTIVATED,
				create_time: Date.now(),
			});
		} else {
			windowMap.delete(windowId);
		}
	}
})

init();