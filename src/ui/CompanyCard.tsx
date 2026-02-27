import { useState } from "react";
import type { CompanyListItem } from "../types/api";

type CompanyCardProps = {
  company: CompanyListItem;
  onEdit: (company: CompanyListItem) => void;
  onEditGarden: (gardenid: string) => void;
  onCreateGarden: (companyid: string) => void;
};

export const CompanyCard = ({
  company,
  onEdit,
  onEditGarden,
  onCreateGarden
}: CompanyCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="company-card">
      <div className="company-card-header">
        <div className="company-image-container">
          {company.image ? (
            <img src={company.image} alt={company.name} className="company-image" />
          ) : (
            <div className="company-initials">{getInitials(company.name)}</div>
          )}
        </div>
        <button
          className="icon-action-button company-edit-button"
          onClick={() => onEdit(company)}
          title="Edit Company"
        >
          📝
        </button>
      </div>

      <div className="company-content">
        <h3 className="company-name">{company.name}</h3>
        <p className="company-location">
          {company.district}, {company.state} - {company.pincode}
        </p>

        <div className="company-stats-grid">
          <div className="stat-item">
            <span className="stat-label">Daily Wage</span>
            <span className="stat-value">₹{company.labourer_daily_wage}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Wage / kg</span>
            <span className="stat-value">₹{company.labourer_extrawage_per_kg}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Wage / hr</span>
            <span className="stat-value">₹{company.labourer_extrawage_per_hr}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Gardens</span>
            <span className="stat-value">{company.gardens.length}</span>
          </div>
        </div>

        <div className="accordion-section">
          <button
            className={`accordion-toggle ${isExpanded ? "active" : ""}`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span>Gardens ({company.gardens.length})</span>
            <span className="accordion-icon">{isExpanded ? "▲" : "▼"}</span>
          </button>

          {isExpanded && (
            <div className="accordion-content">
              <div className="gardens-actions">
                <button
                  className="secondary-button sm-button full-width"
                  onClick={() => onCreateGarden(company.companyid)}
                >
                  + Add New Garden
                </button>
              </div>

              {company.gardens.length === 0 ? (
                <p className="no-gardens-text">No gardens added yet.</p>
              ) : (
                <ul className="gardens-list">
                  {company.gardens.map((garden) => (
                    <li key={garden.gardenid} className="garden-list-item">
                      <div className="garden-info">
                        <span className="garden-name">{garden.name}</span>
                        <span className="garden-subtext">
                          {garden.district}
                        </span>
                      </div>
                      <button
                        className="icon-action-button sm-icon"
                        onClick={() => onEditGarden(garden.gardenid)}
                        title="Edit Garden"
                      >
                        📝
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
