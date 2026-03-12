"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ConfirmState {
  isOpen: boolean;
  message?: string;
  title?: string;
}

// Store callbacks outside Redux/Immer so they are never frozen or dropped
let _onConfirm: (() => void) | undefined;
let _onCancel: (() => void) | undefined;

export const getConfirmCallback = () => _onConfirm;
export const getCancelCallback = () => _onCancel;

const initialState: ConfirmState = {
  isOpen: false,
};

const confirmSlice = createSlice({
  name: "confirm",
  initialState,
  reducers: {
    openConfirm: (
      state,
      action: PayloadAction<{
        message: string;
        onConfirm?: () => void;
        title?: string;
        onCancel?: () => void;
      }>,
    ) => {
      state.isOpen = true;
      state.message = action.payload.message;
      state.title = action.payload.title;
      // Store callbacks in module-level refs, NOT in Redux state
      _onConfirm = action.payload.onConfirm;
      _onCancel = action.payload.onCancel;
    },

    closeConfirm: (state) => {
      state.isOpen = false;
      state.message = undefined;
      state.title = undefined;
      _onConfirm = undefined;
      _onCancel = undefined;
    },
  },
});

export const { openConfirm, closeConfirm } = confirmSlice.actions;
export default confirmSlice.reducer;
