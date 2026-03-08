// provider.tsx
"use client";

import { store } from "@/store/store";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      {children}
      <Toaster
        position="top-center"
        reverseOrder={false}
        containerStyle={{ zIndex: 99999 }}
      />
    </Provider>
  );
}