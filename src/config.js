const shouldUseLocalBackend = false
export const config = {
  // Toggle between mock APIs (true) and real backend APIs (false)
  shouldUseMockAPIs: false,

  // Optional: base URL for real backend APIs when shouldUseMockAPIs is false
  apiBaseUrl: shouldUseLocalBackend?"http://localhost:3000": "https://tea-garden-project.vercel.app",
};
