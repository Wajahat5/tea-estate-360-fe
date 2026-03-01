const fs = require('fs');

const path = 'src/pages/LabourersPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find the insertion point before return (
const insertionPoint = content.indexOf('return (');

const payrollLogic = `
  const handleFetchPayroll = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await apiService.earnings.batchFetch({
        gardenid,
        year: payrollYear,
        month: payrollMonth,
        part: payrollPart,
        labourers: labourers.map(l => l.labourerid)
      });

      const newData: Record<string, { total_earned: number; status: "paid" | "unpaid" | "-" }> = {};
      if (resp && resp.data) {
        resp.data.forEach((item: any) => {
          newData[item.labourerid] = { total_earned: item.total_earned, status: item.status || "unpaid" };
        });
      }

      setPayrollData(newData);
      setSuccessMessage("Payroll fetched successfully");
    } catch (err) {
      setError((err as Error).message || "Failed to fetch payroll");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async () => {
    if (selectedLabourerIds.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      await apiService.earnings.addPayment({
        gardenid,
        year: payrollYear,
        month: payrollMonth,
        part: payrollPart,
        labourerids: selectedLabourerIds
      });
      setSuccessMessage("Payments added successfully");
      await handleFetchPayroll();
    } catch (err) {
      setError((err as Error).message || "Failed to add payment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async () => {
    if (selectedLabourerIds.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      await apiService.earnings.deletePayment({
        gardenid,
        year: payrollYear,
        month: payrollMonth,
        part: payrollPart,
        labourerids: selectedLabourerIds
      });
      setSuccessMessage("Payments deleted successfully");
      await handleFetchPayroll();
    } catch (err) {
      setError((err as Error).message || "Failed to delete payment");
    } finally {
      setLoading(false);
    }
  };

`;

content = content.slice(0, insertionPoint) + payrollLogic + content.slice(insertionPoint);

fs.writeFileSync(path, content);
