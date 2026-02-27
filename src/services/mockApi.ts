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

    async create(payload: CreateUserRequest): Promise<User> {
      await delay(400);
      const newUser: User & { password: string } = {
        userid: crypto.randomUUID(),
        gardenid: payload.gardenid,
        name: payload.name,
        phone: payload.phone,
        profession: payload.profession,
        password: payload.password
      };
      users.push(newUser);
      return { ...newUser, password: undefined } as unknown as User;
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
        gardenid: payload.gardenid,
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
    async create(payload: CreateCompanyRequest): Promise<Company> {
      await delay(300);
      const newCompany: Company = {
        ...payload,
        companyid: crypto.randomUUID()
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
      return companies.map((company) => ({
        ...company,
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
      }));
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
    async list(): Promise<Labourer[]> {
      await delay(250);
      return [...labourers];
    }
  },

  earnings: {
    async addAttendance(_payload: AddAttendanceRequest): Promise<void> {
      await delay(200);
    },
    async updateAttendance(_payload: UpdateAttendanceRequest): Promise<void> {
      await delay(200);
    },
    async addPayment(_payload: AddPaymentRequest): Promise<void> {
      await delay(200);
    },
    async deletePayment(_payload: DeletePaymentRequest): Promise<void> {
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
        (r) => r.requestid === payload.requestid
      );
      if (index === -1) {
        throw new Error("Request not found");
      }
      requests[index] = { ...requests[index], ...payload };
      return requests[index];
    },
    async delete(requestid: string): Promise<void> {
      await delay(200);
      requests = requests.filter((r) => r.requestid !== requestid);
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
      requests = requests.map((r) =>
        ids.includes(r.requestid) ? { ...r, status } : r
      );
    },
    async uploadImage(requestid: string, _file: File): Promise<void> {
      await delay(300);
      const request = requests.find((r) => r.requestid === requestid);
      if (!request) throw new Error("Request not found");
    },
    async removeImage(requestid: string): Promise<void> {
      await delay(300);
      const request = requests.find((r) => r.requestid === requestid);
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
    async overview(query: DashboardQuery = {}): Promise<DashboardOverviewResponse> {
      await delay(250);
      const scopedGardenIds = query.gardenid
        ? [query.gardenid]
        : gardens.map((garden) => garden.gardenid);
      const scopedCompanyIds = companies.map((company) => company.companyid);
      const scopedLabourers = labourers.filter((labourer) =>
        scopedGardenIds.includes(labourer.gardenid)
      );
      const scopedEmployees = employees.filter(
        (employee) => !employee.gardenid || scopedGardenIds.includes(employee.gardenid)
      );
      const scopedRequests = requests.filter((request) =>
        scopedGardenIds.includes(request.gardenid)
      );
      const scopedExpenses = expenses.filter((expense) =>
        scopedGardenIds.includes(expense.gardenid)
      );
      const scopedTasks = tasks.filter((task) =>
        scopedGardenIds.includes(task.gardenid)
      );
      return {
        scope: {
          companyids: scopedCompanyIds,
          gardenids: scopedGardenIds,
          from: query.from || "2026-02-01",
          to: query.to || "2026-02-26",
          tz: query.tz || "Asia/Kolkata"
        },
        kpis: {
          total_labourers: scopedLabourers.length,
          active_labourers: scopedLabourers.length,
          total_employees: scopedEmployees.length,
          present_days_total: scopedLabourers.length * 26,
          wages_due: scopedLabourers.length * 5200,
          wages_paid: scopedLabourers.length * 4300,
          expense_unpaid_total: scopedExpenses
            .filter((expense) => expense.status === "unpaid")
            .length * 3000,
          expense_paid_total: scopedExpenses
            .filter((expense) => expense.status === "paid")
            .length * 3000,
          pending_requests_count: scopedRequests.filter(
            (request) => request.status === "under_review"
          ).length,
          tasks_pending_count: scopedTasks.filter(
            (task) => task.status === "not_started"
          ).length,
          tasks_in_progress_count: scopedTasks.filter(
            (task) => task.status === "under_progress"
          ).length,
          tasks_completed_count: scopedTasks.filter(
            (task) => task.status === "completed"
          ).length
        },
        quick_status: {
          requests: {
            under_review: scopedRequests.filter(
              (request) => request.status === "under_review"
            ).length,
            approved: scopedRequests.filter(
              (request) => request.status === "approved"
            ).length
          },
          expenses: {
            paid: scopedExpenses.filter((expense) => expense.status === "paid")
              .length,
            unpaid: scopedExpenses.filter((expense) => expense.status === "unpaid")
              .length
          },
          tasks: {
            not_started: scopedTasks.filter(
              (task) => task.status === "not_started"
            ).length,
            under_progress: scopedTasks.filter(
              (task) => task.status === "under_progress"
            ).length,
            completed: scopedTasks.filter((task) => task.status === "completed")
              .length
          }
        },
        updated_at: new Date().toISOString()
      };
    },
    async trends(): Promise<DashboardTrendsResponse> {
      await delay(200);
      return {
        scope: {
          companyids: companies.map((company) => company.companyid),
          gardenids: gardens.map((garden) => garden.gardenid),
          from: "2026-02-01",
          to: "2026-02-26",
          tz: "Asia/Kolkata"
        },
        series: [
          {
            key: "attendance",
            label: "Attendance",
            points: [{ x: "2026-02-01", y: labourers.length * 20 }]
          },
          {
            key: "wages_paid",
            label: "Wages Paid",
            points: [{ x: "2026-02-01", y: labourers.length * 4300 }]
          },
          {
            key: "wages_due",
            label: "Wages Due",
            points: [{ x: "2026-02-01", y: labourers.length * 5200 }]
          },
          {
            key: "expenses",
            label: "Expenses",
            points: [
              {
                x: "2026-02-01",
                paid: expenses.filter((expense) => expense.status === "paid")
                  .length,
                unpaid: expenses.filter((expense) => expense.status === "unpaid")
                  .length
              }
            ]
          },
          {
            key: "requests",
            label: "Requests",
            points: [
              {
                x: "2026-02-01",
                under_review: requests.filter(
                  (request) => request.status === "under_review"
                ).length,
                approved: requests.filter(
                  (request) => request.status === "approved"
                ).length
              }
            ]
          },
          {
            key: "tasks",
            label: "Tasks",
            points: [
              {
                x: "2026-02-01",
                not_started: tasks.filter((task) => task.status === "not_started")
                  .length,
                under_progress: tasks.filter(
                  (task) => task.status === "under_progress"
                ).length,
                completed: tasks.filter((task) => task.status === "completed")
                  .length
              }
            ]
          }
        ]
      };
    },
    async recentActivity(): Promise<DashboardRecentActivityResponse> {
      await delay(200);
      return {
        scope: {
          companyids: companies.map((company) => company.companyid),
          gardenids: gardens.map((garden) => garden.gardenid),
          from: "2026-02-01",
          to: "2026-02-26",
          tz: "Asia/Kolkata"
        },
        items: [
          ...requests.slice(0, 3).map((request) => ({
            id: `req_${request.requestid}`,
            type: "request" as const,
            title: request.title,
            gardenid: request.gardenid,
            garden_name:
              gardens.find((garden) => garden.gardenid === request.gardenid)?.name ||
              request.gardenid,
            status: request.status,
            date: request.date,
            meta: { points_count: request.points.length }
          })),
          ...expenses.slice(0, 3).map((expense) => ({
            id: `exp_${expense.expenseid}`,
            type: "expense" as const,
            title: expense.title,
            gardenid: expense.gardenid,
            garden_name:
              gardens.find((garden) => garden.gardenid === expense.gardenid)?.name ||
              expense.gardenid,
            status: expense.status,
            date: expense.date,
            meta: { amount: expense.points.length * 1000 }
          })),
          ...tasks.slice(0, 3).map((task) => ({
            id: `task_${task.taskid}`,
            type: "task" as const,
            title: task.title,
            gardenid: task.gardenid,
            garden_name:
              gardens.find((garden) => garden.gardenid === task.gardenid)?.name ||
              task.gardenid,
            status: task.status,
            date: task.date,
            meta: {}
          }))
        ].slice(0, 20)
      };
    },
    async alerts(): Promise<DashboardAlertsResponse> {
      await delay(150);
      return {
        scope: {
          companyids: companies.map((company) => company.companyid),
          gardenids: gardens.map((garden) => garden.gardenid),
          from: "2026-02-01",
          to: "2026-02-26",
          tz: "Asia/Kolkata"
        },
        alerts: [
          {
            code: "EXPENSE_UNPAID_HIGH",
            severity: "warning",
            title: "High unpaid expenses",
            description: "Unpaid expenses exceeded configured threshold.",
            count: expenses.filter((expense) => expense.status === "unpaid").length,
            amount: expenses.filter((expense) => expense.status === "unpaid").length * 3000
          },
          {
            code: "REQUESTS_PENDING",
            severity: "info",
            title: "Pending approval requests",
            description: "Requests waiting for review.",
            count: requests.filter((request) => request.status === "under_review")
              .length
          },
          {
            code: "TASKS_NOT_STARTED",
            severity: "info",
            title: "Tasks not started",
            description: "Tasks pending start in selected scope.",
            count: tasks.filter((task) => task.status === "not_started").length
          }
        ]
      };
    },
    async gardenBreakdown(): Promise<DashboardGardenBreakdownResponse> {
      await delay(180);
      return {
        scope: {
          companyids: companies.map((company) => company.companyid),
          gardenids: gardens.map((garden) => garden.gardenid),
          from: "2026-02-01",
          to: "2026-02-26",
          tz: "Asia/Kolkata"
        },
        gardens: gardens.map((garden) => ({
          gardenid: garden.gardenid,
          garden_name: garden.name,
          labourers: labourers.filter((labourer) => labourer.gardenid === garden.gardenid)
            .length,
          employees: employees.filter(
            (employee) => employee.gardenid === garden.gardenid
          ).length,
          attendance: labourers.filter((labourer) => labourer.gardenid === garden.gardenid)
            .length * 26,
          wages_due: labourers.filter((labourer) => labourer.gardenid === garden.gardenid)
            .length * 5200,
          wages_paid: labourers.filter((labourer) => labourer.gardenid === garden.gardenid)
            .length * 4300,
          expenses_paid: expenses.filter(
            (expense) =>
              expense.gardenid === garden.gardenid && expense.status === "paid"
          ).length * 3000,
          expenses_unpaid: expenses.filter(
            (expense) =>
              expense.gardenid === garden.gardenid && expense.status === "unpaid"
          ).length * 3000,
          requests_under_review: requests.filter(
            (request) =>
              request.gardenid === garden.gardenid &&
              request.status === "under_review"
          ).length,
          tasks_not_started: tasks.filter(
            (task) => task.gardenid === garden.gardenid && task.status === "not_started"
          ).length,
          tasks_under_progress: tasks.filter(
            (task) =>
              task.gardenid === garden.gardenid && task.status === "under_progress"
          ).length
        }))
      };
    }
  }
};
