import { Fragment } from "react";
import { toggleCompanyExpanded } from "../store/companiesSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

export const CompaniesPage = () => {
  const dispatch = useAppDispatch();
  const { items: companies, loading, error } = useAppSelector(
    (state) => state.companies
  );
  const expandedCompanyIds = useAppSelector(
    (state) => state.companies.expandedCompanyIds
  );

  if (loading) {
    return <p>Loading companies...</p>;
  }

  return (
    <div>
      <h1 className="page-title">Companies</h1>
      {error && <p className="field-error">{error}</p>}
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">All companies</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Pincode</th>
              <th>Daily Wage</th>
              <th>Gardens</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => {
              const isExpanded = !!expandedCompanyIds[company.companyid];
              return (
                <Fragment key={company.companyid}>
                  <tr>
                    <td>{company.name}</td>
                    <td>
                      {company.district}, {company.state}
                    </td>
                    <td>{company.pincode}</td>
                    <td>Rs {company.labourer_daily_wage}</td>
                    <td>{company.gardens.length}</td>
                    <td>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() =>
                          dispatch(toggleCompanyExpanded(company.companyid))
                        }
                      >
                        {isExpanded ? "Hide Gardens" : "Show Gardens"}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={6}>
                        {company.gardens.length === 0 ? (
                          <p>No gardens found for this company.</p>
                        ) : (
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Garden Name</th>
                                <th>Location</th>
                                <th>Pincode</th>
                              </tr>
                            </thead>
                            <tbody>
                              {company.gardens.map((garden) => (
                                <tr key={garden.gardenid}>
                                  <td>{garden.name}</td>
                                  <td>
                                    {garden.district}, {garden.state}
                                  </td>
                                  <td>{garden.pincode}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
