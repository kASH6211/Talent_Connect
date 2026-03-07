import { apiConfig } from "@/lib/apiConfig";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { any } from "zod";

/* ===============================
   INITIAL STATE
================================= */

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  currentRole: "",
  ui: {
    loginModal: { open: false },
    registerModal: { open: false },
    forgotPasswordModal: { open: false },
    roleSelectModal: { open: false },
    authPrompt: { open: false },
    loadingOverlay: { visible: false },
  },
};

/* ===============================
   ASYNC THUNKS
================================= */

// Login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    credentials: { email: string; password: string; role?: string },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const response = await axios.post(apiConfig.login, credentials);
      const { user, token } = response.data;

      // You can also store token in localStorage/httpOnly cookie here if needed
      // localStorage.setItem("token", token);

      // Optionally close modals on success
      dispatch(updateLoginUi({ loginModal: { open: false } }));

      return { user, token };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Login failed. Please check your credentials.",
      );
    }
  },
);

// Optional: Logout (client-side)
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    try {
      // If you have a logout endpoint that invalidates token
      // await axios.post(apiConfig.logout);

      // Clear local storage if used
      // localStorage.removeItem("token");

      dispatch(updateLoginUi({ loginModal: { open: false } }));
      return null;
    } catch (error) {
      console.error("Logout error:", error);
      return null; // we still clear state even on error
    }
  },
);

// Optional: Fetch current user (on app load / token refresh)
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(apiConfig.me, {
        // headers: { Authorization: `Bearer ${token}` } // if using interceptor
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch user profile",
      );
    }
  },
);

/* ===============================
   SLICE
================================= */

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    // Main reducer to update any part of the ui object
    updateLoginUi: (state, action: PayloadAction<Partial<typeof state.ui>>) => {
      state.ui = { ...state.ui, ...action.payload };
    },

    // Clear auth state (used after logout or token expiration)
    clearAuthState: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      // Optionally keep modals closed or reset them
      state.ui = {
        loginModal: { open: false },
        registerModal: { open: false },
        forgotPasswordModal: { open: false },
        roleSelectModal: { open: false },
        authPrompt: { open: false },
        loadingOverlay: { visible: false },
      };
    },
    setCurrentRole: (state, action) => {
      state.currentRole = action.payload;
    },

    // Optional: set token manually (e.g. after social login)
    // setToken: (state, action: PayloadAction<string | null>) => {
    //   state.token = action.payload;
    //   state.isAuthenticated = !!action.payload;
    // },
  },
  extraReducers: (builder) => {
    builder

      /* LOGIN */
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.ui.loadingOverlay.visible = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.ui.loadingOverlay.visible = false;
        // login modal already closed in thunk via dispatch
      })
      .addCase(loginUser.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
        state.ui.loadingOverlay.visible = false;
      })

      /* LOGOUT */
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })

      /* FETCH CURRENT USER */
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

/* ===============================
   EXPORTS
================================= */

export const { updateLoginUi, clearAuthState, setCurrentRole } =
  authSlice.actions;
export default authSlice.reducer;
