import Taro, { SocketTask } from '@tarojs/taro'

const DEFAULT_API_BASE = process.env.TARO_APP_API || 'http://10.10.31.129:5002'
const WS_BASE =
  process.env.TARO_APP_WS ||
  DEFAULT_API_BASE
    .replace(/^http:/i, 'ws:')
    .replace(/^https:/i, 'wss:')
    .replace(/:5002(?=\/|$)/, ':5001')

type MessageHandler = (data: any) => void

class WebSocketManager {
  private static instance: WebSocketManager
  private task: SocketTask | null = null
  private handlers: Set<MessageHandler> = new Set()
  private connecting = false
  private heartbeatTimer: any = null

  private constructor() {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new WebSocketManager()
    }
    return this.instance
  }

  connect() {
    const token = Taro.getStorageSync('token')
    if (!token || this.task || this.connecting) return

    const url = WS_BASE.replace(/\/$/, '') + `/ws/chat?token=${encodeURIComponent(token)}`
    this.connecting = true

    console.log('WS Manager: Connecting...')
    Taro.connectSocket({ url }).then((task) => {
      this.task = task
      this.connecting = false

      task.onOpen(() => {
        console.log('WS Manager: Connected')
        this.startHeartbeat()
      })

      task.onMessage((msg) => {
        try {
          const data = JSON.parse(msg.data as string)
          this.handlers.forEach(h => h(data))
        } catch (e) {
          // 忽略非 JSON 消息（如 ping/pong）
        }
      })

      task.onClose(() => {
        console.log('WS Manager: Closed')
        this.task = null
        this.stopHeartbeat()
      })

      task.onError((err) => {
        console.error('WS Manager: Error', err)
        this.task = null
        this.stopHeartbeat()
      })
    }).catch(() => {
      this.connecting = false
    })
  }

  send(data: any) {
    if (this.task) {
      this.task.send({ data: typeof data === 'string' ? data : JSON.stringify(data) })
    }
  }

  isReady() {
    return !!this.task
  }

  addListener(handler: MessageHandler) {
    this.handlers.add(handler)
    return () => this.handlers.delete(handler)
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      this.send('ping')
    }, 30000)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  close() {
    if (this.task) {
      this.task.close({})
      this.task = null
    }
    this.stopHeartbeat()
  }
}

export const wsManager = WebSocketManager.getInstance()
