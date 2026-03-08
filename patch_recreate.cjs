const fs = require('fs');
fs.writeFileSync('src/pages/SettingsPage.tsx', `import React, { useState } from "react";
import { apiService } from "../services/apiService";
import { useAppDispatch } from "../store/hooks";
import { setError } from "../store/errorSlice";

export const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [govtWage, setGovtWage] = useState({ year: new Date().getFullYear(), dailyWage: "", extraWageKg: "", extraWageHr: "" });
  const [holiday, setHoliday] = useState({ date: "", description: "" });
  const [isSubmittingWage, setIsSubmittingWage] = useState(false);
  const [isSubmittingHoliday, setIsSubmittingHoliday] = useState(false);

  const handleWageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingWage(true);
    try {
      await apiService.admin.setGovtWage({
        year: Number(govtWage.year),
        dailyWage: Number(govtWage.dailyWage),
        extraWageKg: Number(govtWage.extraWageKg),
        extraWageHr: Number(govtWage.extraWageHr)
      });
      alert("Govt Wages updated successfully!");
    } catch (error: any) {
      dispatch(setError(error.message));
    } finally {
      setIsSubmittingWage(false);
    }
  };

  const handleHolidaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingHoliday(true);
    try {
      await apiService.admin.addHoliday({
        date: holiday.date,
        description: holiday.description
      });
      alert("Holiday added successfully!");
      setHoliday({ date: "", description: "" });
    } catch (error: any) {
      dispatch(setError(error.message));
    } finally {
      setIsSubmittingHoliday(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Admin Settings</h1>
      </div>

      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3>Govt Wages</h3>
        <form onSubmit={handleWageSubmit} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <div>
            <label className="form-label">Year</label>
            <input type="number" className="form-input" value={govtWage.year} onChange={(e) => setGovtWage({ ...govtWage, year: Number(e.target.value) })} required />
          </div>
          <div>
            <label className="form-label">Daily Wage (₹)</label>
            <input type="number" step="0.01" className="form-input" value={govtWage.dailyWage} onChange={(e) => setGovtWage({ ...govtWage, dailyWage: e.target.value })} required />
          </div>
          <div>
            <label className="form-label">Extra Wage / Kg (₹)</label>
            <input type="number" step="0.01" className="form-input" value={govtWage.extraWageKg} onChange={(e) => setGovtWage({ ...govtWage, extraWageKg: e.target.value })} required />
          </div>
          <div>
            <label className="form-label">Extra Wage / Hr (₹)</label>
            <input type="number" step="0.01" className="form-input" value={govtWage.extraWageHr} onChange={(e) => setGovtWage({ ...govtWage, extraWageHr: e.target.value })} required />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button type="submit" className="button button-primary" disabled={isSubmittingWage}>
              {isSubmittingWage ? "Saving..." : "Save Wages"}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Holidays</h3>
        <form onSubmit={handleHolidaySubmit} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <div>
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={holiday.date} onChange={(e) => setHoliday({ ...holiday, date: e.target.value })} required />
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label className="form-label">Description</label>
            <input type="text" className="form-input" value={holiday.description} onChange={(e) => setHoliday({ ...holiday, description: e.target.value })} required />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button type="submit" className="button button-primary" disabled={isSubmittingHoliday}>
              {isSubmittingHoliday ? "Adding..." : "Add Holiday"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
`);

