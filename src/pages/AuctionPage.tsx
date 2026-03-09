import { useState } from "react";
import { apiService } from "../services/apiService";
import { useOwnedGardens } from "../hooks/useOwnedGardens";

export const AuctionPage = () => {
  const gardens = useOwnedGardens();
  const [factoryForm, setFactoryForm] = useState({ gardenId: "", date: "", internalLeafInput: "", boughtLeafInput: "", madeTeaOutput: "", gradeClassification: "" });
  const [lotForm, setLotForm] = useState({ gardenId: "", factoryOutputId: "", lotNumber: "", invoiceNo: "", teaGrade: "", totalWeightKg: "", sampleWeightKg: "", productionDate: "" });
  const [auctionForm, setAuctionForm] = useState({ subLotCode: "", buyerId: "", pricePerKg: "", soldWeightKg: "", brokerCommission: "", marketCess: "", teaLotId: "", auctionCenter: "", brokerName: "", auctionDate: "" });

  const handleFactorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.auction.createFactoryOutput(factoryForm);
      alert("Factory output logged");
    } catch (err) {
      alert("Error logging factory output");
    }
  };

  const handleLotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.auction.createTeaLot(lotForm);
      alert("Tea Lot Created");
    } catch (err) {
      alert("Error creating tea lot");
    }
  };

  const handleAuctionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.auction.createAuctionResult(auctionForm);
      alert("Auction Result Recorded");
    } catch (err) {
      alert("Error recording auction result");
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Tea Auction Lifecycle</h1>
        <p className="page-subtitle">Manage factory outputs, tea lots, and auction results.</p>
      </header>

      <div className="panel mb-6">
        <div className="panel-header">
          <h2 className="panel-title">Factory Output Log</h2>
        </div>
        <form onSubmit={handleFactorySubmit} className="p-4 border-b bg-gray-50 grid grid-cols-2 gap-4">
          <select className="field-input" value={factoryForm.gardenId} onChange={e => setFactoryForm({...factoryForm, gardenId: e.target.value})} required>
            <option value="">Select Garden</option>
            {gardens.map(g => <option key={g.gardenid} value={g.gardenid}>{g.name}</option>)}
          </select>
          <input className="field-input" type="date" required value={factoryForm.date} onChange={e => setFactoryForm({...factoryForm, date: e.target.value})} />
          <input className="field-input" type="number" placeholder="Internal Leaf Input (Kg)" required value={factoryForm.internalLeafInput} onChange={e => setFactoryForm({...factoryForm, internalLeafInput: e.target.value})} />
          <input className="field-input" type="number" placeholder="Bought Leaf Input (Kg)" required value={factoryForm.boughtLeafInput} onChange={e => setFactoryForm({...factoryForm, boughtLeafInput: e.target.value})} />
          <input className="field-input" type="number" placeholder="Made Tea Output (Kg)" required value={factoryForm.madeTeaOutput} onChange={e => setFactoryForm({...factoryForm, madeTeaOutput: e.target.value})} />
          <input className="field-input" placeholder="Grade Classification" required value={factoryForm.gradeClassification} onChange={e => setFactoryForm({...factoryForm, gradeClassification: e.target.value})} />
          <div className="col-span-2 flex justify-end">
            <button type="submit" className="primary-button">Save Output</button>
          </div>
        </form>
      </div>

      <div className="panel mb-6">
        <div className="panel-header">
          <h2 className="panel-title">Create Tea Lot</h2>
        </div>
        <form onSubmit={handleLotSubmit} className="p-4 border-b bg-gray-50 grid grid-cols-2 gap-4">
          <select className="field-input" value={lotForm.gardenId} onChange={e => setLotForm({...lotForm, gardenId: e.target.value})} required>
            <option value="">Select Garden</option>
            {gardens.map(g => <option key={g.gardenid} value={g.gardenid}>{g.name}</option>)}
          </select>
          <input className="field-input" placeholder="Factory Output ID" required value={lotForm.factoryOutputId} onChange={e => setLotForm({...lotForm, factoryOutputId: e.target.value})} />
          <input className="field-input" placeholder="Lot Number" required value={lotForm.lotNumber} onChange={e => setLotForm({...lotForm, lotNumber: e.target.value})} />
          <input className="field-input" placeholder="Invoice No" required value={lotForm.invoiceNo} onChange={e => setLotForm({...lotForm, invoiceNo: e.target.value})} />
          <input className="field-input" placeholder="Tea Grade" required value={lotForm.teaGrade} onChange={e => setLotForm({...lotForm, teaGrade: e.target.value})} />
          <input className="field-input" type="number" placeholder="Total Weight (Kg)" required value={lotForm.totalWeightKg} onChange={e => setLotForm({...lotForm, totalWeightKg: e.target.value})} />
          <input className="field-input" type="number" placeholder="Sample Weight (Kg)" required value={lotForm.sampleWeightKg} onChange={e => setLotForm({...lotForm, sampleWeightKg: e.target.value})} />
          <input className="field-input" type="date" required value={lotForm.productionDate} onChange={e => setLotForm({...lotForm, productionDate: e.target.value})} />
          <div className="col-span-2 flex justify-end">
            <button type="submit" className="primary-button">Create Lot</button>
          </div>
        </form>
      </div>

      <div className="panel mb-6">
        <div className="panel-header">
          <h2 className="panel-title">Auction Result</h2>
        </div>
        <form onSubmit={handleAuctionSubmit} className="p-4 border-b bg-gray-50 grid grid-cols-2 gap-4">
          <input className="field-input" placeholder="Tea Lot ID" required value={auctionForm.teaLotId} onChange={e => setAuctionForm({...auctionForm, teaLotId: e.target.value})} />
          <input className="field-input" placeholder="Sub Lot Code" required value={auctionForm.subLotCode} onChange={e => setAuctionForm({...auctionForm, subLotCode: e.target.value})} />
          <input className="field-input" placeholder="Buyer ID" required value={auctionForm.buyerId} onChange={e => setAuctionForm({...auctionForm, buyerId: e.target.value})} />
          <input className="field-input" type="number" placeholder="Price/Kg" required value={auctionForm.pricePerKg} onChange={e => setAuctionForm({...auctionForm, pricePerKg: e.target.value})} />
          <input className="field-input" type="number" placeholder="Sold Weight (Kg)" required value={auctionForm.soldWeightKg} onChange={e => setAuctionForm({...auctionForm, soldWeightKg: e.target.value})} />
          <input className="field-input" placeholder="Auction Center" required value={auctionForm.auctionCenter} onChange={e => setAuctionForm({...auctionForm, auctionCenter: e.target.value})} />
          <input className="field-input" placeholder="Broker Name" required value={auctionForm.brokerName} onChange={e => setAuctionForm({...auctionForm, brokerName: e.target.value})} />
          <input className="field-input" type="date" required value={auctionForm.auctionDate} onChange={e => setAuctionForm({...auctionForm, auctionDate: e.target.value})} />
          <div className="col-span-2 flex justify-end">
            <button type="submit" className="primary-button">Add Result</button>
          </div>
        </form>
      </div>
    </div>
  );
};
