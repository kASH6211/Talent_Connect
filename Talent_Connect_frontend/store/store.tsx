import { configureStore } from "@reduxjs/toolkit";
import institutes from "./institute";
import confirm from "./common/confirmSlice";

export const store = configureStore({
  reducer: {
    institutes,
    confirm,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
