import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import type {
  CreateEmployeeRequest,
  CreateLabourerRequest,
  CreateTaskRequest,
  Employee,
  Expense,
  Labourer,
  MaintenanceRequest,
  Task,
  UpdateEmployeeRequest,
  UpdateLabourerRequest,
  UpdateTaskRequest
} from "../types/api";

type GardenOption = {
  gardenid: string;
  name: string;
};

type FormModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  mode: "create" | "update";
  type: "labourer" | "employee" | "request" | "expense" | "task";
  gardens: GardenOption[];
  labourer?: Labourer;
  employee?: Employee;
  request?: MaintenanceRequest;
  expense?: Expense;
  task?: Task;
  onClose: () => void;
  onCreateLabourer?: (payload: CreateLabourerRequest) => Promise<void>;
  onUpdateLabourer?: (payload: UpdateLabourerRequest) => Promise<void>;
  onCreateEmployee?: (payload: CreateEmployeeRequest) => Promise<void>;
  onUpdateEmployee?: (payload: UpdateEmployeeRequest) => Promise<void>;
  onCreateRequest?: (payload: MaintenanceRequest) => Promise<void>;
  onUpdateRequest?: (payload: MaintenanceRequest) => Promise<void>;
  onCreateExpense?: (payload: Expense) => Promise<void>;
  onUpdateExpense?: (payload: Expense) => Promise<void>;
  onCreateTask?: (payload: CreateTaskRequest) => Promise<void>;
  onUpdateTask?: (payload: UpdateTaskRequest) => Promise<void>;
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
  ids: string; // comma separated ids
  points: string; // comma separated points
};

type ExpenseFormState = {
  title: string;
  date: string;
  gardenid: string;
  req_id: string;
  points: string; // comma separated items
};

type TaskFormState = {
  title: string;
  date: string;
  gardenid: string;
  points: string; // comma separated items
  status: "not_started" | "under_progress" | "completed";
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
  points: ""
};

const createInitialExpenseState: ExpenseFormState = {
  title: "",
  date: "",
  gardenid: "",
  req_id: "",
  points: ""
};

const createInitialTaskState: TaskFormState = {
  title: "",
  date: "",
  gardenid: "",
  points: "",
  status: "not_started"
};

