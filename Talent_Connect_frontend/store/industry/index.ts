"use client";

import { apiConfig } from "@/lib/apiConfig";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

/* ===============================
   INITIAL STATE
================================= */

/* ===============================
   API BASE URL
================================= */

/* ===============================
   ASYNC THUNKS
================================= */

// Fetch all industries
export const fetchAllIndustry = createAsyncThunk(
  "adminIndustry/fetchAllIndustry",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(apiConfig.industry);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch industries",
      );
    }
  },
);

// Fetch industry by ID
export const fetchIndustryById = createAsyncThunk(
  "adminIndustry/fetchIndustryById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${apiConfig.industry}/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch industry",
      );
    }
  },
);

// Add industry
export const addIndustry = createAsyncThunk(
  "adminIndustry/addIndustry",
  async (data: any, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(apiConfig.industry, data);
      // ✅ refetch all industries after add
      dispatch(fetchAllIndustry());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to add industry");
    }
  },
);

// Update industry
export const updateIndustry = createAsyncThunk(
  "adminIndustry/updateIndustry",
  async (
    { id, data }: { id: number; data: any },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const response = await axios.put(`${apiConfig.industry}/${id}`, data);
      // ✅ refetch all industries after update
      dispatch(fetchAllIndustry());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to update industry",
      );
    }
  },
);

// Delete Industry
export const deleteIndustry = createAsyncThunk(
  "adminIndustry/deleteIndustry",
  async (id: number, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(`${apiConfig.industry}/${id}`);
      // ✅ refetch all industries after delete
      dispatch(fetchAllIndustry());
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to delete industry",
      );
    }
  },
);

/* ===============================
   SLICE
================================= */

const initialState = {
  data: [],
  industry: null,
  currentIndustry: {},
  ui: {
    addIndustry: { open: false },
    updateIndustry: { open: false },
    viewIndustry: { open: false },
    bulkOffer: { open: false },
  },
  loading: false,
  error: null,
};

const adminIndustrySlice = createSlice({
  name: "adminIndustry",
  initialState,
  reducers: {
    clearSelectedIndustry: (state) => {
      state.industry = null;
    },
    updateUiIndustry: (
      state,
      action: PayloadAction<Partial<typeof state.ui>>,
    ) => {
      state.ui = { ...state.ui, ...action.payload };
    },
    setCurrentIndustry: (state, action: PayloadAction<any>) => {
      state.currentIndustry = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder

      /* FETCH ALL */
      .addCase(fetchAllIndustry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllIndustry.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAllIndustry.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* FETCH BY ID */
      .addCase(fetchIndustryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIndustryById.fulfilled, (state, action) => {
        state.loading = false;
        state.industry = action.payload;
      })
      .addCase(fetchIndustryById.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ADD */
      .addCase(addIndustry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addIndustry.fulfilled, (state) => {
        state.loading = false;
        state.ui.addIndustry.open = false; // close add modal after success
      })
      .addCase(addIndustry.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* UPDATE */
      .addCase(updateIndustry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateIndustry.fulfilled, (state) => {
        state.loading = false;
        state.ui.updateIndustry.open = false; // close update modal after success
      })
      .addCase(updateIndustry.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* DELETE */
      .addCase(deleteIndustry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteIndustry.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteIndustry.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

/* ===============================
   EXPORTS
================================= */

export const { clearSelectedIndustry, updateUiIndustry, setCurrentIndustry } =
  adminIndustrySlice.actions;
export default adminIndustrySlice.reducer;
