declare const require: any;
import type {
  AddAttendanceRequest,
  AddPaymentRequest,
  Company,
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
  DeletePaymentRequest,
  Employee,
  Expense,
  ExpenseStatus,
  Garden,
  Labourer,
  LoginUserRequest,
  MaintenanceRequest,
  RequestsFetchItem,
  RequestStatus,
  Task,
  UpdateAttendanceRequest,
  UpdateCompanyRequest,
  UpdateEmployeeRequest,
  UpdateGardenRequest,
  UpdateLabourerRequest,
  UpdateTaskRequest,
  UpdateUserRequest,
  User
} from "../types/api";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let companies: Company[] = [
  {
    companyid: "6011c7b575326918c46a817f",
    name: "TeaEstate360 Pvt Ltd",
    state: "Assam",
    district: "Dibrugarh",
    pincode: "786001",
    labourer_daily_wage: 220,
    labourer_extrawage_per_kg: 12,
    labourer_extrawage_per_hr: 8
  }
];

let gardens: Garden[] = [
  {
    gardenid: "6011c359104f274b806aefa3",
    name: "Green Valley Tea Garden",
    state: "Assam",
    district: "Dibrugarh",
    pincode: "786001",
    companyid: companies[0].companyid
  }
];

let users: (User & { password: string })[] = [
  {
    userid: "6011ad6fb4cbcf21d02d4bb5",
    gardenid: gardens[0].gardenid,
    name: "John Doe",
    phone: "+917002492207",
    profession: "owner",
    password: "Abc123"
  }
];

let labourers: Labourer[] = [
  {
    labourerid: "6012f1dbc91b7744f05f2364",
    name: "Labourer 1",
    type: "permanent",
    gardenid: gardens[0].gardenid,
    married_status: "true",
    gender: "male",
    address_details: "Test address, test location"
  },
  {
    labourerid: "6012f1dbc91b7744f05f2365",
    name: "Labourer 2",
    type: "temporary",
    gardenid: gardens[0].gardenid,
    married_status: "false",
    gender: "female",
    address_details: "Another address, another location"
  }
];

let employees: Employee[] = [
  {
    employeeid: "6020de8f5ea42b1d842c8613",
    gardenid: gardens[0].gardenid,
    name: "Dr. Sen",
    profession: "Doctor",
    phone: "+910000000893"
  }
];

let requests: MaintenanceRequest[] = [
  {
    requestid: "601f8532807b9c3a5c85b105",
    date: "2024-02-20",
    gardenid: gardens[0].gardenid,
    title: "Repair irrigation pump",
    model_name: "labourer",
    ids: [labourers[0].labourerid],
    points: ["Inspect pump", "Replace damaged parts", "Test water flow"],
    status: "under_review"
  },
  {
    requestid: "601f86bc031f49453031435c",
    date: "2024-02-21",
    gardenid: gardens[0].gardenid,
    title: "Fertilizer stock",
    model_name: "garden",
    ids: [gardens[0].gardenid],
    points: ["Check remaining bags", "Place purchase order"],
    status: "approved"
  }
];

let expenses: Expense[] = [
  {
    expenseid: "601ff4cfa59ffe17bc694072",
    gardenid: gardens[0].gardenid,
    date: "2024-02-10",
    title: "Fertilizer purchase",
    req_id: requests[1].requestid,
    points: ["Urea", "Potash", "Micro nutrients"],
    amount: 12500,
    status: "unpaid"
  },
  {
    expenseid: "601ff4cfa59ffe17bc694073",
    gardenid: gardens[0].gardenid,
    date: "2024-02-15",
    title: "Equipment maintenance",
    req_id: null,
    points: ["Pump service", "Generator diesel"],
    amount: 4500,
    status: "paid"
  }
];

let tasks: Task[] = [
  {
    taskid: "6020e6d5452e84309cf51be0",
    gardenid: gardens[0].gardenid,
    title: "Mow the grass",
    date: "2024-02-22",
    points: ["Section A", "Section B"],
    status: "under_progress"
  },
  {
    taskid: "6020e845452e84309cf51be1",
    gardenid: gardens[0].gardenid,
    title: "Prune the bushes",
    date: "2024-02-23",
    points: ["North block", "South block"],
    status: "not_started"
  }
];

const currentUser = () => users[0] as User;

