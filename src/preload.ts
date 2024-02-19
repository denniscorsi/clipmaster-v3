import { ipcRenderer, contextBridge } from 'electron';

const api = {
  writeToClipboard: (content: string): void => {
    ipcRenderer.send('write-to-clipboard', content);
  },
  readFromClipboard: (): Promise<string> => {
    return ipcRenderer.invoke('read-from-clipboard');
  },
  
} as const;

contextBridge.exposeInMainWorld('api', api);

export type Api = typeof api;
