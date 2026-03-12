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
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["confirm/openConfirm"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["payload.onConfirm", "payload.onCancel"],
        // Ignore these paths in the state
        ignoredPaths: ["confirm.onConfirm", "confirm.onCancel"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
