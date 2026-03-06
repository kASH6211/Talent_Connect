import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ConfirmState {
  isOpen: boolean;
  message?: string;
  onConfirm?: () => void;
  title?: string;
  onCancel?: () => void;
}

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
      state.onConfirm = action.payload.onConfirm;
      state.onCancel = action.payload.onCancel;
    },

    closeConfirm: (state) => {
      state.isOpen = false;
      state.message = undefined;
      state.onConfirm = undefined;
      state.onCancel = undefined;
    },
  },
});

export const { openConfirm, closeConfirm } = confirmSlice.actions;
export default confirmSlice.reducer;
