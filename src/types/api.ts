export interface Company {
  companyid: string;
  name: string;
  state: string;
  district: string;
  pincode: string;
  labourer_daily_wage: number;
  labourer_extrawage_per_kg: number;
  labourer_extrawage_per_hr: number;
}

export interface CompanyGarden {
  gardenid: string;
  name: string;
  state: string;
  district: string;
  pincode: string;
  companyid: string;
}

export interface CompanyListItem extends Company {
  email?: string;
  ownerid?: string;
  image?: string;
  access_requests?: Array<{ _id: string; gardenid: string; userid: string }>;
  gardens: CompanyGarden[];
}

export interface CreateCompanyRequest {
  companyid: string;
  name: string;
  state: string;
  district: string;
  pincode: string;
  labourer_daily_wage: number;
  labourer_extrawage_per_kg: number;
  labourer_extrawage_per_hr: number;
}

export interface UpdateCompanyRequest {
  companyid: string;
  labourer_daily_wage: number;
  labourer_extrawage_per_kg: number;
  labourer_extrawage_per_hr: number;
}

export interface User {
  userid: string;
  db_role?: string;
  gardenid: string;
  name: string;
  phone: string;
  profession: string;
  email?: string;
  image?: string;
}

export interface CreateUserRequest {
  gardenid: string;
  name: string;
  phone: string;
  profession: string;
  password: string;
}

export interface LoginUserRequest {
  phone: string;
  password: string;
}

export interface UpdateUserRequest {
  userid: string;
  gardenid: string;
  name?: string;
  phone?: string;
  profession?: string;
  email?: string;
}

export interface Garden {
  gardenid: string;
  name: string;
  state: string;
  district: string;
  pincode: string;
  companyid: string;
}

export interface CreateGardenRequest {
  name: string;
  state: string;
  district: string;
  pincode: string;
  companyid: string;
}

export interface UpdateGardenRequest {
  gardenid: string;
  name: string;
}

export interface Labourer {
  labourerid: string;
  name: string;
  type: "permanent" | "casual" | "temporary";
  gardenid: string;
  married_status: string;
  gender: "male" | "female" | "other";
  address_details: string;
  image?: string;
}

export interface CreateLabourerRequest
  extends Omit<Labourer, "labourerid"> {}

export interface UpdateLabourerRequest {
  labourerid: string;
  name?: string;
  type?: "permanent" | "casual" | "temporary";
  married_status?: string;
  gender?: "male" | "female" | "other";
  address_details?: string;
}

export interface LabourerLeaveRequest {
  labourerid: string;
  start: string;
  end: string;
  reason: string;
}

export interface AddAttendanceRequest {
  labourerid: string;
  year: string;
  month: number;
  part: number;
  extra: number;
  day: number;
  type: string;
}

export interface UpdateAttendanceRequest {
  earningid: string;
  day: number;
  extra: number;
  type: string;
}

export interface AddPaymentRequest {
  labourerid: string;
  year: number;
  month: number;
  part: number;
  amount: number;
}

export interface DeletePaymentRequest {
  companyid: string;
  labourerid: string;
  year: string;
  month: number;
  part: number;
}

export type RequestStatus = "under_review" | "approved";

export interface MaintenanceRequest {
  requestid: string;
  date: string;
  gardenid: string;
  title: string;
  model_name: string;
  ids: string[];
  points: string[];
  status: RequestStatus;
  image?: string;
}

export interface RequestLabourer {
  _id: string;
  name: string;
  type?: string;
  married_status?: boolean;
  gender?: string;
  address_details?: string;
  image?: string;
}

export interface RequestEmployee {
  _id: string;
  name: string;
  profession?: string;
  image?: string;
}

export interface RequestsFetchItem {
  _id: string;
  points: string[];
  status: RequestStatus;
  gardenid: string;
  title: string;
  date: string;
  labourers?: RequestLabourer[];
  employees?: RequestEmployee[];
  image?: string;
}

export type ExpenseStatus = "unpaid" | "paid";