export const mockApi = {
  admin: {
    setGovtWage: async (body: import("../types/api").GovtWageRequest) => { await delay(300); },
    addHoliday: async (body: import("../types/api").HolidayRequest) => { await delay(300); },
    removeHoliday: async (date: string) => { await delay(300); },
  },
  auction: {
    factoryOutput: async (body: import("../types/api").FactoryOutputRequest) => { await delay(300); },
    addTeaLot: async (body: import("../types/api").TeaLotRequest) => { await delay(300); },
    addResult: async (body: import("../types/api").AuctionResultRequest) => { await delay(300); },
    addBuyer: async (body: import("../types/api").BuyerRequest) => { await delay(300); },
    addPayment: async (body: import("../types/api").PaymentRequest) => { await delay(300); },
    history: async (gardenId: string) => { await delay(300); return []; },
    analytics: async (gardenId: string) => { await delay(300); return {}; },
  },
  weighment: {
    getEvents: async () => { await delay(300); return []; },
  },
  payroll: {
    createCycle: async (body: import("../types/api").PayrollCycleRequest) => { await delay(300); },
    lockCycle: async (body: import("../types/api").LockPayrollCycleRequest) => { await delay(300); },
    getPayslips: async (cycleId: string) => { await delay(300); return []; },
    getComplianceReport: async () => { await delay(300); return {}; },
  },
  inventory: {
    addItem: async (body: import("../types/api").InventoryItemRequest) => { await delay(300); },
    addVendor: async (body: import("../types/api").VendorRequest) => { await delay(300); },
    purchaseOrder: async (body: import("../types/api").PurchaseOrderRequest) => { await delay(300); },
    issue: async (body: import("../types/api").InventoryIssueRequest) => { await delay(300); },
    alerts: async (gardenId: string) => { await delay(300); return []; },
  },
  assets: {
    add: async (body: import("../types/api").AssetRequest) => { await delay(300); },
    addBreakdown: async (body: import("../types/api").AssetBreakdownRequest) => { await delay(300); },
    resolveBreakdown: async (body: import("../types/api").ResolveBreakdownRequest) => { await delay(300); },
  },
  reports: {
    costPerKg: async (gardenId: string) => { await delay(300); return {}; },
  },
  analytics: {
    teaYieldIntelligence: async (gardenId: string) => { await delay(300); return {}; },
  },
  stg: {
    addSupplier: async (body: import("../types/api").BoughtLeafSupplier) => { await delay(300); return { ...body, id: "sup-" + Math.random() }; },
    setPrice: async (body: import("../types/api").BoughtLeafPrice) => { await delay(300); return { ...body, id: "prc-" + Math.random() }; },
    addLog: async (body: import("../types/api").BoughtLeafLog) => { await delay(300); return { success: true, message: "Logged" }; },
    getAnalytics: async (gardenId: string) => {
      await delay(300);
      return {
        totalBoughtWeight: 5000,
        totalBoughtCost: 125000,
        averageBoughtCostPerKg: 25,
        supplierRanking: [{ name: "Ram Singh STG", totalSuppliedKg: 5000, averageQualityScore: "8.50" }],
        factoryContext: { totalInternalLeafInput: 15000, totalBoughtLeafInputProcessed: 5000, overallConversionRatio: "0.2200" }
      };
    }
  },

  user: {
    async login(payload: LoginUserRequest): Promise<{ user: User; token: string }> {
      await delay(400);
      const found = users.find(
        (u) => u.phone === payload.phone && u.password === payload.password
      );
      if (!found) {
        throw new Error("Invalid credentials");
      }
      return {
        user: { ...found, password: undefined } as unknown as User,
        token: `mock-token-${found.userid}`
      };
    },

    async create(payload: CreateUserRequest): Promise<{ user: User; token: string }> {
      await delay(400);
      const newUser: User & { password: string } = {
        userid: crypto.randomUUID(),
        gardenid: "", // Defaults to empty during initial signup
        name: payload.name,
        phone: payload.phone,
        profession: payload.profession,
        db_role: payload.profession === "owner" ? "crud" : "none",
        password: payload.password
      };
      // Keep mock current user up to date for tests
      users.unshift(newUser); // Put at front so currentUser() finds it
      return {
        user: { ...newUser, password: undefined } as unknown as User,
        token: `mock-token-${newUser.userid}`
      };
    },

    async joinGarden(payload: { gardenid: string }): Promise<void> {
      await delay(200);
      // In a real app this creates a request. In mock, we just say okay.
    },

    async fetch(): Promise<User> {
      await delay(200);
      return currentUser();
    },

    async update(payload: UpdateUserRequest): Promise<User> {
      await delay(300);
      const index = users.findIndex((u) => u.userid === payload.userid);
      if (index === -1) {
        throw new Error("User not found");
      }
      users[index] = {
        ...users[index],
        ...(payload.name ? { name: payload.name } : {}),
        ...(payload.phone ? { phone: payload.phone } : {}),
        ...(payload.profession ? { profession: payload.profession } : {}),
        ...(payload.email ? { email: payload.email } : {})
      };
      return { ...users[index], password: undefined } as unknown as User;
    },

    async uploadImage(userid: string, _file: File): Promise<void> {
      await delay(500);
      const user = users.find((u) => u.userid === userid);
      if (!user) throw new Error("User not found");
      // In a real app we'd save the file and update the URL.
      // Here we just acknowledge.
    },

    async removeImage(userid: string): Promise<void> {
      await delay(300);
      const user = users.find((u) => u.userid === userid);
      if (!user) throw new Error("User not found");
      // In a real app we'd remove the file reference.
    },

    async logout(): Promise<void> {
      await delay(200);
    }
  },

  company: {
    async sendCode(payload: import("../types/api").SendCodeRequest): Promise<{ success: boolean; companyid: string }> {
      await delay(300);
      return { success: true, companyid: "mock-company-id-for-code" };
    },
    async verifyCode(payload: import("../types/api").VerifyCodeRequest): Promise<{ success: boolean; message: string; companyid: string }> {
      await delay(300);
      if (payload.code === "123456" || payload.code === "0000") { // 0000 for ease of testing
        return { success: true, message: "Valid Code", companyid: "mock-company-id" };
      }
      throw new Error("Invalid Code");
    },
    async searchByName(name: string): Promise<import("../types/api").SearchCompanyResponse[]> {
      await delay(300);
      const lowerName = name.toLowerCase();
      const match = companies.filter(c => c.name.toLowerCase().includes(lowerName));
      return match.map(c => ({
        companyid: c.companyid,
        name: c.name,
        image: "",
        address: { state: c.state, district: c.district, pincode: c.pincode },
        gardens: gardens.filter(g => g.companyid === c.companyid).map(g => ({
          gardenid: g.gardenid,
          image: "",
          name: g.name,
          address: { state: g.state, district: g.district, pincode: g.pincode }
        }))
      }));
    },
    async processRequest(payload: import("../types/api").ProcessJoinRequest): Promise<void> {
      await delay(200);
      const company = companies.find(c => c.companyid === payload.companyid);
      if (company && (company as any).access_requests) {
         (company as any).access_requests = (company as any).access_requests.filter(
             (r: any) => !(r.userid === payload.userid && r.gardenid === payload.gardenid)
         );
      }
    },
    async getGovtData(): Promise<{ labourer_daily_wage: number; labourer_extrawage_kg: number; labourer_extrawage_hr: number }> {
      await delay(300);
      return {
        labourer_daily_wage: 200,
        labourer_extrawage_kg: 10,
        labourer_extrawage_hr: 7
      };
    },
    async create(payload: CreateCompanyRequest): Promise<Company> {
      await delay(300);
      const newCompany: Company = {
        ...payload,
        companyid: payload.companyid || crypto.randomUUID()
      };
      companies.push(newCompany);
      return newCompany;
    },
    async update(payload: UpdateCompanyRequest): Promise<Company> {
      await delay(300);
      const index = companies.findIndex(
        (c) => c.companyid === payload.companyid
      );
      if (index === -1) {
        throw new Error("Company not found");
      }
      companies[index] = { ...companies[index], ...payload };
      return companies[index];
    },
    async uploadImage(companyid: string, _file: File): Promise<void> {
      await delay(500);
      const company = companies.find((c) => c.companyid === companyid);
      if (!company) throw new Error("Company not found");
    },
    async removeImage(companyid: string): Promise<void> {
      await delay(300);
      const company = companies.find((c) => c.companyid === companyid);
      if (!company) throw new Error("Company not found");
    },
    async fetch(companyid: string): Promise<Company | undefined> {
      await delay(200);
      return companies.find((c) => c.companyid === companyid);
    },
    async list(): Promise<CompanyListItem[]> {
      await delay(200);
      // Simulate "Not allowed to use db" if the user has db_role === 'none'
      const currentUserObj = currentUser();
      if (currentUserObj && currentUserObj.db_role === 'none') {
         // This mock simulation throws an error similar to what httpApi does
         const err = new Error("Not allowed to use db");
         (err as any).isBlockedError = true;
         // Actually, mockApi doesn't dispatch Redux actions. In a real scenario, httpApi catches 400.
         // Let's just return what would happen. If we want to simulate it, we can import store.
         // But the app is configured to use mock APIs. Let's just import store and dispatch for the mock.
         const { store } = require("../store");
         const { setBlocked } = require("../store/authSlice");
         store.dispatch(setBlocked(true));
         throw err;
      }

      return companies.map((company) => {
        // Mock some access requests for testing UI
        const access_requests = (company as any).access_requests || [];
        if (company.companyid === "6011c7b575326918c46a817f" && access_requests.length === 0) {
            access_requests.push({
                _id: "req1",
                userid: "user-wanting-to-join",
                gardenid: "6011c359104f274b806aefa3"
            });
        }
        return {
          ...company,
          access_requests,
          gardens: gardens
            .filter((garden) => garden.companyid === company.companyid)
            .map((garden) => ({
              gardenid: garden.gardenid,
              name: garden.name,
              state: garden.state,
              district: garden.district,
              pincode: garden.pincode,
              companyid: garden.companyid
            }))
        }
      });
    }
  },

  garden: {
    async create(payload: CreateGardenRequest): Promise<Garden> {
      await delay(300);
      const newGarden: Garden = {
        gardenid: crypto.randomUUID(),
        ...payload
      };
      gardens.push(newGarden);
      return newGarden;
    },
    async update(payload: UpdateGardenRequest): Promise<Garden> {
      await delay(300);
      const index = gardens.findIndex((g) => g.gardenid === payload.gardenid);
      if (index === -1) {
        throw new Error("Garden not found");
      }
      gardens[index] = { ...gardens[index], ...payload };
      return gardens[index];
    },
    async fetch(gardenid: string): Promise<Garden | undefined> {
      await delay(200);
      return gardens.find((g) => g.gardenid === gardenid);
    },
    async list(): Promise<Garden[]> {
      await delay(200);
      return [...gardens];
    }
  },

  labourer: {
    async create(payload: CreateLabourerRequest): Promise<Labourer> {
      await delay(300);
      const newLabourer: Labourer = {
        labourerid: crypto.randomUUID(),
        ...payload
      };
      labourers.push(newLabourer);
      return newLabourer;
    },
    async update(payload: UpdateLabourerRequest): Promise<Labourer> {
      await delay(300);
      const index = labourers.findIndex(
        (l) => l.labourerid === payload.labourerid
      );
      if (index === -1) {
        throw new Error("Labourer not found");
      }
      labourers[index] = {
        ...labourers[index],
        ...(payload.name ? { name: payload.name } : {}),
        ...(payload.type ? { type: payload.type } : {}),
        ...(payload.married_status ? { married_status: payload.married_status } : {}),
        ...(payload.gender ? { gender: payload.gender } : {}),
        ...(payload.address_details
          ? { address_details: payload.address_details }
          : {})
      };
      return labourers[index];
    },
    async uploadImage(labourerid: string, _file: File): Promise<void> {
      await delay(300);
      const labourer = labourers.find((l) => l.labourerid === labourerid);
      if (!labourer) throw new Error("Labourer not found");
    },
    async removeImage(labourerid: string): Promise<void> {
      await delay(300);
      const labourer = labourers.find((l) => l.labourerid === labourerid);
      if (!labourer) throw new Error("Labourer not found");
    },
    async fetch(filter?: { gardenid?: string }): Promise<Labourer[]> {
      await delay(250);
      let result = [...labourers];
      if (filter?.gardenid) {
        result = result.filter(l => l.gardenid === filter.gardenid);
      }
      return result;
    },
    async addLeave(_payload: import("../types/api").LabourerLeaveRequest): Promise<void> {
      await delay(250);
    },
    async fetchAvailableLeaves(_labourerid: string, _date: string): Promise<{ leaves: number }> {
      await delay(250);
      return { leaves: Math.floor(Math.random() * 10) + 1 };
    }
  },

  earnings: {
    async fetchAttendance(payload: import("../types/api").FetchAttendanceRequest): Promise<any> {
      await delay(200);
      return { data: [] };
    },
    async addAttendance(_payload: import("../types/api").AddAttendanceRequest): Promise<void> {
      await delay(200);
    },
    async updateAttendance(_payload: import("../types/api").UpdateAttendanceRequest): Promise<void> {
      await delay(200);
    },
    async batchFetch(payload: import("../types/api").BatchFetchRequest): Promise<any> {
      await delay(200);
      return { data: payload.labourerids?.map((id: any) => ({
        labourerid: id,
        attendance: [],
        total_earned: Math.floor(Math.random() * 5000),
        status: "unpaid"
      })) || [] };
    },
    async addPayment(_payload: import("../types/api").AddPaymentRequest): Promise<void> {
      await delay(200);
    },
    async fetchPaymentStatus(payload: import("../types/api").FetchPaymentStatusRequest): Promise<boolean[]> {
      await delay(200);
      return payload.labourerids.map(() => Math.random() > 0.5);
    },
    async deletePayment(_payload: import("../types/api").DeletePaymentRequest): Promise<void> {
      await delay(200);
    }
  },

  employee: {
    async create(payload: CreateEmployeeRequest): Promise<Employee> {
      await delay(300);
      const employee: Employee = {
        employeeid: crypto.randomUUID(),
        ...payload
      };
      employees.push(employee);
      return employee;
    },
    async update(payload: UpdateEmployeeRequest): Promise<Employee> {
      await delay(300);
      const index = employees.findIndex(
        (e) => e.employeeid === payload.employeeid
      );
      if (index === -1) {
        throw new Error("Employee not found");
      }
      employees[index] = { ...employees[index], ...payload };
      return employees[index];
    },
    async delete(employeeid: string): Promise<void> {
      await delay(200);
      employees = employees.filter((e) => e.employeeid !== employeeid);
    },
    async uploadImage(employeeid: string, _file: File): Promise<void> {
      await delay(300);
      const employee = employees.find((e) => e.employeeid === employeeid);
      if (!employee) throw new Error("Employee not found");
    },
    async removeImage(employeeid: string): Promise<void> {
      await delay(300);
      const employee = employees.find((e) => e.employeeid === employeeid);
      if (!employee) throw new Error("Employee not found");
    },
    async listByGarden(gardenid: string): Promise<Employee[]> {
      await delay(200);
      return employees.filter(
        (employee) => !employee.gardenid || employee.gardenid === gardenid
      );
    }
  },

  requests: {
    async create(
      request: Omit<MaintenanceRequest, "requestid" | "status">
    ): Promise<MaintenanceRequest> {
      await delay(300);
      const newRequest: MaintenanceRequest = {
        ...request,
        requestid: crypto.randomUUID(),
        status: "under_review"
      };
      requests.push(newRequest);
      return newRequest;
    },
    async update(payload: MaintenanceRequest): Promise<MaintenanceRequest> {
      await delay(300);
      const index = requests.findIndex(
        (r: any) => r.requestid === payload.requestid
      );
      if (index === -1) {
        throw new Error("Request not found");
      }
      requests[index] = { ...requests[index], ...payload };
      return requests[index];
    },
    async delete(requestid: string): Promise<void> {
      await delay(200);
      requests = requests.filter((r: any) => r.requestid !== requestid);
    },
    async listByFilters(
      gardenid: string,
      from: string,
      to: string,
      status: "under_review" | "approved"
    ): Promise<RequestsFetchItem[]> {
      await delay(200);
      const fromDate = new Date(from);
      const toDate = new Date(to);
      return requests
        .filter((request) => {
          const requestDate = new Date(request.date);
          return (
            request.gardenid === gardenid &&
            request.status === status &&
            requestDate >= fromDate &&
            requestDate <= toDate
          );
        })
        .map((request) => ({
          _id: request.requestid,
          points: request.points,
          status: request.status,
          gardenid: request.gardenid,
          title: request.title,
          date: request.date,
          labourers: labourers
            .filter((labourer) => request.ids.includes(labourer.labourerid))
            .map((labourer) => ({
              _id: labourer.labourerid,
              name: labourer.name,
              type: labourer.type,
              married_status: labourer.married_status === "true",
              gender: labourer.gender,
              address_details: labourer.address_details,
              image: ""
            })),
          image: request.image
        }));
    },
    async changeStatus(
      ids: string[],
      status: RequestStatus
    ): Promise<void> {
      await delay(200);
      requests = requests.map((r: any) =>
        ids.includes(r.requestid) ? { ...r, status } : r
      );
    },
    async uploadImage(requestid: string, _file: File): Promise<void> {
      await delay(300);
      const request = requests.find((r: any) => r.requestid === requestid);
      if (!request) throw new Error("Request not found");
    },
    async removeImage(requestid: string): Promise<void> {
      await delay(300);
      const request = requests.find((r: any) => r.requestid === requestid);
      if (!request) throw new Error("Request not found");
    }
  },

  expenses: {
    async create(
      expense: Omit<Expense, "expenseid" | "status">
    ): Promise<Expense> {
      await delay(300);
      const newExpense: Expense = {
        ...expense,
        amount: expense.amount || 0,
        expenseid: crypto.randomUUID(),
        status: "unpaid"
      };
      expenses.push(newExpense);
      return newExpense;
    },
    async update(payload: Expense): Promise<Expense> {
      await delay(300);
      const index = expenses.findIndex(
        (e) => e.expenseid === payload.expenseid
      );
      if (index === -1) {
        throw new Error("Expense not found");
      }
      expenses[index] = {
        ...expenses[index],
        ...payload,
        amount: payload.amount !== undefined ? payload.amount : expenses[index].amount
      };
      return expenses[index];
    },
    async delete(expenseid: string): Promise<void> {
      await delay(200);
      expenses = expenses.filter((e) => e.expenseid !== expenseid);
    },
    async listByFilters(
      gardenid: string,
      from: string,
      to: string,
      status: "paid" | "unpaid"
    ): Promise<Expense[]> {
      await delay(200);
      const fromDate = new Date(from);
      const toDate = new Date(to);
      return expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expense.gardenid === gardenid &&
          expense.status === status &&
          expenseDate >= fromDate &&
          expenseDate <= toDate
        );
      });
    },
    async changeStatus(
      ids: string[],
      status: ExpenseStatus
    ): Promise<void> {
      await delay(200);
      expenses = expenses.map((e) =>
        ids.includes(e.expenseid) ? { ...e, status } : e
      );
    },
    async uploadImages(expenseid: string, _files: File[]): Promise<void> {
      await delay(300);
      const expense = expenses.find((e) => e.expenseid === expenseid);
      if (!expense) throw new Error("Expense not found");
    },
    async removeImage(expenseid: string): Promise<void> {
      await delay(300);
      const expense = expenses.find((e) => e.expenseid === expenseid);
      if (!expense) throw new Error("Expense not found");
    }
  },

  tasks: {
    async create(payload: CreateTaskRequest): Promise<Task> {
      await delay(300);
      const task: Task = {
        ...payload,
        taskid: crypto.randomUUID()
      };
      tasks.push(task);
      return task;
    },
    async update(payload: UpdateTaskRequest): Promise<Task> {
      await delay(300);
      const index = tasks.findIndex((t) => t.taskid === payload.taskid);
      if (index === -1) {
        throw new Error("Task not found");
      }
      tasks[index] = { ...payload };
      return tasks[index];
    },
    async delete(taskid: string): Promise<void> {
      await delay(200);
      tasks = tasks.filter((t) => t.taskid !== taskid);
    },
    async listByFilters(
      gardenid: string,
      from: string,
      to: string
    ): Promise<Task[]> {
      await delay(200);
      const fromDate = new Date(from);
      const toDate = new Date(to);
      return tasks.filter((task) => {
        const taskDate = new Date(task.date);
        return (
          task.gardenid === gardenid &&
          taskDate >= fromDate &&
          taskDate <= toDate
        );
      });
    }
  },

  dashboard: {
    async summary(): Promise<import("../types/api").DashboardSummaryResponse> {
      await delay(250);
      const totalLabourers = labourers.length;
      const totalEmployees = employees.length;
      const totalReviewRequests = requests.filter(r => r.status === "under_review").length;
      const totalUnpaidExpenses = expenses.filter(e => e.status === "unpaid").length;
      const totalNotStartedTasks = tasks.filter(t => t.status === "not_started").length;
      const totalInProgressTasks = tasks.filter(t => t.status === "under_progress").length;

      return {
        success: true,
        message: "Dashboard summary fetched successfully",
        data: {
          totalLabourers,
          totalEmployees,
          totalReviewRequests,
          totalUnpaidExpenses,
          totalNotStartedTasks,
          totalInProgressTasks
        }
      };
    },
    getExecutive: async (gardenId: string) => {
      await delay(500);
      return {
        totalRevenue: 500000,
        operatingExpenses: 300000,
        netMargin: "40%"
      };
    }
  },
  boughtLeaf: {
    getSuppliers: async () => [],
    createSupplier: async (data: any) => data,
    getPrices: async () => [],
    setPrice: async (data: any) => data,
    createLog: async (data: any) => data,
  }
};
