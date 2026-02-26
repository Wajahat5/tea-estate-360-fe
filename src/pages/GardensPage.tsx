import { useEffect, useState } from "react";
import { apiService } from "../services/apiService";
import type { Garden } from "../types/api";

export const GardensPage = () => {
  const [gardens, setGardens] = useState<Garden[]>([]);

  useEffect(() => {
    apiService.garden.list().then(setGardens);
  }, []);

  return (
    <div>
      <h1 className="page-title">Tea Gardens</h1>
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">All gardens</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Location</th>
              <th>Pincode</th>
            </tr>
          </thead>
          <tbody>
            {gardens.map((g) => {
              const company = companiesById[g.companyid];
              return (
                <tr key={g.gardenid}>
                  <td>{g.name}</td>
                  <td>{company?.name ?? "-"}</td>
                  <td>
                    {g.district}, {g.state}
                  </td>
                  <td>{g.pincode}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const companiesById: Record<string, { name: string }> = {
  "6011c7b575326918c46a817f": { name: "TeaEstate360 Pvt Ltd" }
};
