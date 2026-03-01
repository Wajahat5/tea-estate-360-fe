const fs = require('fs');

const path = 'src/pages/LabourersPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find insertion point before <FormModal
const insertionPoint = content.indexOf('<FormModal');

const payrollUI = `
      {labourers.length > 0 && activeTab === "payrole" && (
        <div className="panel request-group-panel">
          <div className="panel-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select className="field-input" value={payrollYear} onChange={e => setPayrollYear(e.target.value)} style={{ margin: 0 }}>
                {Array.from({length: 5}, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select className="field-input" value={payrollMonth} onChange={e => setPayrollMonth(e.target.value)} style={{ margin: 0 }}>
                {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <select className="field-input" value={payrollPart} onChange={e => setPayrollPart(e.target.value as "1" | "2")} style={{ margin: 0 }}>
                <option value="1">1st Part</option>
                <option value="2">2nd Part</option>
              </select>
              <button className="primary-button" onClick={handleFetchPayroll} disabled={loading}>
                Fetch
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="primary-button" onClick={handleAddPayment} disabled={loading || selectedLabourerIds.length === 0}>
                Add Payment
              </button>
              <button className="primary-button" onClick={handleDeletePayment} disabled={loading || selectedLabourerIds.length === 0} style={{ backgroundColor: '#ef4444' }}>
                Delete Payment
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLabourerIds(labourers.map(l => l.labourerid));
                        } else {
                          setSelectedLabourerIds([]);
                        }
                      }}
                      checked={selectedLabourerIds.length > 0 && selectedLabourerIds.length === labourers.length}
                    />
                  </th>
                  <th>Name</th>
                  <th>Total Earned</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {labourers.map((l) => (
                  <tr key={l.labourerid}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedLabourerIds.includes(l.labourerid)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLabourerIds(prev => [...prev, l.labourerid]);
                          } else {
                            setSelectedLabourerIds(prev => prev.filter(id => id !== l.labourerid));
                          }
                        }}
                      />
                    </td>
                    <td>{l.name}</td>
                    <td>{payrollData[l.labourerid]?.total_earned || 0}</td>
                    <td>
                      <span className={\`status-badge \${payrollData[l.labourerid]?.status === 'paid' ? 'status-paid' : 'status-unpaid'}\`}>
                        {payrollData[l.labourerid]?.status || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

`;

content = content.slice(0, insertionPoint) + payrollUI + content.slice(insertionPoint);

fs.writeFileSync(path, content);