fs.writeFileSync('src/pages/AuctionPage.tsx', `import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { apiService } from "../services/apiService";
import { setError } from "../store/errorSlice";

export const AuctionPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const companies = useAppSelector((state) => state.companies.items);

  const gardens = user?.gardens && user.gardens.length > 0
    ? user.gardens.map(g => ({ gardenid: g.gardenid, name: (g as any).name || g.gardenid }))
    : companies
      .filter((company) => company.ownerid === user?.userid)
      .flatMap((company) => company.gardens);

  const uniqueGardens = new Map<string, { gardenid: string; name: string }>();
  gardens.forEach((garden) => {
      uniqueGardens.set(garden.gardenid, {
        gardenid: garden.gardenid,
        name: garden.name
      });
  });
  const gardenOptions = Array.from(uniqueGardens.values());
  const isGardensLoading = false;

  const [activeTab, setActiveTab] = useState("factory-output");
  const [selectedGardenId, setSelectedGardenId] = useState("");

  const [factoryOutput, setFactoryOutput] = useState({ date: "", greenLeafInput: "", madeTeaOutput: "", gradeClassification: "" });
  const [teaLot, setTeaLot] = useState({ factoryOutputId: "", lotNumber: "", invoiceNo: "", teaGrade: "", totalWeightKg: "", sampleWeightKg: "", productionDate: "" });
  const [auctionResult, setAuctionResult] = useState({ subLotCode: "", buyerId: "", pricePerKg: "", soldWeightKg: "", brokerCommission: "", marketCess: "" });
  const [buyer, setBuyer] = useState({ name: "", contact: "" });
  const [payment, setPayment] = useState({ salesOrderId: "", amountReceived: "", paymentMode: "", referenceNo: "" });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    if (activeTab === "analytics" && selectedGardenId) {
      const fetchAnalytics = async () => {
        try {
          const res = await apiService.auction.analytics(selectedGardenId);
          setAnalyticsData(res);
        } catch (error: any) {
          dispatch(setError(error.message));
        }
      };
      fetchAnalytics();
    }
  }, [activeTab, selectedGardenId, dispatch]);

  const handleFactoryOutputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGardenId) return alert("Select a garden first");
    setIsSubmitting(true);
    try {
      await apiService.auction.factoryOutput({
        gardenId: selectedGardenId,
        date: factoryOutput.date,
        greenLeafInput: Number(factoryOutput.greenLeafInput),
        madeTeaOutput: Number(factoryOutput.madeTeaOutput),
        gradeClassification: factoryOutput.gradeClassification
      });
      alert("Factory output saved!");
      setFactoryOutput({ date: "", greenLeafInput: "", madeTeaOutput: "", gradeClassification: "" });
    } catch (err: any) {
      dispatch(setError(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTeaLotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGardenId) return alert("Select a garden first");
    setIsSubmitting(true);
    try {
      await apiService.auction.addTeaLot({
        gardenId: selectedGardenId,
        factoryOutputId: teaLot.factoryOutputId,
        lotNumber: teaLot.lotNumber,
        invoiceNo: teaLot.invoiceNo,
        teaGrade: teaLot.teaGrade,
        totalWeightKg: Number(teaLot.totalWeightKg),
        sampleWeightKg: Number(teaLot.sampleWeightKg),
        productionDate: teaLot.productionDate
      });
      alert("Tea Lot saved!");
      setTeaLot({ factoryOutputId: "", lotNumber: "", invoiceNo: "", teaGrade: "", totalWeightKg: "", sampleWeightKg: "", productionDate: "" });
    } catch (err: any) {
      dispatch(setError(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuctionResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.auction.addResult({
        subLotCode: auctionResult.subLotCode,
        buyerId: auctionResult.buyerId,
        pricePerKg: Number(auctionResult.pricePerKg),
        soldWeightKg: Number(auctionResult.soldWeightKg),
        brokerCommission: Number(auctionResult.brokerCommission),
        marketCess: Number(auctionResult.marketCess)
      });
      alert("Auction Result saved!");
      setAuctionResult({ subLotCode: "", buyerId: "", pricePerKg: "", soldWeightKg: "", brokerCommission: "", marketCess: "" });
    } catch (err: any) {
      dispatch(setError(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.auction.addBuyer({
        name: buyer.name,
        contact: buyer.contact
      });
      alert("Buyer saved!");
      setBuyer({ name: "", contact: "" });
    } catch (err: any) {
      dispatch(setError(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.auction.addPayment({
        salesOrderId: payment.salesOrderId,
        amountReceived: Number(payment.amountReceived),
        paymentMode: payment.paymentMode,
        referenceNo: payment.referenceNo
      });
      alert("Payment saved!");
      setPayment({ salesOrderId: "", amountReceived: "", paymentMode: "", referenceNo: "" });
    } catch (err: any) {
      dispatch(setError(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isGardensLoading) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Tea Auction Lifecycle</h1>
        <div className="header-actions">
          <select
            className="form-input"
            value={selectedGardenId}
            onChange={(e) => setSelectedGardenId(e.target.value)}
          >
            <option value="">Select Garden</option>
            {gardenOptions.map((g: any) => (
              <option key={g.gardenid} value={g.gardenid}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className={\`tab-btn \${activeTab === "factory-output" ? "active" : ""}\`} onClick={() => setActiveTab("factory-output")}>Factory Output</button>
        <button className={\`tab-btn \${activeTab === "tea-lots" ? "active" : ""}\`} onClick={() => setActiveTab("tea-lots")}>Tea Lots</button>
        <button className={\`tab-btn \${activeTab === "auction-results" ? "active" : ""}\`} onClick={() => setActiveTab("auction-results")}>Auction Results</button>
        <button className={\`tab-btn \${activeTab === "buyers" ? "active" : ""}\`} onClick={() => setActiveTab("buyers")}>Buyers</button>
        <button className={\`tab-btn \${activeTab === "payments" ? "active" : ""}\`} onClick={() => setActiveTab("payments")}>Payments</button>
        <button className={\`tab-btn \${activeTab === "analytics" ? "active" : ""}\`} onClick={() => setActiveTab("analytics")}>Analytics</button>
      </div>

      <div className="card">
        {activeTab === "factory-output" && (
          <div>
            <h3>Add Factory Output</h3>
            <form onSubmit={handleFactoryOutputSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="date" className="form-input" value={factoryOutput.date} onChange={(e) => setFactoryOutput({...factoryOutput, date: e.target.value})} required />
              <input type="number" placeholder="Green Leaf Input (Kg)" className="form-input" value={factoryOutput.greenLeafInput} onChange={(e) => setFactoryOutput({...factoryOutput, greenLeafInput: e.target.value})} required />
              <input type="number" placeholder="Made Tea Output (Kg)" className="form-input" value={factoryOutput.madeTeaOutput} onChange={(e) => setFactoryOutput({...factoryOutput, madeTeaOutput: e.target.value})} required />
              <input type="text" placeholder="Grade Classification" className="form-input" value={factoryOutput.gradeClassification} onChange={(e) => setFactoryOutput({...factoryOutput, gradeClassification: e.target.value})} required />
              <button type="submit" className="button button-primary" disabled={isSubmitting}>Save</button>
            </form>
          </div>
        )}
        {activeTab === "tea-lots" && (
          <div>
            <h3>Add Tea Lot</h3>
            <form onSubmit={handleTeaLotSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="text" placeholder="Factory Output ID" className="form-input" value={teaLot.factoryOutputId} onChange={(e) => setTeaLot({...teaLot, factoryOutputId: e.target.value})} required />
              <input type="text" placeholder="Lot Number" className="form-input" value={teaLot.lotNumber} onChange={(e) => setTeaLot({...teaLot, lotNumber: e.target.value})} required />
              <input type="text" placeholder="Invoice No" className="form-input" value={teaLot.invoiceNo} onChange={(e) => setTeaLot({...teaLot, invoiceNo: e.target.value})} required />
              <input type="text" placeholder="Tea Grade" className="form-input" value={teaLot.teaGrade} onChange={(e) => setTeaLot({...teaLot, teaGrade: e.target.value})} required />
              <input type="number" placeholder="Total Weight (Kg)" className="form-input" value={teaLot.totalWeightKg} onChange={(e) => setTeaLot({...teaLot, totalWeightKg: e.target.value})} required />
              <input type="number" placeholder="Sample Weight (Kg)" className="form-input" value={teaLot.sampleWeightKg} onChange={(e) => setTeaLot({...teaLot, sampleWeightKg: e.target.value})} required />
              <input type="date" className="form-input" value={teaLot.productionDate} onChange={(e) => setTeaLot({...teaLot, productionDate: e.target.value})} required />
              <button type="submit" className="button button-primary" disabled={isSubmitting}>Save</button>
            </form>
          </div>
        )}
        {activeTab === "auction-results" && (
          <div>
            <h3>Add Auction Result</h3>
            <form onSubmit={handleAuctionResultSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="text" placeholder="Sub Lot Code" className="form-input" value={auctionResult.subLotCode} onChange={(e) => setAuctionResult({...auctionResult, subLotCode: e.target.value})} required />
              <input type="text" placeholder="Buyer ID" className="form-input" value={auctionResult.buyerId} onChange={(e) => setAuctionResult({...auctionResult, buyerId: e.target.value})} required />
              <input type="number" placeholder="Price Per Kg" className="form-input" value={auctionResult.pricePerKg} onChange={(e) => setAuctionResult({...auctionResult, pricePerKg: e.target.value})} required />
              <input type="number" placeholder="Sold Weight (Kg)" className="form-input" value={auctionResult.soldWeightKg} onChange={(e) => setAuctionResult({...auctionResult, soldWeightKg: e.target.value})} required />
              <input type="number" placeholder="Broker Commission" className="form-input" value={auctionResult.brokerCommission} onChange={(e) => setAuctionResult({...auctionResult, brokerCommission: e.target.value})} required />
              <input type="number" placeholder="Market Cess" className="form-input" value={auctionResult.marketCess} onChange={(e) => setAuctionResult({...auctionResult, marketCess: e.target.value})} required />
              <button type="submit" className="button button-primary" disabled={isSubmitting}>Save</button>
            </form>
          </div>
        )}
        {activeTab === "buyers" && (
          <div>
            <h3>Add Buyer</h3>
            <form onSubmit={handleBuyerSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="text" placeholder="Buyer Name" className="form-input" value={buyer.name} onChange={(e) => setBuyer({...buyer, name: e.target.value})} required />
              <input type="text" placeholder="Contact Details" className="form-input" value={buyer.contact} onChange={(e) => setBuyer({...buyer, contact: e.target.value})} required />
              <button type="submit" className="button button-primary" disabled={isSubmitting}>Save</button>
            </form>
          </div>
        )}
        {activeTab === "payments" && (
          <div>
            <h3>Add Payment</h3>
            <form onSubmit={handlePaymentSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="text" placeholder="Sales Order ID" className="form-input" value={payment.salesOrderId} onChange={(e) => setPayment({...payment, salesOrderId: e.target.value})} required />
              <input type="number" placeholder="Amount Received" className="form-input" value={payment.amountReceived} onChange={(e) => setPayment({...payment, amountReceived: e.target.value})} required />
              <input type="text" placeholder="Payment Mode" className="form-input" value={payment.paymentMode} onChange={(e) => setPayment({...payment, paymentMode: e.target.value})} required />
              <input type="text" placeholder="Reference No" className="form-input" value={payment.referenceNo} onChange={(e) => setPayment({...payment, referenceNo: e.target.value})} required />
              <button type="submit" className="button button-primary" disabled={isSubmitting}>Save</button>
            </form>
          </div>
        )}

        {activeTab === "analytics" && (
          <div>
            <h3>Analytics View</h3>
            {analyticsData ? (
              <pre style={{ background: "#f4f4f4", padding: "10px", borderRadius: "5px" }}>
                {JSON.stringify(analyticsData, null, 2)}
              </pre>
            ) : (
              <p>Select a garden to load analytics...</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
`);

