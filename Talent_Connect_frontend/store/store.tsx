import { configureStore } from "@reduxjs/toolkit";
import institutes from "./institute";
import confirm from "./common/confirmSlice";
import industries from "./industry";
import login from "./login";

export const store = configureStore({
  reducer: {
    institutes,
    confirm,
    industries,
    login,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
