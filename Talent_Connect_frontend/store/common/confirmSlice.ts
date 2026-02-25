import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ConfirmState {
    isOpen: boolean;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

const initialState: ConfirmState = {
    isOpen: false,
    message: "",
};

const confirmSlice = createSlice({
    name: "confirm",
    initialState,
    reducers: {
        openConfirm: (state, action: PayloadAction<Omit<ConfirmState, "isOpen">>) => {
            state.isOpen = true;
            state.message = action.payload.message;
            // Note: non-serializable values like functions in Redux state can cause DevTools warnings
            state.onConfirm = action.payload.onConfirm as any;
            state.onCancel = action.payload.onCancel as any;
        },
        closeConfirm: (state) => {
            state.isOpen = false;
            state.onConfirm = undefined;
            state.onCancel = undefined;
        },
    },
});

export const { openConfirm, closeConfirm } = confirmSlice.actions;
export default confirmSlice.reducer;
