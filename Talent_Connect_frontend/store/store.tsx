import { configureStore } from "@reduxjs/toolkit";
import institutes from "./institute";


export const store = configureStore({
  reducer: {
    institutes,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
