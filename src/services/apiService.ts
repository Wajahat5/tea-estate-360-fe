import { config } from "../config";
import { mockApi } from "./mockApi";
import { httpApi } from "./httpApi";

export const apiService = config.shouldUseMockAPIs ? mockApi : httpApi;
