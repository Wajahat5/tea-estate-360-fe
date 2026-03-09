import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { apiService } from "../services/apiService";
import type {
  CompanyListItem,
  CreateCompanyRequest,
  CreateEmployeeRequest,
  CreateGardenRequest,
  CreateLabourerRequest,
  CreateTaskRequest,
  Employee,
  Expense,
  Garden,
  Labourer,
  MaintenanceRequest,
  Task,
  UpdateCompanyRequest,
  UpdateEmployeeRequest,
  UpdateGardenRequest,
  UpdateLabourerRequest,
  UpdateTaskRequest,
  User,
  UpdateUserRequest
} from "../types/api";

type GardenOption = {
  gardenid: string;
  name: string;
};

type FormModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  mode: "create" | "update";
  type: "labourer" | "employee" | "request" | "expense" | "task" | "company" | "garden" | "user" | "company_flow";
  gardens?: GardenOption[];
  labourer?: Labourer;
  employee?: Employee;
  request?: MaintenanceRequest;
  expense?: Expense;
  task?: Task;
  company?: CompanyListItem;
  gardenData?: Garden;
  user?: User;
  companyIdForGarden?: string;

  onClose: () => void;

  onCreateLabourer?: (payload: CreateLabourerRequest) => Promise<void>;
  onUpdateLabourer?: (payload: UpdateLabourerRequest, file?: File | null, removeImage?: boolean) => Promise<void>;
  onCreateEmployee?: (payload: CreateEmployeeRequest) => Promise<void>;
  onUpdateEmployee?: (payload: UpdateEmployeeRequest, file?: File | null, removeImage?: boolean) => Promise<void>;
  onCreateRequest?: (payload: MaintenanceRequest) => Promise<void>;
  onUpdateRequest?: (payload: MaintenanceRequest, file?: File | null, removeImage?: boolean) => Promise<void>;
  onCreateExpense?: (payload: Expense) => Promise<void>;
  onUpdateExpense?: (payload: Expense, file?: File | null, removeImage?: boolean) => Promise<void>;
  onCreateTask?: (payload: CreateTaskRequest) => Promise<void>;
  onUpdateTask?: (payload: UpdateTaskRequest) => Promise<void>;
  onCreateCompany?: (payload: CreateCompanyRequest) => Promise<void>;
  onUpdateCompany?: (payload: UpdateCompanyRequest, file?: File | null, removeImage?: boolean) => Promise<void>;
  onCreateGarden?: (payload: CreateGardenRequest) => Promise<void>;
  onUpdateGarden?: (payload: UpdateGardenRequest) => Promise<void>;
  onUpdateUser?: (payload: UpdateUserRequest, file?: File | null, removeImage?: boolean) => Promise<void>;
  onCreateCompanyFlow?: (companyPayload: CreateCompanyRequest, gardenPayload: CreateGardenRequest) => Promise<void>;
};

type LabourerFormState = {
  name: string;
  type: "permanent" | "casual" | "temporary";
  gardenid: string;
  married_status: string;
  gender: "male" | "female" | "other";
  address_details: string;
};

type EmployeeFormState = {
  name: string;
  profession: string;
  phone: string;
  gardenid: string;
};

type RequestFormState = {
  title: string;
  date: string;
  gardenid: string;
  model_name: string;
  ids: string;
  points: string;
  description: string;
};

type ExpenseFormState = {
  title: string;
  date: string;
  gardenid: string;
  req_id: string;
  points: string;
  description: string;
  amount: string;
};

type TaskFormState = {
  title: string;
  date: string;
  gardenid: string;
  points: string;
  description: string;
  status: "not_started" | "under_progress" | "completed";
};

type CompanyFormState = {
  name: string;
  state: string;
  district: string;
  pincode: string;
  labourer_daily_wage: string;
  labourer_extrawage_per_kg: string;
  labourer_extrawage_per_hr: string;
};

type GardenFormState = {
  name: string;
  state: string;
  district: string;
  pincode: string;
};

type UserFormState = {
  name: string;
  phone: string;
  profession: string;
  email: string;
};

const createInitialLabourerState: LabourerFormState = {
  name: "",
  type: "permanent",
  gardenid: "",
  married_status: "false",
  gender: "male",
  address_details: ""
};

const createInitialEmployeeState: EmployeeFormState = {
  name: "",
  profession: "",
  phone: "",
  gardenid: ""
};

