/// <reference types="electron-vite/client" />

import type { DeployManagerAPI } from '../preload/index'

declare global {
  interface Window {
    api: DeployManagerAPI
  }
}
