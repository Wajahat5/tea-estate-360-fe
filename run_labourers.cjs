const fs = require('fs');
let content = fs.readFileSync('src/pages/LabourersPage.tsx', 'utf8');

if (!content.includes('UNVERIFIED_HIGH_WEIGHT')) {
const lockCycleMethod = `
  const handleLockPayrollCycle = async () => {
    if (!selectedCompanyId || !payrollYMP) return alert("Select company and Month/Year");
    try {
      await apiService.payroll.lockCycle({
        companyId: selectedCompanyId,
        cycleId: payrollYMP, // use YMP as basic cycleId for this ui prototype
        ymp: payrollYMP
      });
      alert("Payroll cycle locked successfully!");
    } catch (err: any) {
      dispatch(setError(err.message));
    }
  };

  const [weighmentEvents, setWeighmentEvents] = useState<any[]>([]);
  useEffect(() => {
    if (activeTab === "attendance") {
      apiService.weighment.getEvents().then(res => setWeighmentEvents(res)).catch(() => {});
    }
  }, [activeTab]);
`;

content = content.replace('const [isFetchingAttendance, setIsFetchingAttendance] = useState(false);', lockCycleMethod + '\n  const [isFetchingAttendance, setIsFetchingAttendance] = useState(false);');

const alertUI = `
            {weighmentEvents && weighmentEvents.length > 0 && (
              <div style={{ background: '#ffebee', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#c62828' }}>UNVERIFIED HIGH WEIGHT ALERTS</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#b71c1c' }}>
                  {weighmentEvents.filter((e: any) => e.status === 'UNVERIFIED_HIGH_WEIGHT').map((e: any) => (
                    <li key={e.id}>Weight {e.weightKg}kg flagged for {e.labourerId} at {e.timestamp}</li>
                  ))}
                </ul>
              </div>
            )}
`;

content = content.replace('{/* ATTENDANCE TAB */}', '{/* ATTENDANCE TAB */}\n' + alertUI);

const lockBtn = `
                <button
                  type="button"
                  className="button button-primary"
                  onClick={handleLockPayrollCycle}
                  style={{ marginLeft: '10px', background: '#d32f2f' }}
                >
                  🔒 Lock Cycle
                </button>
`;

content = content.replace('Fetch Earnings\n                </button>', 'Fetch Earnings\n                </button>' + lockBtn);

fs.writeFileSync('src/pages/LabourersPage.tsx', content);
}