const createInitialRequestState: RequestFormState = {
  title: "",
  date: "",
  gardenid: "",
  model_name: "labourer",
  ids: "",
  points: "",
  description: ""
};

const createInitialExpenseState: ExpenseFormState = {
  title: "",
  date: "",
  gardenid: "",
  req_id: "",
  points: "",
  description: "",
  amount: ""
};

const createInitialTaskState: TaskFormState = {
  title: "",
  date: "",
  gardenid: "",
  points: "",
  description: "",
  status: "not_started"
};

const createInitialCompanyState: CompanyFormState = {
  name: "",
  state: "",
  district: "",
  pincode: "",
  labourer_daily_wage: "",
  labourer_extrawage_per_kg: "",
  labourer_extrawage_per_hr: ""
};

const createInitialGardenState: GardenFormState = {
  name: "",
  state: "",
  district: "",
  pincode: ""
};

const createInitialUserState: UserFormState = {
  name: "",
  phone: "",
  profession: "",
  email: ""
};

export const FormModal = ({
  isOpen,
  isSubmitting,
  mode,
  type,
  gardens = [],
  labourer,
  employee,
  request,
  expense,
  task,
  company,
  gardenData,
  user,
  companyIdForGarden,
  onClose,
  onCreateLabourer,
  onUpdateLabourer,
  onCreateEmployee,
  onUpdateEmployee,
  onCreateRequest,
  onUpdateRequest,
  onCreateExpense,
  onUpdateExpense,
  onCreateTask,
  onUpdateTask,
  onCreateCompany,
  onUpdateCompany,
  onCreateGarden,
  onUpdateGarden,
  onUpdateUser,
  onCreateCompanyFlow
}: FormModalProps) => {
  const [labourerFormData, setLabourerFormData] = useState<LabourerFormState>(createInitialLabourerState);
  const [employeeFormData, setEmployeeFormData] = useState<EmployeeFormState>(createInitialEmployeeState);
  const [requestFormData, setRequestFormData] = useState<RequestFormState>(createInitialRequestState);
  const [expenseFormData, setExpenseFormData] = useState<ExpenseFormState>(createInitialExpenseState);
  const [taskFormData, setTaskFormData] = useState<TaskFormState>(createInitialTaskState);
  const [companyFormData, setCompanyFormData] = useState<CompanyFormState>(createInitialCompanyState);
  const [gardenFormData, setGardenFormData] = useState<GardenFormState>(createInitialGardenState);
  const [userFormData, setUserFormData] = useState<UserFormState>(createInitialUserState);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // State for company_flow
  const [flowStep, setFlowStep] = useState<"email" | "otp" | "company" | "garden">("email");
  const [flowEmail, setFlowEmail] = useState("");
  const [flowOtp, setFlowOtp] = useState("");
  const [flowCompanyId, setFlowCompanyId] = useState("");
  const [flowIsLoading, setFlowIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setLabourerFormData(createInitialLabourerState);
      setEmployeeFormData(createInitialEmployeeState);
      setRequestFormData(createInitialRequestState);
      setExpenseFormData(createInitialExpenseState);
      setTaskFormData(createInitialTaskState);
      setCompanyFormData(createInitialCompanyState);
      setGardenFormData(createInitialGardenState);
      setUserFormData(createInitialUserState);
      setImageFile(null);
      setRemoveImage(false);
      setError(null);
      setFlowStep("email");
      setFlowEmail("");
      setFlowOtp("");
      setFlowCompanyId("");
      setFlowIsLoading(false);
      return;
    }

    if (type === "labourer" && mode === "update" && labourer) {
      setLabourerFormData({
        name: labourer.name || "",
        type: labourer.type || "permanent",
        gardenid: labourer.gardenid || "",
        married_status: labourer.married_status || "false",
        gender: labourer.gender || "male",
        address_details: labourer.address_details || ""
      });
    } else if (type === "employee" && mode === "update" && employee) {
      setEmployeeFormData({
        name: employee.name || "",
        profession: employee.profession || "",
        phone: employee.phone || "",
        gardenid: employee.gardenid || ""
      });
    } else if (type === "request" && mode === "update" && request) {
      setRequestFormData({
        title: request.title || "",
        date: request.date || "",
        gardenid: request.gardenid || "",
        model_name: request.model_name || "labourer",
        ids: (request.ids || []).join(", "),
        points: (request.points || []).join(", "),
        description: request.description || (request.points || []).join(", ")
      });
    } else if (type === "expense" && mode === "update" && expense) {
      setExpenseFormData({
        title: expense.title || "",
        date: expense.date || "",
        gardenid: expense.gardenid || "",
        req_id: expense.req_id || "",
        points: (expense.points || []).join(", "),
        description: expense.description || (expense.points || []).join(", "),
        amount: expense.amount ? String(expense.amount) : ""
      });
    } else if (type === "task" && mode === "update" && task) {
      setTaskFormData({
        title: task.title || "",
        date: task.date || "",
        gardenid: task.gardenid || "",
        points: (task.points || []).join(", "),
        description: task.description || (task.points || []).join(", "),
        status: task.status || "not_started"
      });
    } else if (type === "company" && mode === "update" && company) {
      setCompanyFormData({
        name: company.name || "",
        state: company.state || "",
        district: company.district || "",
        pincode: company.pincode || "",
        labourer_daily_wage: String(company.labourer_daily_wage || ""),
        labourer_extrawage_per_kg: String(company.labourer_extrawage_per_kg || ""),
        labourer_extrawage_per_hr: String(company.labourer_extrawage_per_hr || "")
      });
    } else if (type === "garden" && mode === "update" && gardenData) {
      setGardenFormData({
        name: gardenData.name || "",
        state: gardenData.state || "",
        district: gardenData.district || "",
        pincode: gardenData.pincode || ""
      });
    } else if (type === "user" && mode === "update" && user) {
      setUserFormData({
        name: user.name || "",
        phone: user.phone || "",
        profession: user.profession || "",
        email: user.email || ""
      });
    }
  }, [isOpen, mode, type, labourer, employee, request, expense, task, company, gardenData, user]);

  const canSubmit = useMemo(() => {
    if (type === "company") {
      return (
        companyFormData.name.trim().length > 0 &&
        companyFormData.state.trim().length > 0 &&
        companyFormData.district.trim().length > 0 &&
        companyFormData.pincode.trim().length > 0
      );
    }
    if (type === "garden") {
      return (
        gardenFormData.name.trim().length > 0 &&
        gardenFormData.state.trim().length > 0 &&
        gardenFormData.district.trim().length > 0 &&
        gardenFormData.pincode.trim().length > 0
      );
    }
    return true;
  }, [type, companyFormData, gardenFormData]);

  if (!isOpen) return null;

  const handleCompanyChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGardenChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGardenFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setRemoveImage(false);
    }
  };

  const handleLabourerChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLabourerFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleEmployeeChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmployeeFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleRequestChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRequestFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleExpenseChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExpenseFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleTaskChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      if (type === "company_flow") {
        if (!onCreateCompanyFlow) return;

        if (flowStep === "email") {
          setFlowIsLoading(true);
          try {
            const res = await apiService.company.sendCode({ email: flowEmail });
            if (res.success) {
              setFlowCompanyId(res.companyid);
              setFlowStep("otp");
            }
          } finally {
            setFlowIsLoading(false);
          }
          return;
        } else if (flowStep === "otp") {
          setFlowIsLoading(true);
          try {
            const res = await apiService.company.verifyCode({ email: flowEmail, code: flowOtp });
            if (res.success) {
              setFlowCompanyId(res.companyid);
              // Fetch govt data
              const govtData = await apiService.company.getGovtData?.();
              if (govtData) {
                setCompanyFormData((prev) => ({
                  ...prev,
                  labourer_daily_wage: String(govtData.labourer_daily_wage),
                  labourer_extrawage_per_kg: String(govtData.labourer_extrawage_kg),
                  labourer_extrawage_per_hr: String(govtData.labourer_extrawage_hr),
                }));
              }
              setFlowStep("company");
            }
          } finally {
            setFlowIsLoading(false);
          }
          return;
        } else if (flowStep === "company") {
          setFlowStep("garden");
          return;
        } else if (flowStep === "garden") {
          const cPayload = {
            companyid: flowCompanyId,
            name: companyFormData.name,
            state: companyFormData.state,
            district: companyFormData.district,
            pincode: companyFormData.pincode,
            labourer_daily_wage: Number(companyFormData.labourer_daily_wage) || 0,
            labourer_extrawage_per_kg: Number(companyFormData.labourer_extrawage_per_kg) || 0,
            labourer_extrawage_per_hr: Number(companyFormData.labourer_extrawage_per_hr) || 0,
          };
          const gPayload = {
            name: gardenFormData.name,
            state: gardenFormData.state,
            district: gardenFormData.district,
            pincode: gardenFormData.pincode,
            companyid: flowCompanyId
          };
          await onCreateCompanyFlow(cPayload, gPayload);
          return;
        }
      } else if (type === "company") {
        if (!onCreateCompany || !onUpdateCompany) return;
        const payload = {
          companyid: company ? company.companyid : "",
          name: companyFormData.name,
          state: companyFormData.state,
          district: companyFormData.district,
          pincode: companyFormData.pincode,
          labourer_daily_wage: Number(companyFormData.labourer_daily_wage) || 0,
          labourer_extrawage_per_kg: Number(companyFormData.labourer_extrawage_per_kg) || 0,
          labourer_extrawage_per_hr: Number(companyFormData.labourer_extrawage_per_hr) || 0,
        };

        if (mode === "create") {
          await onCreateCompany(payload);
        } else {
          await onUpdateCompany(payload, imageFile, removeImage);
        }
      } else if (type === "garden") {
        if (!onCreateGarden || !onUpdateGarden) return;
        const payload = {
          gardenid: gardenData ? gardenData.gardenid : undefined,
          companyid: companyIdForGarden || "",
          name: gardenFormData.name,
          state: gardenFormData.state,
          district: gardenFormData.district,
          pincode: gardenFormData.pincode
        };

        if (mode === "create") {
          await onCreateGarden(payload as CreateGardenRequest);
        } else {
          await onUpdateGarden(payload as UpdateGardenRequest);
        }
      } else if (type === "user") {
        if (!onUpdateUser || !user) return;
        const payload: UpdateUserRequest = {
          userid: user.userid,
          name: userFormData.name.trim(),
          phone: userFormData.phone.trim(),
          profession: userFormData.profession.trim(),
          email: userFormData.email.trim()
        };
        await onUpdateUser(payload, imageFile, removeImage);
      } else if (type === "labourer" && onCreateLabourer && onUpdateLabourer) {
         if (mode === "create") {
            await onCreateLabourer({
                ...labourerFormData,
                name: labourerFormData.name.trim(),
                address_details: labourerFormData.address_details.trim()
            });
         } else if (labourer) {
            await onUpdateLabourer({
                labourerid: labourer.labourerid,
                ...labourerFormData,
                name: labourerFormData.name.trim(),
                address_details: labourerFormData.address_details.trim()
            }, imageFile, removeImage);
         }
      } else if (type === "employee" && onCreateEmployee && onUpdateEmployee) {
         if (mode === "create") {
            await onCreateEmployee({ ...employeeFormData, name: employeeFormData.name.trim() });
         } else if (employee) {
            await onUpdateEmployee({
                employeeid: employee.employeeid,
                ...employeeFormData,
                name: employeeFormData.name.trim()
            }, imageFile, removeImage);
         }
      } else if (type === "request" && onCreateRequest && onUpdateRequest) {
         const ids = requestFormData.ids.split(",").map(id => id.trim()).filter(id => id.length > 0);
         const parsedPoints = requestFormData.description.split("\n").map(p => p.trim()).filter(p => p.length > 0);
         const payload = {
            requestid: request ? request.requestid : "",
            title: requestFormData.title.trim(),
            date: requestFormData.date,
            gardenid: requestFormData.gardenid,
            model_name: requestFormData.model_name,
            ids,
            points: parsedPoints,
            description: requestFormData.description,
            status: request ? request.status : "under_review" as const
         };
         if (mode === "create") await onCreateRequest(payload);
         else await onUpdateRequest(payload, imageFile, removeImage);
      } else if (type === "expense" && onCreateExpense && onUpdateExpense) {
         const parsedPoints = expenseFormData.description.split("\n").map(p => p.trim()).filter(p => p.length > 0);
         const payload = {
            expenseid: expense ? expense.expenseid : "",
            gardenid: expenseFormData.gardenid,
            date: expenseFormData.date,
            title: expenseFormData.title.trim(),
            req_id: expenseFormData.req_id.trim() || null,
            points: parsedPoints,
            description: expenseFormData.description,
            amount: Number(expenseFormData.amount) || 0,
            status: expense ? expense.status : "unpaid" as const
         };
         if (mode === "create") await onCreateExpense(payload);
         else await onUpdateExpense(payload, imageFile, removeImage);
      } else if (type === "task" && onCreateTask && onUpdateTask) {
         const parsedPoints = taskFormData.description.split("\n").map(p => p.trim()).filter(p => p.length > 0);
         if (mode === "create") {
            await onCreateTask({
                gardenid: taskFormData.gardenid,
                title: taskFormData.title.trim(),
                date: taskFormData.date,
                points: parsedPoints,
                description: taskFormData.description,
                status: "not_started"
            });
         } else if (task) {
            await onUpdateTask({
                taskid: task.taskid,
                gardenid: task.gardenid,
                title: taskFormData.title.trim(),
                date: taskFormData.date,
                points: parsedPoints,
                description: taskFormData.description,
                status: taskFormData.status
            });
         }
      }
    } catch (submitError) {
      setError((submitError as Error).message || "Failed to submit form.");
    }
  };

  const renderImageUpload = (imageUrl?: string) => (
    <div style={{ marginTop: "16px", borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
      <label className="field-label">Image</label>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
        {imageUrl && !removeImage && (
          <img src={imageUrl} alt="Current" style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }} />
        )}
        <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: "13px" }} />
        {imageUrl && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => setRemoveImage(!removeImage)}
            style={{ fontSize: "12px", padding: "4px 8px" }}
          >
            {removeImage ? "Undo Remove" : "Remove"}
          </button>
        )}
      </div>
    </div>
  );

  const renderCompanyFlow = () => {
    if (flowStep === "email") {
      return (
        <>
          <label className="field-label">
            Company Email
            <input className="field-input" type="email" value={flowEmail} onChange={(e) => setFlowEmail(e.target.value)} required />
          </label>
        </>
      );
    }
    if (flowStep === "otp") {
      return (
        <>
          <label className="field-label">
            Verification Code
            <input className="field-input" type="text" value={flowOtp} onChange={(e) => setFlowOtp(e.target.value)} required />
          </label>
        </>
      );
    }
    if (flowStep === "company") {
      return renderCompanyForm(true);
    }
    if (flowStep === "garden") {
      return renderGardenForm();
    }
    return null;
  };

  const renderCompanyForm = (isFlowStep = false) => (
    <>
      <label className="field-label">
        Name
        <input className="field-input" name="name" value={companyFormData.name} onChange={handleCompanyChange} required />
      </label>
      <div style={{ display: "flex", gap: "10px" }}>
        <label className="field-label" style={{ flex: 1 }}>
          State
          <input className="field-input" name="state" value={companyFormData.state} onChange={handleCompanyChange} required />
        </label>
        <label className="field-label" style={{ flex: 1 }}>
          District
          <input className="field-input" name="district" value={companyFormData.district} onChange={handleCompanyChange} required />
        </label>
      </div>
      <label className="field-label">
        Pincode
        <input className="field-input" name="pincode" value={companyFormData.pincode} onChange={handleCompanyChange} required />
      </label>
      {!isFlowStep && (
        <>
          <label className="field-label">
            Daily Wage (Rs)
            <input className="field-input" type="number" name="labourer_daily_wage" value={companyFormData.labourer_daily_wage} onChange={handleCompanyChange} />
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            <label className="field-label" style={{ flex: 1 }}>
              Wage/kg (Rs)
              <input className="field-input" type="number" name="labourer_extrawage_per_kg" value={companyFormData.labourer_extrawage_per_kg} onChange={handleCompanyChange} />
            </label>
            <label className="field-label" style={{ flex: 1 }}>
              Wage/hr (Rs)
              <input className="field-input" type="number" name="labourer_extrawage_per_hr" value={companyFormData.labourer_extrawage_per_hr} onChange={handleCompanyChange} />
            </label>
          </div>
        </>
      )}

      {mode === "update" && renderImageUpload(company?.image)}
    </>
  );

  const renderUserForm = () => (
    <>
      <label className="field-label">
        Name
        <input className="field-input" name="name" value={userFormData.name} onChange={handleUserChange} required />
      </label>
      <label className="field-label">
        Phone
        <input className="field-input" name="phone" value={userFormData.phone} onChange={handleUserChange} required />
      </label>
      <label className="field-label">
        Profession
        <input className="field-input" name="profession" value={userFormData.profession} onChange={handleUserChange} required />
      </label>
      <label className="field-label">
        Email
        <input className="field-input" name="email" value={userFormData.email} onChange={handleUserChange} />
      </label>
      {mode === "update" && renderImageUpload(user?.image)}
    </>
  );

  const renderGardenForm = () => (
    <>
      <label className="field-label">
        Name
        <input className="field-input" name="name" value={gardenFormData.name} onChange={handleGardenChange} required />
      </label>
      <div style={{ display: "flex", gap: "10px" }}>
        <label className="field-label" style={{ flex: 1 }}>
          State
          <input className="field-input" name="state" value={gardenFormData.state} onChange={handleGardenChange} required />
        </label>
        <label className="field-label" style={{ flex: 1 }}>
          District
          <input className="field-input" name="district" value={gardenFormData.district} onChange={handleGardenChange} required />
        </label>
      </div>
      <label className="field-label">
        Pincode
        <input className="field-input" name="pincode" value={gardenFormData.pincode} onChange={handleGardenChange} required />
      </label>
    </>
  );

  const renderLabourerForm = () => (
    <>
      <label className="field-label">
        Name
        <input className="field-input" name="name" value={labourerFormData.name} onChange={handleLabourerChange} required />
      </label>
      <label className="field-label">
        Type
        <select className="field-input" name="type" value={labourerFormData.type} onChange={handleLabourerChange} required>
          <option value="permanent">Permanent</option>
          <option value="casual">Casual</option>
          <option value="temporary">Temporary</option>
        </select>
      </label>
      {mode === "create" && (
        <label className="field-label">
          Garden
          <select className="field-input" name="gardenid" value={labourerFormData.gardenid} onChange={handleLabourerChange} required>
            <option value="">Select garden</option>
            {gardens.map((g) => (
              <option key={g.gardenid} value={g.gardenid}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="field-label">
        Status
        <select className="field-input" name="married_status" value={labourerFormData.married_status} onChange={handleLabourerChange} required>
          <option value="true">Married</option>
          <option value="false">Unmarried</option>
        </select>
      </label>
      <label className="field-label">
        Gender
        <select className="field-input" name="gender" value={labourerFormData.gender} onChange={handleLabourerChange} required>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </label>
      <label className="field-label">
        Address
        <textarea className="field-input" name="address_details" value={labourerFormData.address_details} onChange={handleLabourerChange} required />
      </label>
      {mode === "update" && renderImageUpload(labourer?.image)}
    </>
  );

  const renderEmployeeForm = () => (
    <>
      <label className="field-label">
        Name
        <input className="field-input" name="name" value={employeeFormData.name} onChange={handleEmployeeChange} required />
      </label>
      <label className="field-label">
        Profession
        <input className="field-input" name="profession" value={employeeFormData.profession} onChange={handleEmployeeChange} required />
      </label>
      <label className="field-label">
        Phone
        <input className="field-input" name="phone" value={employeeFormData.phone} onChange={handleEmployeeChange} required />
      </label>
      {mode === "create" && (
        <label className="field-label">
          Garden
          <select className="field-input" name="gardenid" value={employeeFormData.gardenid} onChange={handleEmployeeChange} required>
            <option value="">Select garden</option>
            {gardens.map((g) => (
              <option key={g.gardenid} value={g.gardenid}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {mode === "update" && renderImageUpload(employee?.image)}
    </>
  );

  const renderRequestForm = () => (
    <>
      <label className="field-label">
        Title
        <input className="field-input" name="title" value={requestFormData.title} onChange={handleRequestChange} required />
      </label>
      <label className="field-label">
        Date
        <input className="field-input" type="date" name="date" value={requestFormData.date} onChange={handleRequestChange} required />
      </label>
      {mode === "create" && (
        <label className="field-label">
          Garden
          <select className="field-input" name="gardenid" value={requestFormData.gardenid} onChange={handleRequestChange} required>
            <option value="">Select garden</option>
            {gardens.map((g) => (
              <option key={g.gardenid} value={g.gardenid}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="field-label">
        Model
        <select className="field-input" name="model_name" value={requestFormData.model_name} onChange={handleRequestChange} required>
          <option value="labourer">Labourer</option>
          <option value="garden">Garden</option>
        </select>
      </label>
      <label className="field-label">
        IDs
        <input className="field-input" name="ids" value={requestFormData.ids} onChange={handleRequestChange} />
      </label>
      <label className="field-label">
        Description
        <textarea className="field-input" name="description" value={requestFormData.description} onChange={handleRequestChange} required />
      </label>
      {mode === "update" && renderImageUpload(request?.image)}
    </>
  );

  const renderExpenseForm = () => (
    <>
      <label className="field-label">
        Title
        <input className="field-input" name="title" value={expenseFormData.title} onChange={handleExpenseChange} required />
      </label>
      <label className="field-label">
        Date
        <input className="field-input" type="date" name="date" value={expenseFormData.date} onChange={handleExpenseChange} required />
      </label>
      {mode === "create" && (
        <label className="field-label">
          Garden
          <select className="field-input" name="gardenid" value={expenseFormData.gardenid} onChange={handleExpenseChange} required>
            <option value="">Select garden</option>
            {gardens.map((g) => (
              <option key={g.gardenid} value={g.gardenid}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="field-label">
        Req ID
        <input className="field-input" name="req_id" value={expenseFormData.req_id} onChange={handleExpenseChange} />
      </label>
      <label className="field-label">
        Amount
        <input className="field-input" type="number" name="amount" value={expenseFormData.amount} onChange={handleExpenseChange} />
      </label>
      <label className="field-label">
        Description
        <textarea className="field-input" name="description" value={expenseFormData.description} onChange={handleExpenseChange} required />
      </label>
      {mode === "update" && renderImageUpload(expense?.image)}
    </>
  );

  const renderTaskForm = () => (
    <>
      <label className="field-label">
        Title
        <input className="field-input" name="title" value={taskFormData.title} onChange={handleTaskChange} required />
      </label>
      <label className="field-label">
        Date
        <input className="field-input" type="date" name="date" value={taskFormData.date} onChange={handleTaskChange} required />
      </label>
      {mode === "create" && (
        <label className="field-label">
          Garden
          <select className="field-input" name="gardenid" value={taskFormData.gardenid} onChange={handleTaskChange} required>
            <option value="">Select garden</option>
            {gardens.map((g) => (
              <option key={g.gardenid} value={g.gardenid}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {mode === "update" && (
        <label className="field-label">
          Status
          <select className="field-input" name="status" value={taskFormData.status} onChange={handleTaskChange} required>
            <option value="not_started">Not Started</option>
            <option value="under_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>
      )}
      <label className="field-label">
        Description
        <textarea className="field-input" name="description" value={taskFormData.description} onChange={handleTaskChange} required />
      </label>
    </>
  );

  const getModalTitle = () => {
    if (type === "company_flow") {
      if (flowStep === "email") return "Verify Company Email";
      if (flowStep === "otp") return "Enter Verification Code";
      if (flowStep === "company") return "Company Details";
      if (flowStep === "garden") return "Create First Garden";
    }
    return `${mode === "create" ? "Create" : "Update"} ${type}`;
  };

  const getSubmitLabel = () => {
    if (type === "company_flow") {
      if (flowStep === "email") return flowIsLoading ? "Sending..." : "Send Verification Code";
      if (flowStep === "otp") return flowIsLoading ? "Verifying..." : "Verify Code";
      if (flowStep === "company") return "Next";
      if (flowStep === "garden") return isSubmitting ? "Saving..." : "Create Company & Garden";
    }
    return isSubmitting ? "Saving..." : "Save";
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="panel-header">
          <h2 className="panel-title">{getModalTitle()}</h2>
          <button type="button" className="link-button" onClick={onClose}>Close</button>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          {type === "company_flow" ? renderCompanyFlow() :
           type === "company" ? renderCompanyForm() :
           type === "garden" ? renderGardenForm() :
           type === "user" ? renderUserForm() :
           type === "labourer" ? renderLabourerForm() :
           type === "employee" ? renderEmployeeForm() :
           type === "request" ? renderRequestForm() :
           type === "expense" ? renderExpenseForm() :
           renderTaskForm()}

          {error && <p className="field-error">{error}</p>}
          <button className="primary-button" type="submit" disabled={isSubmitting || flowIsLoading || (type !== "company_flow" && !canSubmit)}>
            {getSubmitLabel()}
          </button>
        </form>
      </div>
    </div>
  );
};
