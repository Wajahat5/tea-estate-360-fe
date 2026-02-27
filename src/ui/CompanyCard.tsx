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

      <div className="company-details">
        <h3 className="company-name">{company.name}</h3>
        <div className="company-info-row">
          <span className="info-label">Location:</span>
          <span className="info-value">
            {company.district}, {company.state}
          </span>
        </div>
        <div className="company-info-row">
          <span className="info-label">Pincode:</span>
          <span className="info-value">{company.pincode}</span>
        </div>
        <div className="company-info-row">
          <span className="info-label">Daily Wage:</span>
          <span className="info-value">Rs {company.labourer_daily_wage}</span>
        </div>
        <div className="company-info-row">
          <span className="info-label">Wage / kg:</span>
          <span className="info-value">
            Rs {company.labourer_extrawage_per_kg}
          </span>
        </div>
        <div className="company-info-row">
          <span className="info-label">Wage / hr:</span>
          <span className="info-value">
            Rs {company.labourer_extrawage_per_hr}
          </span>
        </div>
      </div>

      <div className="company-gardens-section">
        <button
          className="expand-gardens-button"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Hide Gardens" : `Show Gardens (${company.gardens.length})`}
          <span className={`arrow ${isExpanded ? "up" : "down"}`}>▼</span>
        </button>

        {isExpanded && (
          <div className="gardens-list">
            <div className="gardens-header">
              <h4>Gardens</h4>
              <button
                className="secondary-button sm-button"
                onClick={() => onCreateGarden(company.companyid)}
              >
                + Add Garden
              </button>
            </div>
            {company.gardens.length === 0 ? (
              <p className="no-gardens-text">No gardens found.</p>
            ) : (
              <div className="gardens-grid">
                {company.gardens.map((garden) => (
                  <div key={garden.gardenid} className="garden-item">
                    <div className="garden-info">
                      <span className="garden-name">{garden.name}</span>
                      <span className="garden-location">
                        {garden.district}, {garden.state} - {garden.pincode}
                      </span>
                    </div>
                    <button
                      className="icon-action-button sm-icon"
                      onClick={() => onEditGarden(garden.gardenid)}
                      title="Edit Garden"
                    >
                      📝
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
