import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CompanyListItem } from "../types/api";

type CompaniesState = {
  items: CompanyListItem[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
  expandedCompanyIds: Record<string, boolean>;
};

const initialState: CompaniesState = {
  items: [],
  loading: false,
  error: null,
  loaded: false,
  expandedCompanyIds: {}
};

const companiesSlice = createSlice({
  name: "companies",
  initialState,
  reducers: {
    fetchCompaniesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCompaniesSuccess(state, action: PayloadAction<CompanyListItem[]>) {
      state.loading = false;
      state.loaded = true;
      state.items = action.payload;
    },
    fetchCompaniesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    toggleCompanyExpanded(state, action: PayloadAction<string>) {
      const companyId = action.payload;
      state.expandedCompanyIds[companyId] = !state.expandedCompanyIds[companyId];
    }
  }
});

export const {
  fetchCompaniesStart,
  fetchCompaniesSuccess,
  fetchCompaniesFailure,
  toggleCompanyExpanded
} = companiesSlice.actions;
export const companiesReducer = companiesSlice.reducer;
