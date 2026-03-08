import React, { useState, useEffect } from "react";
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
        <button className={`tab-btn ${activeTab === "factory-output" ? "active" : ""}`} onClick={() => setActiveTab("factory-output")}>Factory Output</button>
        <button className={`tab-btn ${activeTab === "tea-lots" ? "active" : ""}`} onClick={() => setActiveTab("tea-lots")}>Tea Lots</button>
        <button className={`tab-btn ${activeTab === "auction-results" ? "active" : ""}`} onClick={() => setActiveTab("auction-results")}>Auction Results</button>
        <button className={`tab-btn ${activeTab === "buyers" ? "active" : ""}`} onClick={() => setActiveTab("buyers")}>Buyers</button>
        <button className={`tab-btn ${activeTab === "payments" ? "active" : ""}`} onClick={() => setActiveTab("payments")}>Payments</button>
        <button className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`} onClick={() => setActiveTab("analytics")}>Analytics</button>
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
