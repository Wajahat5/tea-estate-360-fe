import { config } from "../config";
import { auth } from "./auth";
import { store } from "../store";
import type {
  CompanyListItem,
  CreateLabourerRequest,
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
  CreateUserRequest,
  RequestsFetchItem,
  Task,
  UpdateLabourerRequest,
  User
} from "../types/api";

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
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = store.getState().auth.token || auth.getToken();
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            authorization: `Bearer ${token}`
          }
        : {}),
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }

  return (await response.json()) as T;
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
    create: (body: CreateUserRequest) =>
      request<User>("/user/create", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    logout: () =>
      request<void>("/user/logout", {
        method: "POST"
      })
  },
  company: {
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
    // Swagger only defines /garden/fetch/{gardenid}; there is no list endpoint.
    // For now, return an empty list to avoid 404s until a real list API is added.
    list: async () => {
      return [] as Garden[];
    }
  },
  labourer: {
    list: async () => {
      const raw = await request<RawLabourer[]>("/labourer/fetch", { method: "GET" });
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
          address_details: item.address_details
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
      })
  },
  employee: {
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
            phone: employee.phone
          })
        )
        .filter((employee) => !employee.gardenid || employee.gardenid === gardenid);
    }
  },
  requests: {
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
    }
  },
  expenses: {
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
          status: item.status
        })
      );
    }
  },
  tasks: {
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
    overview: (query: DashboardQuery = {}) =>
      request<DashboardOverviewResponse>(
        `/dashboard/overview${buildQuery(query)}`,
        { method: "GET" }
      ),
    trends: (
      query: DashboardQuery & {
        group_by?: "day" | "week" | "month";
        metrics?: string;
      } = {}
    ) =>
      request<DashboardTrendsResponse>(
        `/dashboard/trends${buildQuery(query)}`,
        { method: "GET" }
      ),
    recentActivity: (
      query: DashboardQuery & {
        limit?: number;
      } = {}
    ) =>
      request<DashboardRecentActivityResponse>(
        `/dashboard/recent-activity${buildQuery(query)}`,
        { method: "GET" }
      ),
    alerts: (query: DashboardQuery = {}) =>
      request<DashboardAlertsResponse>(
        `/dashboard/alerts${buildQuery(query)}`,
        { method: "GET" }
      ),
    gardenBreakdown: (query: DashboardQuery = {}) =>
      request<DashboardGardenBreakdownResponse>(
        `/dashboard/garden-breakdown${buildQuery(query)}`,
        { method: "GET" }
      )
  }
};
