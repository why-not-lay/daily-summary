import win32con
import threading
import time
import queue
import sys
import ctypes
import ctypes.wintypes
import random
from win32gui import GetWindowText, GetForegroundWindow
import requests
import json
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import binascii

user32 = ctypes.windll.user32
ole32 = ctypes.windll.ole32
kernel32 = ctypes.windll.kernel32

WinEventProcType = ctypes.WINFUNCTYPE(
    None,
    ctypes.wintypes.HANDLE,
    ctypes.wintypes.DWORD,
    ctypes.wintypes.HWND,
    ctypes.wintypes.LONG,
    ctypes.wintypes.LONG,
    ctypes.wintypes.DWORD,
    ctypes.wintypes.DWORD
)

eventTypes = {
    win32con.EVENT_SYSTEM_FOREGROUND: "Foreground",
    # win32con.EVENT_OBJECT_FOCUS: "Focus",
    # win32con.EVENT_OBJECT_SHOW: "Show",
    # win32con.EVENT_SYSTEM_DIALOGSTART: "Dialog",
    # win32con.EVENT_SYSTEM_CAPTURESTART: "Capture",
    # win32con.EVENT_SYSTEM_MINIMIZEEND: "UnMinimize"
}

SOURCE = "os:windows10:work"
BITS = list("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
INTERVAL=30
# 加密初始值
IV = ''
# 密钥
KEY = ''
# TID
TID = ''
ORIGIN = ''
API = ''
dataQueue = queue.Queue()

uploadStopEvent = threading.Event()

def getID():
    return "".join([BITS[int(random.randint(0, len(BITS) - 1))] for i in range(0, 16)])

def callback(hWinEventHook, event, hwnd, idObject, idChild, dwEventThread,
             dwmsEventTime):
    title = GetWindowText(hwnd)
    timestamp = int(time.time() * 1000)
    status=eventTypes.get(event, hex(event))

    if hwnd:
        hwnd = hex(hwnd)
    elif idObject == win32con.OBJID_CURSOR:
        hwnd = '<Cursor>'
    
    if title:
        print("{title}\t{time}\t{status}".format(title=title, time=timestamp, status=status))
        dataQueue.put({
            "id": getID(),
	        "source": SOURCE,
	        "action": title,
	        "status": 'activated',
	        "create_time": timestamp
        })


def setHook(WinEventProc, eventType):
    return user32.SetWinEventHook(
        eventType,
        eventType,
        0,
        WinEventProc,
        0,
        0,
        win32con.WINEVENT_OUTOFCONTEXT
    )

def windowEventListener():
    ole32.CoInitialize(0)

    WinEventProc = WinEventProcType(callback)
    user32.SetWinEventHook.restype = ctypes.wintypes.HANDLE

    hookIDs = [setHook(WinEventProc, et) for et in eventTypes.keys()]
    if not any(hookIDs):
        print('SetWinEventHook failed')
        sys.exit(1)
    print('==开始监听==')

    msg = ctypes.wintypes.MSG()
    while user32.GetMessageW(ctypes.byref(msg), 0, 0, 0) != 0:
        user32.TranslateMessageW(msg)
        user32.DispatchMessageW(msg)

    print('==结束监听==')
    for hookID in hookIDs:
        user32.UnhookWinEvent(hookID)
    ole32.CoUninitialize()
    print('==释放资源成功==')

def encryptByAES(data):
    cipher = AES.new(bytes.fromhex(KEY), AES.MODE_CBC, IV.encode())
    pData = pad(data.encode(), AES.block_size)
    return cipher.encrypt(pData).hex()

def decryptByAES(data):
    encryptedBin = binascii.unhexlify(data)
    cipher = AES.new(bytes.fromhex(KEY), AES.MODE_CBC, IV.encode())
    decrypted = cipher.decrypt(encryptedBin)
    originalData = unpad(decrypted, AES.block_size)
    return originalData.decode('utf-8')

def getCurUpload():
    title = GetWindowText(GetForegroundWindow())
    timestamp = int(time.time() * 1000)
    dataQueue.put({
        "id": getID(),
	    "source": SOURCE,
	    "action": title,
	    "status": 'activated',
	    "create_time": timestamp
    })


def upload():
    print('==开始上传==')
    while not uploadStopEvent.is_set():
        time.sleep(INTERVAL)
        getCurUpload()
        # 上传数据
        paddingData = list(dataQueue.queue)
        curLen = len(paddingData)
        if curLen == 0:
            continue
        data = {
            "records": paddingData
        }
        headers = {
            'encrypted': '1',
            "Content-Type": "application/json",
        }
        encrypted = encryptByAES(json.dumps(data))
        try:
            req = requests.post("{origin}{api}".format(origin=ORIGIN, api=API), headers=headers, json={
                "tid": TID,
                "xxx": encrypted,
            })
            resp = req.json()
            encryptedRespData = resp.get('xxx')
            decrypted = decryptByAES(encryptedRespData)
            realResp = json.loads(decrypted)
            code = realResp.get('code')
            data = realResp.get('data')
            msg = realResp.get('msg')
            if code == 0:
                for _ in range(0, curLen):
                    dataQueue.get()
                print('==上传成功==')
            else:
                print(msg, file=sys.stderr)
        except Exception as e:
            print(e, file=sys.stderr)
    print('==停止上传==')

def postQuitMessage(threadId):
    user32.PostThreadMessageW(threadId, win32con.WM_QUIT, 0, 0)

def main():
    windowThread = threading.Thread(target=windowEventListener)
    uploadThread = threading.Thread(target=upload)
    windowThread.start()
    uploadThread.start()
    input("Press any key to exit...\n")
    uploadStopEvent.set()
    postQuitMessage(windowThread.native_id)
    windowThread.join()
    uploadThread.join()


if __name__ == '__main__':
    main()