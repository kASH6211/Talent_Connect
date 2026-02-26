import { configureStore } from "@reduxjs/toolkit";
import institutes from "./institute";
import confirm from "./common/confirmSlice";
import industries from "./industry";

export const store = configureStore({
  reducer: {
    institutes,
    confirm,
    industries,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
