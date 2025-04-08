// lib/store/pendingStore.ts

import { create } from "zustand";

// 店舗登録用の型
export type PendingStore = {
  name: string;
  genre: string;
  address: string;
  phone: string;
  opening_hours: string;
  regular_holiday: string;
  website_url: string;
  instagram_url: string;
  payment_methods: string[];
  description: string;
  image_url: string;
  image_file: File | null;          // ★ 店舗画像ファイル
  submitted_by_email: string | null; // ★ 登録者メール（現状nullでOK）
};

// PendingStoreの初期値
const initialPendingStore: PendingStore = {
  name: "",
  genre: "",
  address: "",
  phone: "",
  opening_hours: "",
  regular_holiday: "",
  website_url: "",
  instagram_url: "",
  payment_methods: [],
  description: "",
  image_url: "",
  image_file: null,
  submitted_by_email: null,
};

// Zustand用の型
type PendingStoreState = {
  pendingStore: PendingStore;
  setPendingStore: (store: Partial<PendingStore>) => void;
  resetPendingStore: () => void;
};

// Zustandストア
export const usePendingStore = create<PendingStoreState>((set) => ({
  pendingStore: initialPendingStore,
  setPendingStore: (store) =>
    set((state) => ({
      pendingStore: { ...state.pendingStore, ...store }, // マージして更新
    })),
  resetPendingStore: () =>
    set(() => ({
      pendingStore: initialPendingStore, // リセット
    })),
}));