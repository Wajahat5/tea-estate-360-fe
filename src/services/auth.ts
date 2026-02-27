import type { CompanyListItem, User } from "../types/api";

const TOKEN_KEY = "teaestate360_token";
const USER_KEY = "teaestate360_user";
const COMPANIES_KEY = "teaestate360_companies";

export const auth = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const userStr = window.localStorage.getItem(USER_KEY);
    return userStr ? (JSON.parse(userStr) as User) : null;
  },
  setUser(user: User) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getCompanies(): CompanyListItem[] | null {
    if (typeof window === "undefined") return null;
    const companiesStr = window.localStorage.getItem(COMPANIES_KEY);
    return companiesStr ? (JSON.parse(companiesStr) as CompanyListItem[]) : null;
  },
  setCompanies(companies: CompanyListItem[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies));
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.removeItem(COMPANIES_KEY);
  }
};