fs.writeFileSync('src/pages/ExecutiveDashboardPage.tsx', `import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { apiService } from "../services/apiService";
import { setError } from "../store/errorSlice";

export const ExecutiveDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [selectedGardenId, setSelectedGardenId] = useState("");
  const [executiveData, setExecutiveData] = useState<any>(null);
  const [yieldIntelligence, setYieldIntelligence] = useState<any>(null);
  const [costPerKgData, setCostPerKgData] = useState<any>(null);

  const user = useAppSelector((state) => state.auth.user);
  const companies = useAppSelector((state) => state.companies.items);

  const gardens = user?.gardens && user.gardens.length > 0
    ? user.gardens.map(g => ({ gardenid: g.gardenid, name: (g as any).name || g.gardenid }))
    : companies
      .filter((company) => company.ownerid === user?.userid)
      .flatMap((company) => company.gardens);

  const uniqueGardens = new Map<string, { gardenid: string; name: string }>();
  gardens.forEach((garden) => {
      uniqueGardens.set(garden.gardenid, {
        gardenid: garden.gardenid,
        name: garden.name
      });
  });
  const gardenOptions = Array.from(uniqueGardens.values());

  useEffect(() => {
    if (selectedGardenId) {
      const fetchData = async () => {
        try {
          const [execRes, yieldRes, costRes] = await Promise.all([
            (apiService.dashboard as any).executive(selectedGardenId),
            apiService.analytics.teaYieldIntelligence(selectedGardenId),
            apiService.reports.costPerKg(selectedGardenId)
          ]);
          setExecutiveData(execRes);
          setYieldIntelligence(yieldRes);
          setCostPerKgData(costRes);
        } catch (error: any) {
          dispatch(setError(error.message));
        }
      };
      fetchData();
    } else {
      setExecutiveData(null);
      setYieldIntelligence(null);
      setCostPerKgData(null);
    }
  }, [selectedGardenId, dispatch]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Executive Dashboard</h1>
        <div className="header-actions">
          <select
            className="form-input"
            value={selectedGardenId}
            onChange={(e) => setSelectedGardenId(e.target.value)}
          >
            <option value="">Select Garden</option>
            {gardenOptions.map((g) => (
              <option key={g.gardenid} value={g.gardenid}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedGardenId && (
        <div className="card">
          <p>Please select a garden to view the executive dashboard.</p>
        </div>
      )}

      {selectedGardenId && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="card">
            <h3>Executive Summary</h3>
            <pre style={{ background: "#f4f4f4", padding: "10px", borderRadius: "5px" }}>
              {JSON.stringify(executiveData, null, 2)}
            </pre>
          </div>

          <div className="card">
            <h3>Tea Yield Intelligence</h3>
            <pre style={{ background: "#f4f4f4", padding: "10px", borderRadius: "5px" }}>
              {JSON.stringify(yieldIntelligence, null, 2)}
            </pre>
          </div>

          <div className="card" style={{ gridColumn: "span 2" }}>
            <h3>Cost Per Kg Report</h3>
            <pre style={{ background: "#f4f4f4", padding: "10px", borderRadius: "5px" }}>
              {JSON.stringify(costPerKgData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
`);

