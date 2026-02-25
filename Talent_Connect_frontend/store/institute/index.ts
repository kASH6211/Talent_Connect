import { apiConfig } from "@/lib/apiConfig";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { any } from "zod";

/* ===============================
   INITIAL STATE
================================= */

/* ===============================
   API BASE URL
================================= */

/* ===============================
   ASYNC THUNKS
================================= */

// Fetch all institutes
export const fetchAllInstitute = createAsyncThunk(
  "adminInstitute/fetchAllInstitute",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(apiConfig.institute);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch institutes",
      );
    }
  },
);

// Fetch institute by ID
export const fetchInstituteById = createAsyncThunk(
  "adminInstitute/fetchInstituteById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${apiConfig.institute}/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch institute",
      );
    }
  },
);

// Add institute
export const addInstitute = createAsyncThunk(
  "adminInstitute/addInstitute",
  async (data: any, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(apiConfig.institute, data);
      // ✅ refetch all institutes after add
      dispatch(fetchAllInstitute());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to add institute");
    }
  },
);

// Update institute
export const updateInstitute = createAsyncThunk(
  "adminInstitute/updateInstitute",
  async (
    { id, data }: { id: number; data: any },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const response = await axios.put(`${apiConfig.institute}/${id}`, data);
      // ✅ refetch all institutes after update
      dispatch(fetchAllInstitute());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to update institute",
      );
    }
  },
);

// Delete institute
export const deleteInstitute = createAsyncThunk(
  "adminInstitute/deleteInstitute",
  async (id: number, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(`${apiConfig.institute}/${id}`);
      // ✅ refetch all institutes after delete
      dispatch(fetchAllInstitute());
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to delete institute",
      );
    }
  },
);

/* ===============================
   SLICE
================================= */

const initialState = {
  data: [],
  institute: null,
  offer: {},
  ui: {
    addInstitute: { open: false },
    updateInstitute: { open: false },
    viewInstitute: { open: false },
  },
  loading: false,
  error: null,
};

const adminInstituteSlice = createSlice({
  name: "adminInstitute",
  initialState,
  reducers: {
    clearSelectedInstitute: (state) => {
      state.institute = null;
    },
    updateUiInstitute: (
      state,
      action: PayloadAction<Partial<typeof state.ui>>,
    ) => {
      state.ui = { ...state.ui, ...action.payload };
    },
    setCurrentOffer: (state, action: PayloadAction<any>) => {
      state.offer = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder

      /* FETCH ALL */
      .addCase(fetchAllInstitute.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllInstitute.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAllInstitute.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* FETCH BY ID */
      .addCase(fetchInstituteById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInstituteById.fulfilled, (state, action) => {
        state.loading = false;
        state.institute = action.payload;
      })
      .addCase(fetchInstituteById.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ADD */
      .addCase(addInstitute.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addInstitute.fulfilled, (state) => {
        state.loading = false;
        state.ui.addInstitute.open = false; // close add modal after success
      })
      .addCase(addInstitute.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* UPDATE */
      .addCase(updateInstitute.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInstitute.fulfilled, (state) => {
        state.loading = false;
        state.ui.updateInstitute.open = false; // close update modal after success
      })
      .addCase(updateInstitute.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* DELETE */
      .addCase(deleteInstitute.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInstitute.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteInstitute.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

/* ===============================
   EXPORTS
================================= */

export const { clearSelectedInstitute, updateUiInstitute, setCurrentOffer } =
  adminInstituteSlice.actions;
export default adminInstituteSlice.reducer;
