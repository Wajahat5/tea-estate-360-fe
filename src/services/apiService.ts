import { config } from "../config";
import { mockApi } from "./mockApi";
import { httpApi } from "./httpApi";

// Wrap mock API to simulate the HTTP interceptor behavior for testing the block modal
const wrapMockWithInterceptor = (mock: typeof mockApi) => {
  const wrapped = { ...mock };

  // Intercept company.list to simulate 400 'Not allowed to use db'
  wrapped.company = {
    ...mock.company,
    list: async () => {
      try {
        return await mock.company.list();
      } catch (err: any) {
        if (err.isBlockedError) {
          // In a real scenario, httpApi does this dispatch.
          // mockApi was just throwing. Let's do it here so it exactly mimics httpApi.
          const { store } = require("../store");
          const { setBlocked } = require("../store/authSlice");
          store.dispatch(setBlocked(true));
        }
        throw err;
      }
    }
  };

  return wrapped;
};

export const apiService = config.shouldUseMockAPIs ? wrapMockWithInterceptor(mockApi) : httpApi;
