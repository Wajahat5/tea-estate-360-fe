const fs = require('fs');

const apiPath = 'src/types/api.ts';
let apiContent = fs.readFileSync(apiPath, 'utf8');
apiContent = apiContent.replace(
  'export interface FetchAttendanceRequest {\n  labourerids: string[];\n  date: string;\n}',
  'export interface FetchAttendanceRequest {\n  gardenid: string;\n  date: string;\n}'
);
apiContent = apiContent.replace(
  'export interface AddAttendanceRequest {\n  labourers: Array<{\n    labourerid: string;\n    extra: number;\n    type: string;\n  }>;\n  date: string;\n}',
  'export interface AddAttendanceRequest {\n  gardenid: string;\n  data: Array<{\n    labourerid: string;\n    status: string;\n    extra: number;\n    type: string;\n  }>;\n  date: string;\n}'
);
apiContent = apiContent.replace(
  'export interface UpdateAttendanceRequest {\n  labourers: Array<{\n    labourerid: string;\n    extra: number;\n    type: string;\n  }>;\n  date: string;\n}',
  'export interface UpdateAttendanceRequest {\n  gardenid: string;\n  data: Array<{\n    labourerid: string;\n    status: string;\n    extra: number;\n    type: string;\n  }>;\n  date: string;\n}'
);
fs.writeFileSync(apiPath, apiContent);

const mockApiPath = 'src/services/mockApi.ts';
let mockApiContent = fs.readFileSync(mockApiPath, 'utf8');
mockApiContent = mockApiContent.replace(
  'async fetchAttendance(payload: import("../types/api").FetchAttendanceRequest): Promise<boolean[]> {\n      await delay(200);\n      return payload.labourerids.map(() => Math.random() > 0.5);\n    },',
  'async fetchAttendance(payload: import("../types/api").FetchAttendanceRequest): Promise<any> {\n      await delay(200);\n      return { data: [] };\n    },'
);
mockApiContent = mockApiContent.replace(
  'async batchFetch(payload: import("../types/api").BatchFetchRequest): Promise<import("../types/api").BatchFetchResponse[]> {\n      await delay(200);\n      return payload.labourerids.map((id) => ({\n        labourerid: id,\n        attendance: [],\n        total_earned: Math.floor(Math.random() * 5000)\n      }));\n    },',
  'async batchFetch(payload: import("../types/api").BatchFetchRequest): Promise<any> {\n      await delay(200);\n      return { data: payload.labourers?.map((id) => ({\n        labourerid: id,\n        attendance: [],\n        total_earned: Math.floor(Math.random() * 5000),\n        status: "unpaid"\n      })) || [] };\n    },'
);
fs.writeFileSync(mockApiPath, mockApiContent);

const httpApiPath = 'src/services/httpApi.ts';
let httpApiContent = fs.readFileSync(httpApiPath, 'utf8');
httpApiContent = httpApiContent.replace(
  'fetchAttendance: (body: import("../types/api").FetchAttendanceRequest) =>\n      request<boolean[]>("/earning/fetch-attendance", {',
  'fetchAttendance: (body: import("../types/api").FetchAttendanceRequest) =>\n      request<any>("/earning/fetch-attendance", {'
);
httpApiContent = httpApiContent.replace(
  'batchFetch: (body: import("../types/api").BatchFetchRequest) =>\n      request<import("../types/api").BatchFetchResponse[]>("/earning/batchFetch", {',
  'batchFetch: (body: import("../types/api").BatchFetchRequest) =>\n      request<any>("/earning/batchFetch", {'
);
fs.writeFileSync(httpApiPath, httpApiContent);
