import { useState } from "react";

export const AuctionPage = () => {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Tea Auction Lifecycle</h1>
        <p className="page-subtitle">Manage factory outputs, tea lots, and auction results.</p>
      </header>

      <div className="panel mb-6">
        <div className="panel-header">
          <h2 className="panel-title">Tea Lots</h2>
          <button className="button button-primary">Create Lot</button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Lot Number</th>
              <th>Invoice No</th>
              <th>Grade</th>
              <th>Weight (Kg)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="text-center py-8 text-gray-500">
                No lots found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Auction Results</h2>
          <button className="button button-primary">Add Result</button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Sub Lot Code</th>
              <th>Buyer ID</th>
              <th>Price/Kg</th>
              <th>Sold Weight (Kg)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="text-center py-8 text-gray-500">
                No auction results found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
