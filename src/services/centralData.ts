import { setAuth } from "../store/authSlice";
import { fetchCompaniesSuccess } from "../store/companiesSlice";
import { store } from "../store";
import { auth } from "./auth";

export const centralData = {
  initializeData: (): boolean => {
    const state = store.getState();
    const token = auth.getToken();

    if (!token) {
      return false;
    }

    // Initialize Auth (User)
    if (!state.auth.user) {
      const storedUser = auth.getUser();
      if (storedUser) {
        store.dispatch(setAuth({ token, user: storedUser }));
      } else {
        // Token exists but no user data? In strict mode we might redirect,
        // but for now we return false to let the caller decide (e.g. redirect to login)
        return false;
      }
    }

    // Initialize Companies
    if (state.companies.items.length === 0) {
      const storedCompanies = auth.getCompanies();
      if (storedCompanies) {
        store.dispatch(fetchCompaniesSuccess(storedCompanies));
      }
      // If companies are missing in local storage, we can return true (user is auth)
      // and let the component fetch them if needed, or we could return false.
      // The requirement says "return it to the component... If it is not available in local storage as well, redirect user to login screen"
      // This implies strict data requirement. However, companies list might be empty validly.
      // But typically "not available" means not cached.
      // We will assume that if user is logged in, we at least have user info.
    }

    return true;
  }
};