export interface Expense {
  expenseid: string;
  gardenid: string;
  date: string;
  title: string;
  req_id: string | null;
  points: string[];
  amount?: number;
  status: ExpenseStatus;
  image?: string;
}

export interface RewardUpdates {
  firewood: boolean;
  bonus: boolean;
  house_rent_compensation: boolean;
  footware: boolean;
  umbrella: boolean;
  appron: boolean;
  blanket: boolean;
}

export interface Employee {
  employeeid: string;
  gardenid?: string;
  name: string;
  profession: string;
  phone: string;
  image?: string;
}

export interface CreateEmployeeRequest
  extends Omit<Employee, "employeeid"> {}

export interface UpdateEmployeeRequest extends Employee {}

export interface Task {
  taskid: string;
  gardenid: string;
  title: string;
  date: string;
  points: string[];
  status: "not_started" | "under_progress" | "completed";
}

export interface CreateTaskRequest
  extends Omit<Task, "taskid"> {}

export interface UpdateTaskRequest extends Task {}

export interface JoinGardenRequest {
  gardenid: string;
}

export interface ProcessJoinRequest {
  action: "accept" | "reject";
  userid: string;
  gardenid: string;
  companyid: string;
}

export interface DashboardOverview {
  labourerCount: number;
  attendanceThisMonth: number;
  totalWagesThisMonth: number;
  pendingRequests: number;
  recentTasks: Task[];
}

export interface DashboardQuery {
  gardenid?: string;
  from?: string;
  to?: string;
  tz?: string;
}

export interface DashboardScope {
  companyids: string[];
  gardenids: string[];
  from: string;
  to: string;
  tz: string;
}

export interface DashboardOverviewResponse {
  scope: DashboardScope;
  kpis: {
    total_labourers: number;
    active_labourers: number;
    total_employees: number;
    present_days_total: number;
    wages_due: number;
    wages_paid: number;
    expense_unpaid_total: number;
    expense_paid_total: number;
    pending_requests_count: number;
    tasks_pending_count: number;
    tasks_in_progress_count: number;
    tasks_completed_count: number;
  };
  quick_status: {
    requests: { under_review: number; approved: number };
    expenses: { paid: number; unpaid: number };
    tasks: { not_started: number; under_progress: number; completed: number };
  };
  updated_at: string;
}

export interface DashboardTrendPoint {
  x: string;
  y?: number;
  paid?: number;
  unpaid?: number;
  under_review?: number;
  approved?: number;
  not_started?: number;
  under_progress?: number;
  completed?: number;
}

export interface DashboardTrendsResponse {
  scope: DashboardScope;
  series: Array<{
    key: string;
    label: string;
    points: DashboardTrendPoint[];
  }>;
}

export interface DashboardRecentActivityResponse {
  scope: DashboardScope;
  items: Array<{
    id: string;
    type: "request" | "expense" | "task";
    title: string;
    gardenid: string;
    garden_name: string;
    status: string;
    date: string;
    meta: Record<string, unknown>;
  }>;
}

export interface DashboardAlertsResponse {
  scope: DashboardScope;
  alerts: Array<{
    code: string;
    severity: "info" | "warning" | "error";
    title: string;
    description: string;
    count?: number;
    amount?: number;
  }>;
}

export interface DashboardGardenBreakdownResponse {
  scope: DashboardScope;
  gardens: Array<{
    gardenid: string;
    garden_name: string;
    labourers: number;
    employees: number;
    attendance: number;
    wages_due: number;
    wages_paid: number;
    expenses_paid: number;
    expenses_unpaid: number;
    requests_under_review: number;
    tasks_not_started: number;
    tasks_under_progress: number;
  }>;
}

export interface DashboardSummaryResponse {
  success: boolean;
  message: string;
  data: {
    totalLabourers: number;
    totalEmployees: number;
    totalReviewRequests: number;
    totalUnpaidExpenses: number;
    totalNotStartedTasks: number;
    totalInProgressTasks: number;
  };
}