fs.writeFileSync('src/pages/InventoryPage.tsx', `import React, { useState } from "react";
import { useAppDispatch } from "../store/hooks";
import { apiService } from "../services/apiService";
import { setError } from "../store/errorSlice";

export const InventoryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("items");

  const [item, setItem] = useState({ name: "", category: "", unit: "" });
  const [vendor, setVendor] = useState({ name: "", contact: "" });
  const [issue, setIssue] = useState({ itemId: "", sectionId: "", quantity: "", date: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.inventory.addItem({ name: item.name, category: item.category, unit: item.unit });
      alert("Item added successfully");
      setItem({ name: "", category: "", unit: "" });
    } catch(err: any) {
      dispatch(setError(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.inventory.addVendor({ name: vendor.name, contact: vendor.contact });
      alert("Vendor added successfully");
      setVendor({ name: "", contact: "" });
    } catch(err: any) {
      dispatch(setError(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.inventory.issue({
        itemId: issue.itemId,
        sectionId: issue.sectionId,
        quantity: Number(issue.quantity),
        date: issue.date
      });
      alert("Item issued successfully");
      setIssue({ itemId: "", sectionId: "", quantity: "", date: "" });
    } catch(err: any) {
      dispatch(setError(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Inventory Management</h1>
      </div>

      <div className="tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className={\`tab-btn \${activeTab === "items" ? "active" : ""}\`} onClick={() => setActiveTab("items")}>Items</button>
        <button className={\`tab-btn \${activeTab === "vendors" ? "active" : ""}\`} onClick={() => setActiveTab("vendors")}>Vendors</button>
        <button className={\`tab-btn \${activeTab === "issues" ? "active" : ""}\`} onClick={() => setActiveTab("issues")}>Issues</button>
      </div>

      <div className="card">
        {activeTab === "items" && (
          <div>
            <h3>Add Inventory Item</h3>
            <form onSubmit={handleItemSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="text" placeholder="Item Name" className="form-input" value={item.name} onChange={(e) => setItem({...item, name: e.target.value})} required />
              <input type="text" placeholder="Category" className="form-input" value={item.category} onChange={(e) => setItem({...item, category: e.target.value})} required />
              <input type="text" placeholder="Unit (e.g. Kg, Liters)" className="form-input" value={item.unit} onChange={(e) => setItem({...item, unit: e.target.value})} required />
              <button type="submit" className="button button-primary" disabled={isSubmitting}>Save Item</button>
            </form>
          </div>
        )}

        {activeTab === "vendors" && (
          <div>
            <h3>Add Vendor</h3>
            <form onSubmit={handleVendorSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="text" placeholder="Vendor Name" className="form-input" value={vendor.name} onChange={(e) => setVendor({...vendor, name: e.target.value})} required />
              <input type="text" placeholder="Contact Info" className="form-input" value={vendor.contact} onChange={(e) => setVendor({...vendor, contact: e.target.value})} required />
              <button type="submit" className="button button-primary" disabled={isSubmitting}>Save Vendor</button>
            </form>
          </div>
        )}

        {activeTab === "issues" && (
          <div>
            <h3>Issue Item to Section</h3>
            <form onSubmit={handleIssueSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="text" placeholder="Item ID" className="form-input" value={issue.itemId} onChange={(e) => setIssue({...issue, itemId: e.target.value})} required />
              <input type="text" placeholder="Section ID" className="form-input" value={issue.sectionId} onChange={(e) => setIssue({...issue, sectionId: e.target.value})} required />
              <input type="number" placeholder="Quantity" className="form-input" value={issue.quantity} onChange={(e) => setIssue({...issue, quantity: e.target.value})} required />
              <input type="date" className="form-input" value={issue.date} onChange={(e) => setIssue({...issue, date: e.target.value})} required />
              <button type="submit" className="button button-primary" disabled={isSubmitting}>Issue Item</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
`);