export const FormModal = ({
  isOpen,
  isSubmitting,
  mode,
  type,
  gardens,
  labourer,
  employee,
  request,
  expense,
  task,
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
  onUpdateTask
}: FormModalProps) => {
  const [labourerFormData, setLabourerFormData] = useState<LabourerFormState>(
    createInitialLabourerState
  );
  const [employeeFormData, setEmployeeFormData] = useState<EmployeeFormState>(
    createInitialEmployeeState
  );
  const [requestFormData, setRequestFormData] = useState<RequestFormState>(
    createInitialRequestState
  );
  const [expenseFormData, setExpenseFormData] = useState<ExpenseFormState>(
    createInitialExpenseState
  );
  const [taskFormData, setTaskFormData] = useState<TaskFormState>(
    createInitialTaskState
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setLabourerFormData(createInitialLabourerState);
      setEmployeeFormData(createInitialEmployeeState);
      setRequestFormData(createInitialRequestState);
      setExpenseFormData(createInitialExpenseState);
      setTaskFormData(createInitialTaskState);
      setError(null);
      return;
    }

    if (type === "labourer") {
      if (mode === "update" && labourer) {
        setLabourerFormData({
          name: labourer.name || "",
          type: labourer.type || "permanent",
          gardenid: labourer.gardenid || "",
          married_status: labourer.married_status || "false",
          gender: labourer.gender || "male",
          address_details: labourer.address_details || ""
        });
      } else {
        setLabourerFormData(createInitialLabourerState);
      }
    } else if (type === "employee") {
      if (mode === "update" && employee) {
        setEmployeeFormData({
          name: employee.name || "",
          profession: employee.profession || "",
          phone: employee.phone || "",
          gardenid: employee.gardenid || ""
        });
      } else {
        setEmployeeFormData(createInitialEmployeeState);
      }
    } else if (type === "request") {
      if (mode === "update" && request) {
        setRequestFormData({
          title: request.title || "",
          date: request.date || "",
          gardenid: request.gardenid || "",
          model_name: request.model_name || "labourer",
          ids: (request.ids || []).join(", "),
          points: (request.points || []).join(", ")
        });
      } else {
        setRequestFormData(createInitialRequestState);
      }
    } else if (type === "expense") {
      if (mode === "update" && expense) {
        setExpenseFormData({
          title: expense.title || "",
          date: expense.date || "",
          gardenid: expense.gardenid || "",
          req_id: expense.req_id || "",
          points: (expense.points || []).join(", ")
        });
      } else {
        setExpenseFormData(createInitialExpenseState);
      }
    } else if (type === "task") {
      if (mode === "update" && task) {
        setTaskFormData({
          title: task.title || "",
          date: task.date || "",
          gardenid: task.gardenid || "",
          points: (task.points || []).join(", "),
          status: task.status || "not_started"
        });
      } else {
        setTaskFormData(createInitialTaskState);
      }
    }
  }, [isOpen, mode, type, labourer, employee, request, expense, task]);

  const initialLabourerSnapshot = useMemo(() => {
    if (mode !== "update" || !labourer) {
      return null;
    }
    return {
      name: labourer.name || "",
      type: labourer.type || "permanent",
      married_status: labourer.married_status || "false",
      gender: labourer.gender || "male",
      address_details: labourer.address_details || ""
    };
  }, [mode, labourer]);

  const initialEmployeeSnapshot = useMemo(() => {
    if (mode !== "update" || !employee) {
      return null;
    }
    return {
      name: employee.name || "",
      profession: employee.profession || "",
      phone: employee.phone || "",
      gardenid: employee.gardenid || ""
    };
  }, [mode, employee]);

  const initialRequestSnapshot = useMemo(() => {
    if (mode !== "update" || !request) {
      return null;
    }
    return {
      title: request.title || "",
      date: request.date || "",
      gardenid: request.gardenid || "",
      model_name: request.model_name || "labourer",
      ids: (request.ids || []).join(", "),
      points: (request.points || []).join(", ")
    };
  }, [mode, request]);

  const initialExpenseSnapshot = useMemo(() => {
    if (mode !== "update" || !expense) {
      return null;
    }
    return {
      title: expense.title || "",
      date: expense.date || "",
      gardenid: expense.gardenid || "",
      req_id: expense.req_id || "",
      points: (expense.points || []).join(", ")
    };
  }, [mode, expense]);

  const initialTaskSnapshot = useMemo(() => {
    if (mode !== "update" || !task) {
      return null;
    }
    return {
      title: task.title || "",
      date: task.date || "",
      gardenid: task.gardenid || "",
      points: (task.points || []).join(", "),
      status: task.status || "not_started"
    };
  }, [mode, task]);

  const canSubmit = useMemo(() => {
    if (type === "labourer") {
      if (mode === "create") {
        return (
          labourerFormData.name.trim().length > 0 &&
          labourerFormData.gardenid.length > 0 &&
          labourerFormData.address_details.trim().length > 0
        );
      }
      if (!initialLabourerSnapshot) return false;

      const hasNameUpdate =
        labourerFormData.name.trim() !== initialLabourerSnapshot.name &&
        labourerFormData.name.trim().length > 0;
      const hasTypeUpdate = labourerFormData.type !== initialLabourerSnapshot.type;
      const hasMarriedStatusUpdate =
        labourerFormData.married_status !== initialLabourerSnapshot.married_status;
      const hasGenderUpdate = labourerFormData.gender !== initialLabourerSnapshot.gender;
      const hasAddressUpdate =
        labourerFormData.address_details.trim() !==
          initialLabourerSnapshot.address_details &&
        labourerFormData.address_details.trim().length > 0;

      return (
        hasNameUpdate ||
        hasTypeUpdate ||
        hasMarriedStatusUpdate ||
        hasGenderUpdate ||
        hasAddressUpdate
      );
    } else if (type === "employee") {
      if (mode === "create") {
        return (
          employeeFormData.name.trim().length > 0 &&
          employeeFormData.profession.trim().length > 0 &&
          employeeFormData.phone.trim().length > 0 &&
          employeeFormData.gardenid.length > 0
        );
      }
      if (!initialEmployeeSnapshot) return false;

      const hasNameUpdate =
        employeeFormData.name.trim() !== initialEmployeeSnapshot.name &&
        employeeFormData.name.trim().length > 0;
      const hasProfessionUpdate =
        employeeFormData.profession.trim() !== initialEmployeeSnapshot.profession &&
        employeeFormData.profession.trim().length > 0;
      const hasPhoneUpdate =
        employeeFormData.phone.trim() !== initialEmployeeSnapshot.phone &&
        employeeFormData.phone.trim().length > 0;

      return hasNameUpdate || hasProfessionUpdate || hasPhoneUpdate;
    } else if (type === "request") {
      if (mode === "create") {
        return (
          requestFormData.title.trim().length > 0 &&
          requestFormData.date.trim().length > 0 &&
          requestFormData.gardenid.length > 0
        );
      }
      if (!initialRequestSnapshot) return false;
      const hasTitleUpdate =
        requestFormData.title.trim() !== initialRequestSnapshot.title &&
        requestFormData.title.trim().length > 0;
      const hasDateUpdate =
        requestFormData.date !== initialRequestSnapshot.date &&
        requestFormData.date.length > 0;
      const hasModelNameUpdate =
        requestFormData.model_name !== initialRequestSnapshot.model_name;
      const hasIdsUpdate = requestFormData.ids !== initialRequestSnapshot.ids;
      const hasPointsUpdate = requestFormData.points !== initialRequestSnapshot.points;

      return (
        hasTitleUpdate ||
        hasDateUpdate ||
        hasModelNameUpdate ||
        hasIdsUpdate ||
        hasPointsUpdate
      );
    } else if (type === "expense") {
      if (mode === "create") {
        return (
          expenseFormData.title.trim().length > 0 &&
          expenseFormData.date.trim().length > 0 &&
          expenseFormData.gardenid.length > 0
        );
      }
      if (!initialExpenseSnapshot) return false;
      const hasTitleUpdate =
        expenseFormData.title.trim() !== initialExpenseSnapshot.title &&
        expenseFormData.title.trim().length > 0;
      const hasDateUpdate =
        expenseFormData.date !== initialExpenseSnapshot.date &&
        expenseFormData.date.length > 0;
      const hasReqIdUpdate = expenseFormData.req_id !== initialExpenseSnapshot.req_id;
      const hasPointsUpdate = expenseFormData.points !== initialExpenseSnapshot.points;

      return (
        hasTitleUpdate ||
        hasDateUpdate ||
        hasReqIdUpdate ||
        hasPointsUpdate
      );
    } else if (type === "task") {
      if (mode === "create") {
        return (
          taskFormData.title.trim().length > 0 &&
          taskFormData.date.trim().length > 0 &&
          taskFormData.gardenid.length > 0
        );
      }
      if (!initialTaskSnapshot) return false;
      const hasTitleUpdate =
        taskFormData.title.trim() !== initialTaskSnapshot.title &&
        taskFormData.title.trim().length > 0;
      const hasDateUpdate =
        taskFormData.date !== initialTaskSnapshot.date &&
        taskFormData.date.length > 0;
      const hasPointsUpdate = taskFormData.points !== initialTaskSnapshot.points;
      const hasStatusUpdate = taskFormData.status !== initialTaskSnapshot.status;

      return (
        hasTitleUpdate ||
        hasDateUpdate ||
        hasPointsUpdate ||
        hasStatusUpdate
      );
    }
    return false;
  }, [
    type,
    mode,
    labourerFormData,
    initialLabourerSnapshot,
    employeeFormData,
    initialEmployeeSnapshot,
    requestFormData,
    initialRequestSnapshot,
    expenseFormData,
    initialExpenseSnapshot,
    taskFormData,
    initialTaskSnapshot
  ]);

  if (!isOpen) {
    return null;
  }

  const handleLabourerChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setLabourerFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleEmployeeChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setEmployeeFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleRequestChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setRequestFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleExpenseChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setExpenseFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleTaskChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setTaskFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      if (type === "labourer") {
        if (!onCreateLabourer || !onUpdateLabourer) return;

        if (mode === "create") {
          await onCreateLabourer({
            name: labourerFormData.name.trim(),
            type: labourerFormData.type,
            gardenid: labourerFormData.gardenid,
            married_status: labourerFormData.married_status,
            gender: labourerFormData.gender,
            address_details: labourerFormData.address_details.trim()
          });
        } else {
          if (!labourer || !initialLabourerSnapshot) {
            setError("Labourer details are missing.");
            return;
          }
          if (!labourer.labourerid) {
            setError("Labourer id is missing. Please refresh and try again.");
            return;
          }
          const payload: UpdateLabourerRequest = {
            labourerid: labourer.labourerid
          };
          if (
            labourerFormData.name.trim() !== initialLabourerSnapshot.name &&
            labourerFormData.name.trim().length > 0
          ) {
            payload.name = labourerFormData.name.trim();
          }
          if (labourerFormData.type !== initialLabourerSnapshot.type) {
            payload.type = labourerFormData.type;
          }
          if (
            labourerFormData.married_status !== initialLabourerSnapshot.married_status
          ) {
            payload.married_status = labourerFormData.married_status;
          }
          if (labourerFormData.gender !== initialLabourerSnapshot.gender) {
            payload.gender = labourerFormData.gender;
          }
          if (
            labourerFormData.address_details.trim() !==
              initialLabourerSnapshot.address_details &&
            labourerFormData.address_details.trim().length > 0
          ) {
            payload.address_details = labourerFormData.address_details.trim();
          }
          await onUpdateLabourer(payload);
        }
      } else if (type === "employee") {
        if (!onCreateEmployee || !onUpdateEmployee) return;

        if (mode === "create") {
          await onCreateEmployee({
            name: employeeFormData.name.trim(),
            profession: employeeFormData.profession.trim(),
            phone: employeeFormData.phone.trim(),
            gardenid: employeeFormData.gardenid
          });
        } else {
          if (!employee || !initialEmployeeSnapshot) {
            setError("Employee details are missing.");
            return;
          }
          const payload: UpdateEmployeeRequest = {
            employeeid: employee.employeeid,
            gardenid: employee.gardenid,
            name: employee.name,
            profession: employee.profession,
            phone: employee.phone
          };
          payload.name = employeeFormData.name.trim();
          payload.profession = employeeFormData.profession.trim();
          payload.phone = employeeFormData.phone.trim();

          await onUpdateEmployee(payload);
        }
      } else if (type === "request") {
        if (!onCreateRequest || !onUpdateRequest) return;

        const ids = requestFormData.ids.split(",").map((id) => id.trim()).filter((id) => id.length > 0);
        const points = requestFormData.points.split(",").map((p) => p.trim()).filter((p) => p.length > 0);

        if (mode === "create") {
          await onCreateRequest({
            requestid: "", // Let backend assign
            title: requestFormData.title.trim(),
            date: requestFormData.date,
            gardenid: requestFormData.gardenid,
            model_name: requestFormData.model_name,
            ids: ids,
            points: points,
            status: "under_review"
          });
        } else {
          if (!request || !initialRequestSnapshot) {
             setError("Request details are missing.");
             return;
          }
          const payload: MaintenanceRequest = {
            requestid: request.requestid,
            title: requestFormData.title.trim(),
            date: requestFormData.date,
            gardenid: request.gardenid,
            model_name: requestFormData.model_name,
            ids: ids,
            points: points,
            status: request.status
          };
          await onUpdateRequest(payload);
        }
      } else if (type === "expense") {
        if (!onCreateExpense || !onUpdateExpense) return;

        const points = expenseFormData.points.split(",").map((p) => p.trim()).filter((p) => p.length > 0);

        if (mode === "create") {
          await onCreateExpense({
            expenseid: "",
            gardenid: expenseFormData.gardenid,
            date: expenseFormData.date,
            title: expenseFormData.title.trim(),
            req_id: expenseFormData.req_id.trim() || null,
            points: points,
            status: "unpaid"
          });
        } else {
          if (!expense || !initialExpenseSnapshot) {
             setError("Expense details are missing.");
             return;
          }
          const payload: Expense = {
            expenseid: expense.expenseid,
            gardenid: expense.gardenid,
            date: expenseFormData.date,
            title: expenseFormData.title.trim(),
            req_id: expenseFormData.req_id.trim() || null,
            points: points,
            status: expense.status
          };
          await onUpdateExpense(payload);
        }
      } else if (type === "task") {
        if (!onCreateTask || !onUpdateTask) return;

        const points = taskFormData.points.split(",").map((p) => p.trim()).filter((p) => p.length > 0);

        if (mode === "create") {
          await onCreateTask({
            gardenid: taskFormData.gardenid,
            title: taskFormData.title.trim(),
            date: taskFormData.date,
            points: points,
            status: "not_started"
          });
        } else {
          if (!task || !initialTaskSnapshot) {
             setError("Task details are missing.");
             return;
          }
          const payload: UpdateTaskRequest = {
            taskid: task.taskid,
            gardenid: task.gardenid,
            title: taskFormData.title.trim(),
            date: taskFormData.date,
            points: points,
            status: taskFormData.status
          };
          await onUpdateTask(payload);
        }
      }
    } catch (submitError) {
      setError((submitError as Error).message || "Failed to submit form.");
    }
  };

  const renderLabourerForm = () => (
    <>
      <label className="field-label">
        Name
        <input
          className="field-input"
          name="name"
          value={labourerFormData.name}
          onChange={handleLabourerChange}
          placeholder="Enter labourer name"
        />
      </label>

      <label className="field-label">
        Type
        <select
          className="field-input"
          name="type"
          value={labourerFormData.type}
          onChange={handleLabourerChange}
        >
          <option value="permanent">Permanent</option>
          <option value="casual">Casual</option>
          {mode === "update" && <option value="temporary">Temporary</option>}
        </select>
      </label>

      {mode === "create" && (
        <label className="field-label">
          Garden
          <select
            className="field-input"
            name="gardenid"
            value={labourerFormData.gardenid}
            onChange={handleLabourerChange}
          >
            <option value="">Select garden</option>
            {gardens.map((garden) => (
              <option key={garden.gardenid} value={garden.gardenid}>
                {garden.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="field-label">
        Married status
        <select
          className="field-input"
          name="married_status"
          value={labourerFormData.married_status}
          onChange={handleLabourerChange}
        >
          <option value="true">Married</option>
          <option value="false">Unmarried / Widowed</option>
        </select>
      </label>

      <label className="field-label">
        Gender
        <select
          className="field-input"
          name="gender"
          value={labourerFormData.gender}
          onChange={handleLabourerChange}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label className="field-label">
        Address details
        <textarea
          className="field-input"
          name="address_details"
          value={labourerFormData.address_details}
          onChange={handleLabourerChange}
          rows={3}
          placeholder="Enter address details"
        />
      </label>
    </>
  );

  const renderEmployeeForm = () => (
    <>
      <label className="field-label">
        Name
        <input
          className="field-input"
          name="name"
          value={employeeFormData.name}
          onChange={handleEmployeeChange}
          placeholder="Enter employee name"
        />
      </label>

      <label className="field-label">
        Profession
        <input
          className="field-input"
          name="profession"
          value={employeeFormData.profession}
          onChange={handleEmployeeChange}
          placeholder="Enter profession"
        />
      </label>

      <label className="field-label">
        Phone
        <input
          className="field-input"
          name="phone"
          value={employeeFormData.phone}
          onChange={handleEmployeeChange}
          placeholder="Enter phone number"
        />
      </label>

      {mode === "create" && (
        <label className="field-label">
          Garden
          <select
            className="field-input"
            name="gardenid"
            value={employeeFormData.gardenid}
            onChange={handleEmployeeChange}
          >
            <option value="">Select garden</option>
            {gardens.map((garden) => (
              <option key={garden.gardenid} value={garden.gardenid}>
                {garden.name}
              </option>
            ))}
          </select>
        </label>
      )}
    </>
  );

  const renderRequestForm = () => (
    <>
      <label className="field-label">
        Title
        <input
          className="field-input"
          name="title"
          value={requestFormData.title}
          onChange={handleRequestChange}
          placeholder="Enter request title"
        />
      </label>

      <label className="field-label">
        Date
        <input
          className="field-input"
          type="date"
          name="date"
          value={requestFormData.date}
          onChange={handleRequestChange}
        />
      </label>

      {mode === "create" && (
        <label className="field-label">
          Garden
          <select
            className="field-input"
            name="gardenid"
            value={requestFormData.gardenid}
            onChange={handleRequestChange}
          >
            <option value="">Select garden</option>
            {gardens.map((garden) => (
              <option key={garden.gardenid} value={garden.gardenid}>
                {garden.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="field-label">
        Model Name
        <select
          className="field-input"
          name="model_name"
          value={requestFormData.model_name}
          onChange={handleRequestChange}
        >
          <option value="labourer">Labourer</option>
          <option value="garden">Garden</option>
          {/* Add other models if needed */}
        </select>
      </label>

      <label className="field-label">
        IDs (comma separated)
        <input
          className="field-input"
          name="ids"
          value={requestFormData.ids}
          onChange={handleRequestChange}
          placeholder="e.g. id1, id2"
        />
      </label>

      <label className="field-label">
        Points (comma separated)
        <textarea
          className="field-input"
          name="points"
          value={requestFormData.points}
          onChange={handleRequestChange}
          rows={3}
          placeholder="e.g. Check pump, Replace parts"
        />
      </label>
    </>
  );

  const renderExpenseForm = () => (
    <>
      <label className="field-label">
        Title
        <input
          className="field-input"
          name="title"
          value={expenseFormData.title}
          onChange={handleExpenseChange}
          placeholder="Enter expense title"
        />
      </label>

      <label className="field-label">
        Date
        <input
          className="field-input"
          type="date"
          name="date"
          value={expenseFormData.date}
          onChange={handleExpenseChange}
        />
      </label>

      {mode === "create" && (
        <label className="field-label">
          Garden
          <select
            className="field-input"
            name="gardenid"
            value={expenseFormData.gardenid}
            onChange={handleExpenseChange}
          >
            <option value="">Select garden</option>
            {gardens.map((garden) => (
              <option key={garden.gardenid} value={garden.gardenid}>
                {garden.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="field-label">
        Request ID (optional)
        <input
          className="field-input"
          name="req_id"
          value={expenseFormData.req_id}
          onChange={handleExpenseChange}
          placeholder="Enter request ID"
        />
      </label>

      <label className="field-label">
        Items/Points (comma separated)
        <textarea
          className="field-input"
          name="points"
          value={expenseFormData.points}
          onChange={handleExpenseChange}
          rows={3}
          placeholder="e.g. Item 1, Item 2"
        />
      </label>
    </>
  );

  const renderTaskForm = () => (
    <>
      <label className="field-label">
        Title
        <input
          className="field-input"
          name="title"
          value={taskFormData.title}
          onChange={handleTaskChange}
          placeholder="Enter task title"
        />
      </label>

      <label className="field-label">
        Date
        <input
          className="field-input"
          type="date"
          name="date"
          value={taskFormData.date}
          onChange={handleTaskChange}
        />
      </label>

      {mode === "create" && (
        <label className="field-label">
          Garden
          <select
            className="field-input"
            name="gardenid"
            value={taskFormData.gardenid}
            onChange={handleTaskChange}
          >
            <option value="">Select garden</option>
            {gardens.map((garden) => (
              <option key={garden.gardenid} value={garden.gardenid}>
                {garden.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {mode === "update" && (
        <label className="field-label">
          Status
          <select
            className="field-input"
            name="status"
            value={taskFormData.status}
            onChange={handleTaskChange}
          >
            <option value="not_started">Not Started</option>
            <option value="under_progress">Under Progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>
      )}

      <label className="field-label">
        Points/Steps (comma separated)
        <textarea
          className="field-input"
          name="points"
          value={taskFormData.points}
          onChange={handleTaskChange}
          rows={3}
          placeholder="e.g. Step 1, Step 2"
        />
      </label>
    </>
  );

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${type} form`}
    >
      <div className="modal-card">
        <div className="panel-header">
          <h2 className="panel-title">
            {mode === "create" ? `Create ${type}` : `Update ${type}`}
          </h2>
          <button type="button" className="link-button" onClick={onClose}>
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {type === "labourer"
            ? renderLabourerForm()
            : type === "employee"
            ? renderEmployeeForm()
            : type === "request"
            ? renderRequestForm()
            : type === "expense"
            ? renderExpenseForm()
            : renderTaskForm()}

          {error && <p className="field-error">{error}</p>}

          <button
            className="primary-button"
            type="submit"
            disabled={isSubmitting || !canSubmit}
          >
            {isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
                ? `Create ${type}`
                : `Update ${type}`}
          </button>
        </form>
      </div>
    </div>
  );
};
