import {
  DB_PRODUCTS_GET_ALL,
  DB_PRODUCTS_GET_BY_ID,
  DB_PRODUCTS_CREATE,
  DB_PRODUCTS_UPDATE,
  DB_PRODUCTS_DELETE,
  DB_PRODUCTS_SEARCH,
  DB_PRODUCTS_GET_BY_CATEGORY,
  DB_CATEGORIES_GET_ALL,
  DB_CATEGORIES_GET_BY_ID,
  DB_CATEGORIES_CREATE,
  DB_CATEGORIES_UPDATE,
  DB_CATEGORIES_DELETE,
} from "./database-channels";

export function exposeDatabaseContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");

  contextBridge.exposeInMainWorld("database", {
    products: {
      getAll: () => ipcRenderer.invoke(DB_PRODUCTS_GET_ALL),
      getById: (id: number) => ipcRenderer.invoke(DB_PRODUCTS_GET_BY_ID, id),
      create: (input: any) => ipcRenderer.invoke(DB_PRODUCTS_CREATE, input),
      update: (id: number, input: any) => ipcRenderer.invoke(DB_PRODUCTS_UPDATE, id, input),
      delete: (id: number) => ipcRenderer.invoke(DB_PRODUCTS_DELETE, id),
      search: (query: string) => ipcRenderer.invoke(DB_PRODUCTS_SEARCH, query),
      getByCategory: (categoryId: number) => ipcRenderer.invoke(DB_PRODUCTS_GET_BY_CATEGORY, categoryId),
    },
    categories: {
      getAll: () => ipcRenderer.invoke(DB_CATEGORIES_GET_ALL),
      getById: (id: number) => ipcRenderer.invoke(DB_CATEGORIES_GET_BY_ID, id),
      create: (input: any) => ipcRenderer.invoke(DB_CATEGORIES_CREATE, input),
      update: (id: number, input: any) => ipcRenderer.invoke(DB_CATEGORIES_UPDATE, id, input),
      delete: (id: number) => ipcRenderer.invoke(DB_CATEGORIES_DELETE, id),
    },
  });
}
