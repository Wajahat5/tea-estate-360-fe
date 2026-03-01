import { config } from "../config";
import { auth } from "./auth";
import { store } from "../store";
import { setBlocked } from "../store/authSlice";
import type {
  CompanyListItem,
  CreateCompanyRequest,
  CreateEmployeeRequest,
  CreateGardenRequest,
  CreateLabourerRequest,
  CreateTaskRequest,
  CreateUserRequest,
  DashboardAlertsResponse,
  DashboardGardenBreakdownResponse,
  DashboardOverviewResponse,
  DashboardQuery,
  DashboardRecentActivityResponse,
  DashboardTrendsResponse,
  Employee,
  Expense,
  Garden,
  Labourer,
  LoginUserRequest,
  MaintenanceRequest,
  RequestsFetchItem,
  Task,
  UpdateCompanyRequest,
  UpdateEmployeeRequest,
  UpdateGardenRequest,
  UpdateLabourerRequest,
  UpdateTaskRequest,
  User
} from "../types/api";
import { setError } from "../store/errorSlice";

const BASE_URL = config.apiBaseUrl.replace(/\/$/, "");

type RawCompanyGarden = {
  _id: string;
  name: string;
  state: string;
  district: string;
  pincode: string;
  companyid: string;
};

type RawCompanyListItem = {
  _id: string;
  name: string;
  state: string;
  district: string;
  pincode: string;
  labourer_daily_wage: number;
  labourer_extrawage_per_kg: number;
  labourer_extrawage_per_hr: number;
  email?: string;
  ownerid?: string;
  image?: string;
  access_requests?: Array<{ _id: string; gardenid: string; userid: string }>;
  gardens?: RawCompanyGarden[];
};

type RawUser = {
  _id: string;
  db_role?: string;
  gardenid: string;
  name: string;
  phone: string;
  profession: string;
  email?: string;
  image?: string;
};

type LoginResponse = {
  user: User;
  token: string;
};

type RawRequestsFetchItem = {
  _id: string;
  points: string[];
  status: "under_review" | "approved";
  gardenid: string;
  title: string;
  date: string;
  labourers?: Array<{
    _id: string;
    name: string;
    type?: string;
    married_status?: boolean;
    gender?: string;
    address_details?: string;
    image?: string;
  }>;
  employees?: Array<{
    _id: string;
    name: string;
    profession?: string;
    image?: string;
  }>;
  image?: string;
};

type CreateLabourerResponse = {
  success: boolean;
  message: string;
};

type UpdateLabourerResponse = {
  success: boolean;
  message: string;
};

function buildQuery(
  params: Record<string, string | number | undefined>
): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

type RawEmployee = {
  _id: string;
  gardenid?: string;
  name: string;
  profession: string;
  phone: string;
  image?: string;
};

type RawLabourer = {
  _id?: string;
  labourerid?: string;
  name: string;
  type: "permanent" | "casual" | "temporary";
  gardenid: string;
  married_status: boolean | string;
  gender: "male" | "female" | "other";
  address_details: string;
  image?: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = store.getState().auth.token || auth.getToken();
  try {
    const headers: Record<string, string> = {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> || {})
    };

    // Only set Content-Type to application/json if the body is not FormData
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMessage = text || response.statusText;
      let isBlockedError = false;
      try {
        const jsonError = JSON.parse(text);
        if (jsonError.message) {
          errorMessage = jsonError.message;
        }
        if (response.status === 400 && jsonError.message === 'Not allowed to use db') {
            isBlockedError = true;
        }
      } catch {
        // ignore
      }

      if (isBlockedError) {
        store.dispatch(setBlocked(true));
        // We can throw a specific error or generic one, but we don't want to show the error banner.
        const err = new Error(errorMessage);
        (err as any).isBlockedError = true;
        throw err;
      }

      throw new Error(errorMessage);
    }

    return (await response.json()) as T;
  } catch (error) {
    const err = error as Error & { isBlockedError?: boolean };
    if (!err.isBlockedError) {
      const message = err.message || "An unexpected error occurred";
      store.dispatch(setError(message));
    }
    throw error;
  }
}

