const fs = require('fs');

const path = 'src/pages/LabourersPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find the insertion point before return (
const insertionPoint = content.indexOf('return (');

const attendanceLogic = `
  const handleFetchAttendance = async () => {
    if (!attendanceDate) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await apiService.earnings.fetchAttendance({
        gardenid,
        date: attendanceDate
      });

      const newInputs: Record<string, { extra: string; type: string }> = {};
      const newPresence: Record<string, string> = {};

      if (resp && resp.data) {
        resp.data.forEach(item => {
          newPresence[item.labourerid] = item.status;
          newInputs[item.labourerid] = { extra: item.extra.toString(), type: item.type };
        });
      }

      setAttendanceInputs(newInputs);
      setAttendancePresence(newPresence);
      setSuccessMessage("Attendance fetched successfully");
    } catch (err) {
      setError((err as Error).message || "Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttendance = async () => {
    if (!attendanceDate || selectedLabourerIds.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const data = selectedLabourerIds.map(id => ({
        labourerid: id,
        status: attendancePresence[id] || "present",
        extra: Number(attendanceInputs[id]?.extra || 0),
        type: attendanceInputs[id]?.type || "hr"
      }));

      await apiService.earnings.addAttendance({
        gardenid,
        date: attendanceDate,
        data
      });
      setSuccessMessage("Attendance added successfully");
    } catch (err) {
      setError((err as Error).message || "Failed to add attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAttendance = async () => {
    if (!attendanceDate || selectedLabourerIds.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const data = selectedLabourerIds.map(id => ({
        labourerid: id,
        status: attendancePresence[id] || "present",
        extra: Number(attendanceInputs[id]?.extra || 0),
        type: attendanceInputs[id]?.type || "hr"
      }));

      await apiService.earnings.updateAttendance({
        gardenid,
        date: attendanceDate,
        data
      });
      setSuccessMessage("Attendance updated successfully");
    } catch (err) {
      setError((err as Error).message || "Failed to update attendance");
    } finally {
      setLoading(false);
    }
  };

`;

content = content.slice(0, insertionPoint) + attendanceLogic + content.slice(insertionPoint);

fs.writeFileSync(path, content);
