const fs = require('fs');

const path = 'src/pages/LabourersPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find insertion point before <FormModal
const insertionPoint = content.indexOf('<FormModal');

const attendanceUI = `
      {labourers.length > 0 && activeTab === "attendance" && (
        <div className="panel request-group-panel">
          <div className="panel-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label className="field-label" style={{ marginBottom: 0 }}>
                Date:
                <input
                  type="date"
                  className="field-input"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  style={{ marginLeft: '8px', marginBottom: 0 }}
                />
              </label>
              <button className="primary-button" onClick={handleFetchAttendance} disabled={loading || !attendanceDate}>
                Fetch
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="primary-button" onClick={handleAddAttendance} disabled={loading || selectedLabourerIds.length === 0}>
                Add Selected
              </button>
              <button className="primary-button" onClick={handleUpdateAttendance} disabled={loading || selectedLabourerIds.length === 0}>
                Update Selected
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
                  <th>Presence</th>
                  <th>Extra</th>
                  <th>Type</th>
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
                    <td>
                      <select
                        className="field-input"
                        style={{ margin: 0, padding: '4px 8px' }}
                        value={attendancePresence[l.labourerid] || "-"}
                        onChange={(e) => setAttendancePresence(prev => ({ ...prev, [l.labourerid]: e.target.value }))}
                      >
                        <option value="-">-</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="field-input"
                        style={{ margin: 0, padding: '4px 8px', width: '80px' }}
                        value={attendanceInputs[l.labourerid]?.extra || ""}
                        onChange={(e) => setAttendanceInputs(prev => ({
                          ...prev,
                          [l.labourerid]: { ...prev[l.labourerid], extra: e.target.value, type: prev[l.labourerid]?.type || "hr" }
                        }))}
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <select
                        className="field-input"
                        style={{ margin: 0, padding: '4px 8px' }}
                        value={attendanceInputs[l.labourerid]?.type || "hr"}
                        onChange={(e) => setAttendanceInputs(prev => ({
                          ...prev,
                          [l.labourerid]: { ...prev[l.labourerid], type: e.target.value, extra: prev[l.labourerid]?.extra || "" }
                        }))}
                      >
                        <option value="hr">hr</option>
                        <option value="kg">kg</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

`;

content = content.slice(0, insertionPoint) + attendanceUI + content.slice(insertionPoint);

fs.writeFileSync(path, content);