export const httpApi = {
  user: {
    login: async (body: LoginUserRequest) => {
      const raw = await request<
        | { user?: RawUser; token?: string }
        | { data?: { user?: RawUser; token?: string } }
        | (RawUser & { token?: string })
      >("/user/login", {
        method: "POST",
        body: JSON.stringify(body)
      });

      const token =
        (raw as any).token ??
        (raw as any).data?.token ??
        (raw as any).accessToken;
      if (!token) {
        throw new Error("Login response did not include an auth token");
      }
      const rawUser = ((raw as any).user ?? (raw as any).data?.user ?? raw) as RawUser;
      const user: User = {
        userid: rawUser._id,
        db_role: rawUser.db_role,
        gardenid: rawUser.gardenid,
        name: rawUser.name,
        phone: rawUser.phone,
        profession: rawUser.profession,
        email: rawUser.email,
        image: rawUser.image
      };

      return {
        user,
        token
      } as LoginResponse;
    },
    create: async (body: CreateUserRequest) => {
      const raw = await request<
        | { user?: RawUser; token?: string }
        | { data?: { user?: RawUser; token?: string } }
        | (RawUser & { token?: string })
      >("/user/create", {
        method: "POST",
        body: JSON.stringify(body)
      });

      const token =
        (raw as any).token ??
        (raw as any).data?.token ??
        (raw as any).accessToken;
      if (!token) {
        throw new Error("Create user response did not include an auth token");
      }
      const rawUser = ((raw as any).user ?? (raw as any).data?.user ?? raw) as RawUser;
      const user: User = {
        userid: rawUser._id,
        db_role: rawUser.db_role,
        gardenid: rawUser.gardenid,
        name: rawUser.name,
        phone: rawUser.phone,
        profession: rawUser.profession,
        email: rawUser.email,
        image: rawUser.image
      };

      return {
        user,
        token
      } as LoginResponse;
    },
    joinGarden: (body: { gardenid: string }) =>
      request<void>("/user/join-garden", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    update: (body: UpdateUserRequest) =>
      request<User>("/user/update", {
        method: "PATCH",
        body: JSON.stringify(body)
      }),
    uploadImage: (userid: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userid", userid);
      return request<void>("/user/upload-image", {
        method: "POST",
        body: formData
      });
    },
    removeImage: (userid: string) =>
      request<void>("/user/remove-image", {
        method: "DELETE",
        body: JSON.stringify({ userid })
      }),
    logout: () =>
      request<void>("/user/logout", {
        method: "POST"
      })
  },
  company: {
    sendCode: (body: import("../types/api").SendCodeRequest) =>
      request<{ success: boolean; companyid: string }>("/company/send-code", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    verifyCode: (body: import("../types/api").VerifyCodeRequest) =>
      request<{ success: boolean; message: string; companyid: string }>("/company/verify-code", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    searchByName: (name: string) =>
      request<import("../types/api").SearchCompanyResponse[]>(`/company/${encodeURIComponent(name)}`, {
        method: "GET"
      }),
    processRequest: (body: import("../types/api").ProcessJoinRequest) =>
      request<void>("/company/process-request", {
        method: "PATCH",
        body: JSON.stringify(body)
      }),
    getGovtData: () =>
      request<{ labourer_daily_wage: number; labourer_extrawage_kg: number; labourer_extrawage_hr: number }>("/company/govt-data", {
        method: "GET"
      }),
    create: (body: CreateCompanyRequest) =>
      request<RawCompanyListItem>("/company/create", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    update: (body: UpdateCompanyRequest) =>
      request<void>("/company/update", {
        method: "PATCH",
        body: JSON.stringify(body)
      }),
    uploadImage: (companyid: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("companyid", companyid);
      return request<void>("/company/upload-image", {
        method: "POST",
        body: formData
      });
    },
    removeImage: (companyid: string) =>
      request<void>("/company/remove-image", {
        method: "DELETE",
        body: JSON.stringify({ companyid })
      }),
    list: async () => {
      const raw = await request<RawCompanyListItem[]>("/company/fetchall", {
        method: "GET"
      });
      return raw.map(
        (company): CompanyListItem => ({
          companyid: company._id,
          name: company.name,
          state: company.state,
          district: company.district,
          pincode: company.pincode,
          labourer_daily_wage: company.labourer_daily_wage,
          labourer_extrawage_per_kg: company.labourer_extrawage_per_kg,
          labourer_extrawage_per_hr: company.labourer_extrawage_per_hr,
          email: company.email,
          ownerid: company.ownerid,
          image: company.image,
          access_requests: company.access_requests,
          gardens: (company.gardens || []).map((garden) => ({
            gardenid: garden._id,
            name: garden.name,
            state: garden.state,
            district: garden.district,
            pincode: garden.pincode,
            companyid: garden.companyid
          }))
        })
      );
    }
  },
  garden: {
    create: (body: CreateGardenRequest) =>
      request<Garden>("/garden/create", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    update: (body: UpdateGardenRequest) =>
      request<void>("/garden/update", {
        method: "PATCH",
        body: JSON.stringify(body)
      }),
    list: async () => {
      return [] as Garden[];
    }
  },
  labourer: {
    fetch: async (filter?: { gardenid?: string }) => {
      const raw = await request<RawLabourer[]>("/labourer/fetch", {
        method: "POST",
        body: JSON.stringify(filter || {})
      });
      return raw.map(
        (item): Labourer => ({
          labourerid: item.labourerid || item._id || "",
          name: item.name,
          type: item.type,
          gardenid: item.gardenid,
          married_status:
            typeof item.married_status === "boolean"
              ? String(item.married_status)
              : item.married_status,
          gender: item.gender,
          address_details: item.address_details,
          image: item.image
        })
      );
    },
    create: (body: CreateLabourerRequest) =>
      request<CreateLabourerResponse>("/labourer/create", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    update: (body: UpdateLabourerRequest) =>
      request<UpdateLabourerResponse>("/labourer/update", {
        method: "PATCH",
        body: JSON.stringify(body)
      }),
    uploadImage: (labourerid: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("labourerid", labourerid);
      return request<void>("/labourer/upload-image", {
        method: "POST",
        body: formData
      });
    },
    removeImage: (labourerid: string) =>
      request<void>("/labourer/remove-image", {
        method: "DELETE",
        body: JSON.stringify({ labourerid })
      }),
    addLeave: (body: import("../types/api").LabourerLeaveRequest) =>
      request<void>("/labourer/add-leave", {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    fetchAvailableLeaves: (labourerid: string, date: string) =>
      request<{ leaves: number }>(`/labourer/${encodeURIComponent(labourerid)}/${encodeURIComponent(date)}`, {
        method: "GET"
      })
  },
  employee: {
    create: (body: CreateEmployeeRequest) =>
      request<Employee>("/employee/create", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    update: (body: UpdateEmployeeRequest) =>
      request<Employee>("/employee/update", {
        method: "PATCH",
        body: JSON.stringify(body)
      }),
    delete: (employeeid: string) =>
      request<void>("/employee/delete", {
        method: "DELETE",
        body: JSON.stringify({ employeeid })
      }),
    listByGarden: async (gardenid: string) => {
      const raw = await request<RawEmployee[]>("/employee/fetch", {
        method: "POST",
        body: JSON.stringify({ gardenid })
      });
      return raw
        .map(
          (employee): Employee => ({
            employeeid: employee._id,
            gardenid: employee.gardenid,
            name: employee.name,
            profession: employee.profession,
            phone: employee.phone,
            image: employee.image
          })
        )
        .filter((employee) => !employee.gardenid || employee.gardenid === gardenid);
    },
    uploadImage: (employeeid: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("employeeid", employeeid);
      return request<void>("/employee/upload-image", {
        method: "POST",
        body: formData
      });
    },
    removeImage: (employeeid: string) =>
      request<void>("/employee/remove-image", {
        method: "DELETE",
        body: JSON.stringify({ employeeid })
      })
  },
  earnings: {
    fetchAttendance: (body: import("../types/api").FetchAttendanceRequest) =>
      request<any>("/earning/fetch-attendance", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    addAttendance: (body: import("../types/api").AddAttendanceRequest) =>
      request<void>("/earning/add-attendance", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateAttendance: (body: import("../types/api").UpdateAttendanceRequest) =>
      request<void>("/earning/update-attendance", {
        method: "PATCH",
        body: JSON.stringify(body)
      }),
    batchFetch: (body: import("../types/api").BatchFetchRequest) =>
      request<any>("/earning/batchFetch", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    addPayment: (body: import("../types/api").AddPaymentRequest) =>
      request<void>("/earning/add-payment", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    fetchPaymentStatus: (body: import("../types/api").FetchPaymentStatusRequest) =>
      request<boolean[]>("/earning/fetch-status", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    deletePayment: (body: import("../types/api").DeletePaymentRequest) =>
      request<void>("/earning/delete-payment", {
        method: "DELETE",
        body: JSON.stringify(body)
      })
  },
  requests: {
    create: (body: MaintenanceRequest) =>
      request<MaintenanceRequest>("/requests/create", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    update: (body: MaintenanceRequest) =>
      request<MaintenanceRequest>("/requests/update", {
        method: "PATCH",
        body: JSON.stringify(body)
      }),
    delete: (requestid: string) =>
      request<void>("/requests/delete", {
        method: "DELETE",
        body: JSON.stringify({ ids: [requestid] })
      }),
    changeStatus: (ids: string[], status: "under_review" | "approved") =>
      request<void>("/requests/change-status", {
        method: "PATCH",
        body: JSON.stringify({ requestids: ids, status })
      }),
    listByFilters: async (
      gardenid: string,
      from: string,
      to: string,
      status: "under_review" | "approved"
    ) => {
      const raw = await request<RawRequestsFetchItem[]>(
        `/requests/fetch/${encodeURIComponent(gardenid)}/${encodeURIComponent(from)}/${encodeURIComponent(to)}/${encodeURIComponent(status)}`,
        { method: "GET" }
      );
      return raw.map(
        (item): RequestsFetchItem => ({
          _id: item._id,
          points: item.points || [],
          status: item.status,
          gardenid: item.gardenid,
          title: item.title,
          date: item.date,
          labourers: item.labourers || [],
          employees: item.employees || [],
          image: item.image
        })
      );
    },
    uploadImage: (requestid: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("requestid", requestid);
      return request<void>("/requests/upload-image", {
        method: "POST",
        body: formData
      });
    },
    removeImage: (requestid: string) =>
      request<void>("/requests/remove-image", {
        method: "DELETE",
        body: JSON.stringify({ requestid })
      })
  },
  expenses: {
    create: (body: Expense) =>
      request<Expense>("/expense/create", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    update: (body: Expense) =>
      request<Expense>("/expense/update", {
        method: "PATCH",
        body: JSON.stringify(body)
      }),
    delete: (expenseid: string) =>
      request<void>("/expense/delete", {
        method: "DELETE",
        body: JSON.stringify({ ids: [expenseid] })
      }),
    changeStatus: (ids: string[], status: "paid" | "unpaid") =>
      request<void>("/expense/change-status", {
        method: "PATCH",
        body: JSON.stringify({ expenseids: ids, status })
      }),
    listByFilters: async (
      gardenid: string,
      from: string,
      to: string,
      status: "paid" | "unpaid"
    ) => {
      const raw = await request<
        Array<
          Omit<Expense, "expenseid"> & {
            _id: string;
            image?: string;
          }
        >
      >(
        `/expense/fetch/${encodeURIComponent(gardenid)}/${encodeURIComponent(from)}/${encodeURIComponent(to)}/${encodeURIComponent(status)}`,
        { method: "GET" }
      );
      return raw.map(
        (item): Expense => ({
          expenseid: item._id,
          gardenid: item.gardenid,
          date: item.date,
          title: item.title,
          req_id: item.req_id ?? null,
          points: item.points || [],
          status: item.status,
          image: item.image
        })
      );
    },
    uploadImages: (expenseid: string, files: File[]) => {
      const formData = new FormData();
      files.forEach(file => formData.append("files", file));
      formData.append("expenseid", expenseid);
      return request<void>("/expense/upload-image", {
        method: "POST",
        body: formData
      });
    },
    removeImage: (expenseid: string) =>
      request<void>("/expense/remove-image", {
        method: "DELETE",
        body: JSON.stringify({ expenseid })
      })
  },
  tasks: {
    create: (body: CreateTaskRequest) =>
      request<Task>("/task/create", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    update: (body: UpdateTaskRequest) =>
      request<Task>("/task/update", {
        method: "PATCH",
        body: JSON.stringify(body)
      }),
    delete: (taskid: string) =>
      request<void>("/task/delete", {
        method: "DELETE",
        body: JSON.stringify({ ids: [taskid] })
      }),
    listByFilters: async (gardenid: string, from: string, to: string) => {
      const raw = await request<
        Array<
          Omit<Task, "taskid"> & {
            _id: string;
          }
        >
      >(
        `/task/fetch/${encodeURIComponent(gardenid)}/${encodeURIComponent(from)}/${encodeURIComponent(to)}`,
        { method: "GET" }
      );
      return raw.map(
        (item): Task => ({
          taskid: item._id,
          gardenid: item.gardenid,
          title: item.title,
          date: item.date,
          points: item.points || [],
          status: item.status
        })
      );
    }
  },
  dashboard: {
    summary: async () => {
      return request<import("../types/api").DashboardSummaryResponse>(
        "/dashboard/summary",
        { method: "GET" }
      );
    }
  }
};