fs.writeFileSync('src/pages/AssetsPage.tsx', `import React, { useState } from "react";
import { useAppDispatch } from "../store/hooks";
import { apiService } from "../services/apiService";
import { setError } from "../store/errorSlice";

export const AssetsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("assets");

  const [asset, setAsset] = useState({ name: "", type: "", purchaseDate: "" });
  const [breakdown, setBreakdown] = useState({ assetId: "", date: "", description: "" });
  const [resolve, setResolve] = useState({ breakdownId: "", cost: "", resolutionDate: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.assets.add({ name: asset.name, type: asset.type, purchaseDate: asset.purchaseDate });
      alert("Asset added successfully");
      setAsset({ name: "", type: "", purchaseDate: "" });
    } catch(err: any) {
      dispatch(setError(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBreakdownSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.assets.addBreakdown({ assetId: breakdown.assetId, date: breakdown.date, description: breakdown.description });
      alert("Breakdown logged successfully");
      setBreakdown({ assetId: "", date: "", description: "" });
    } catch(err: any) {
      dispatch(setError(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.assets.resolveBreakdown({
        breakdownId: resolve.breakdownId,
        cost: Number(resolve.cost),
        resolutionDate: resolve.resolutionDate
      });
      alert("Breakdown resolved successfully");
      setResolve({ breakdownId: "", cost: "", resolutionDate: "" });
    } catch(err: any) {
      dispatch(setError(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Assets & Machinery</h1>
      </div>

      <div className="tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className={\`tab-btn \${activeTab === "assets" ? "active" : ""}\`} onClick={() => setActiveTab("assets")}>Add Asset</button>
        <button className={\`tab-btn \${activeTab === "breakdowns" ? "active" : ""}\`} onClick={() => setActiveTab("breakdowns")}>Log Breakdown</button>
        <button className={\`tab-btn \${activeTab === "resolutions" ? "active" : ""}\`} onClick={() => setActiveTab("resolutions")}>Resolve Breakdown</button>
      </div>

      <div className="card">
        {activeTab === "assets" && (
          <div>
            <h3>Add New Asset / Machine</h3>
            <form onSubmit={handleAssetSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="text" placeholder="Asset Name" className="form-input" value={asset.name} onChange={(e) => setAsset({...asset, name: e.target.value})} required />
              <input type="text" placeholder="Asset Type (e.g. Tractor, Dryer)" className="form-input" value={asset.type} onChange={(e) => setAsset({...asset, type: e.target.value})} required />
              <input type="date" className="form-input" value={asset.purchaseDate} onChange={(e) => setAsset({...asset, purchaseDate: e.target.value})} required />
              <button type="submit" className="button button-primary" disabled={isSubmitting}>Save Asset</button>
            </form>
          </div>
        )}

        {activeTab === "breakdowns" && (
          <div>
            <h3>Log a Breakdown</h3>
            <form onSubmit={handleBreakdownSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="text" placeholder="Asset ID" className="form-input" value={breakdown.assetId} onChange={(e) => setBreakdown({...breakdown, assetId: e.target.value})} required />
              <input type="text" placeholder="Description of problem" className="form-input" value={breakdown.description} onChange={(e) => setBreakdown({...breakdown, description: e.target.value})} required />
              <input type="date" className="form-input" value={breakdown.date} onChange={(e) => setBreakdown({...breakdown, date: e.target.value})} required />
              <button type="submit" className="button button-primary" disabled={isSubmitting}>Log Breakdown</button>
            </form>
          </div>
        )}

        {activeTab === "resolutions" && (
          <div>
            <h3>Resolve a Breakdown</h3>
            <form onSubmit={handleResolveSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="text" placeholder="Breakdown ID" className="form-input" value={resolve.breakdownId} onChange={(e) => setResolve({...resolve, breakdownId: e.target.value})} required />
              <input type="number" placeholder="Repair Cost" className="form-input" value={resolve.cost} onChange={(e) => setResolve({...resolve, cost: e.target.value})} required />
              <input type="date" className="form-input" value={resolve.resolutionDate} onChange={(e) => setResolve({...resolve, resolutionDate: e.target.value})} required />
              <button type="submit" className="button button-primary" disabled={isSubmitting}>Resolve</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
`);
