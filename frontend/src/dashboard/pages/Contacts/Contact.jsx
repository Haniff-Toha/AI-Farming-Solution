import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import CropsTable from './CropsTable';
import { showToast } from '@/components/CustomToast';

import {cropdata} from "../../../../data.js"
import axiosInstance from '@/helper/axios';

export const FarmAnalytics = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formErrors, setFormErrors] = useState({});

  const [filters, setFilters] = useState({
    cropName: '',
    minRevenue: '',
    maxRevenue: '',
    minQuantity: '',
    maxQuantity: '',
  });

  const [newCrop, setNewCrop] = useState({
    crop: {
      name: '',
      qty: ''
    },
    sold_at: '',
    expense: {
      seeds: '',
      fertilizers: [{ name: '', cost: '' }],
      electricity: '',
      machinery: '',
      labor: '',
      water_usage: '',
      storage: '',
      transport: '',
      pesticides: [{ name: '', cost: '' }]
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCropId, setEditingCropId] = useState(null);

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/v1/crop/getcrops');
      setCrops(response.data?.crops);
    } catch (err) {
      console.error("Error fetching crops:", err);
      setError("Gagal mengambil data crops dari server.");
      showToast(
        "danger",
        "Gagal mengambil data crops dari server.",
        err.response?.data?.message || "Terjadi kesalahan saat mengambil data. Silakan coba lagi nanti."
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalExpense = (expense) => {
    const fertilizerCost = expense.fertilizers.reduce((acc, curr) => acc + Number(curr.cost), 0);
    const pesticideCost = expense.pesticides.reduce((acc, curr) => acc + Number(curr.cost), 0);
    return Number(expense.seeds) + fertilizerCost + Number(expense.electricity) + Number(expense.machinery) + 
           Number(expense.labor) + Number(expense.water_usage) + Number(expense.storage) + Number(expense.transport) + pesticideCost;
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      cropName: '',
      minRevenue: '',
      maxRevenue: '',
      minQuantity: '',
      maxQuantity: '',
    });
  };

  const handleNewCropChange = (field, value) => {
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      if (
        field === "crop.name" && value.trim() !== "" ||
        field === "crop.qty" && Number(value) >= 0 ||
        field === "sold_at" && Number(value) >= 0
      ) {
        delete newErrors[field];
      }
      return newErrors;
    });
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setNewCrop(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setNewCrop(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleExpenseChange = (field, value) => {
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      if (value !== "" && Number(value) >= 0) {
        delete newErrors[`expense.${field}`];
      }
      return newErrors;
    });
    setNewCrop(prev => ({
      ...prev,
      expense: {
        ...prev.expense,
        [field]: value
      }
    }));
  };

  const handleAddFertilizer = () => {
    setNewCrop(prev => ({
      ...prev,
      expense: {
        ...prev.expense,
        fertilizers: [...prev.expense.fertilizers, { name: '', cost: '' }]
      }
    }));
  };

  const handleAddPesticide = () => {
    setNewCrop(prev => ({
      ...prev,
      expense: {
        ...prev.expense,
        pesticides: [...prev.expense.pesticides, { name: '', cost: '' }]
      }
    }));
  };

  const handleFertilizerChange = (index, field, value) => {
    setNewCrop(prev => ({
      ...prev,
      expense: {
        ...prev.expense,
        fertilizers: prev.expense.fertilizers.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const handlePesticideChange = (index, field, value) => {
    setNewCrop(prev => ({
      ...prev,
      expense: {
        ...prev.expense,
        pesticides: prev.expense.pesticides.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const handleSubmit = async () => {
    const errors = {};

    // Basic info validation
    if (!newCrop.crop.name) errors["crop.name"] = "Crop name is required";
    if (!newCrop.crop.qty || newCrop.crop.qty < 0) errors["crop.qty"] = "Quantity is required and must be ≥ 0";
    if (!newCrop.sold_at || newCrop.sold_at < 0) errors["sold_at"] = "Sold price is required and must be ≥ 0";

    // Expense validation
    const expenseFields = ["seeds", "electricity", "machinery", "labor", "water_usage", "storage", "transport"];
    expenseFields.forEach(field => {
      const value = newCrop.expense[field];
      if (value === "" || value < 0) {
        errors[`expense.${field}`] = "Required and must be ≥ 0";
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({}); 
    
    const payload = prepareCropPayload(newCrop);

    try {
      let response;
      if (isEditMode && editingCropId) {
        response = await axiosInstance.put(`/v1/crop/updatecrop/${editingCropId}`, payload);
      } else {
        response = await axiosInstance.post("/v1/crop/createcrop", payload);
      }

      if (response.data.success) {
        await fetchCrops(); 
        setIsOpen(false);
        resetForm();
        setIsEditMode(false);
        setEditingCropId(null);
        showToast("success", `Berhasil ${isEditMode ? 'memperbarui' : 'menambahkan'} crop.`);
      } else {
        showToast("danger", "Gagal memproses data crop.", "Server tidak mengembalikan status success.");
      }
    } catch (err) {
      console.error("Error adding crop:", err);
      showToast("danger", "Terjadi kesalahan", err.response?.data?.message || "Silakan coba lagi nanti.");
    }
  };

  const filteredCrops = crops.filter((crop) => {
    const cropName = crop?.crop?.name?.toLowerCase?.() || '';
    const quantity = parseInt(crop?.crop?.qty || 0);
    const soldAt = parseFloat(crop?.sold_at || 0);
    const revenue = soldAt * quantity;

    return (
      (!filters.cropName || cropName.includes(filters.cropName.toLowerCase())) &&
      (!filters.minRevenue || revenue >= parseFloat(filters.minRevenue)) &&
      (!filters.maxRevenue || revenue <= parseFloat(filters.maxRevenue)) &&
      (!filters.minQuantity || quantity >= parseFloat(filters.minQuantity)) &&
      (!filters.maxQuantity || quantity <= parseFloat(filters.maxQuantity))
    );
  });

  const resetForm = () => {
    setNewCrop({
      crop: { name: '', qty: '' },
      sold_at: '',
      expense: {
        seeds: '',
        fertilizers: [{ name: '', cost: '' }],
        electricity: '',
        machinery: '',
        labor: '',
        water_usage: '',
        storage: '',
        transport: '',
        pesticides: [{ name: '', cost: '' }]
      }
    });
    setFormErrors({});
  };

  const handleRemoveFertilizer = (index) => {
    setNewCrop(prev => {
      if (prev.expense.fertilizers.length <= 1) return prev; // minimum 1
      const updated = [...prev.expense.fertilizers];
      updated.splice(index, 1);
      return {
        ...prev,
        expense: {
          ...prev.expense,
          fertilizers: updated,
        },
      };
    });
  };

  const handleRemovePesticide = (index) => {
    setNewCrop(prev => {
      if (prev.expense.pesticides.length <= 1) return prev;
      const updated = [...prev.expense.pesticides];
      updated.splice(index, 1);
      return {
        ...prev,
        expense: {
          ...prev.expense,
          pesticides: updated,
        },
      };
    });
  };

  const getInputClass = (field) => {
    return formErrors[field]
      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
      : "";
  };

  const prepareCropPayload = (rawCrop) => {
    return {
      crop: {
        name: rawCrop.crop.name,
        qty: rawCrop.crop.qty,
      },
      sold_at: Number(rawCrop.sold_at),
      expense: {
        seeds: Number(rawCrop.expense.seeds),
        electricity: Number(rawCrop.expense.electricity),
        machinery: Number(rawCrop.expense.machinery),
        labor: Number(rawCrop.expense.labor),
        water_usage: Number(rawCrop.expense.water_usage),
        storage: Number(rawCrop.expense.storage),
        transport: Number(rawCrop.expense.transport),
        fertilizers: rawCrop.expense.fertilizers
          .filter(f => f.name.trim() !== "" && f.cost !== "")
          .map(f => ({
            name: f.name.trim(),
            cost: Number(f.cost),
          })),
        pesticides: rawCrop.expense.pesticides
          .filter(p => p.name.trim() !== "" && p.cost !== "")
          .map(p => ({
            name: p.name.trim(),
            cost: Number(p.cost),
          }))
      }
    };
};
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Farm Analytics</h1>
        <div className="flex gap-4">
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              resetForm();
              setIsEditMode(false);
              setEditingCropId(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="primary-bg text-white">
                <Plus className="h-4 w-4 mr-2 text-white" /> {isEditMode ? "Edit Crop" : "Add Crop"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xs max-h-[60vh] sm:max-w-2xl sm:max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditMode ? "Edit Crop" : "Add New Crop"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cropName">Crop Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="cropName"
                      value={newCrop.crop.name}
                      onChange={(e) => handleNewCropChange('crop.name', e.target.value)}
                      className={getInputClass("crop.name")}
                    />
                    {formErrors["crop.name"] && (
                      <p className="text-red-500 text-sm mt-1">{formErrors["crop.name"]}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="quantity">
                      Quantity <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="quantity"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={newCrop.crop.qty}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          handleNewCropChange('crop.qty', '');
                          return;
                        }
                        if (!/^\d+$/.test(value)) return;
                        if (value.length > 1 && value.startsWith('0')) return;

                        handleNewCropChange('crop.qty', value);
                      }}
                      className={getInputClass("crop.qty")}
                    />
                    {formErrors["crop.qty"] && (
                      <p className="text-red-500 text-sm mt-1">{formErrors["crop.qty"]}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="soldAt">Sold At (per unit in IDR) <span className="text-red-500">*</span></Label>
                  <Input
                    id="soldAt"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={newCrop.sold_at}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          handleNewCropChange('sold_at', '');
                          return;
                        }
                        if (!/^\d+$/.test(value)) return;
                        if (value.length > 1 && value.startsWith('0')) return;

                        handleNewCropChange('sold_at', value);
                      }}
                    className={getInputClass("sold_at")}
                  />
                  {formErrors["sold_at"] && (
                    <p className="text-red-500 text-sm mt-1">{formErrors["sold_at"]}</p>
                  )}
                </div>

                <h3 className="text-lg font-semibold mt-4">Expenses</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="seeds">Seeds (in IDR)<span className="text-red-500">*</span></Label>
                    <Input
                      id="seeds"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={newCrop.expense.seeds}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          handleExpenseChange('seeds', '');
                          return;
                        }
                        if (!/^\d+$/.test(value)) return;
                        if (value.length > 1 && value.startsWith('0')) return;

                        handleExpenseChange('seeds', value);
                        }}
                      className={getInputClass("seeds")}
                    />
                    {formErrors["expense.seeds"] && (
                      <p className="text-red-500 text-sm mt-1">{formErrors["expense.seeds"]}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="electricity">Electricity (in IDR)<span className="text-red-500">*</span></Label>
                    <Input
                      id="electricity"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={newCrop.expense.electricity}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          handleExpenseChange('electricity', '');
                          return;
                        }
                        if (!/^\d+$/.test(value)) return;
                        if (value.length > 1 && value.startsWith('0')) return;

                        handleExpenseChange('electricity', value);
                      }}
                      className={getInputClass("electricity")}
                    />
                    {formErrors["expense.electricity"] && (
                      <p className="text-red-500 text-sm mt-1">{formErrors["expense.electricity"]}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="machinery">Machinery (in IDR)<span className="text-red-500">*</span></Label>
                    <Input
                      id="machinery"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={newCrop.expense.machinery}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          handleExpenseChange('machinery', '');
                          return;
                        }
                        if (!/^\d+$/.test(value)) return;
                        if (value.length > 1 && value.startsWith('0')) return;

                        handleExpenseChange('machinery', value);
                      }}
                      className={getInputClass("machinery")}
                    />
                    {formErrors["expense.machinery"] && (
                      <p className="text-red-500 text-sm mt-1">{formErrors["expense.machinery"]}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="labor">Labor (in IDR)<span className="text-red-500">*</span></Label>
                    <Input
                      id="labor"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={newCrop.expense.labor}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          handleExpenseChange('labor', '');
                          return;
                        }
                        if (!/^\d+$/.test(value)) return;
                        if (value.length > 1 && value.startsWith('0')) return;

                        handleExpenseChange('labor', value);
                      }}
                      className={getInputClass("labor")}
                    />
                    {formErrors["expense.labor"] && (
                      <p className="text-red-500 text-sm mt-1">{formErrors["expense.labor"]}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="water">Water Usage (in IDR)<span className="text-red-500">*</span></Label>
                    <Input
                      id="water"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={newCrop.expense.water_usage}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          handleExpenseChange('water_usage', '');
                          return;
                        }
                        if (!/^\d+$/.test(value)) return;
                        if (value.length > 1 && value.startsWith('0')) return;

                        handleExpenseChange('water_usage', value);
                      }}
                      className={getInputClass("water_usage")}
                    />
                    {formErrors["expense.water_usage"] && (
                      <p className="text-red-500 text-sm mt-1">{formErrors["expense.water_usage"]}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="storage">Storage (in IDR)<span className="text-red-500">*</span></Label>
                    <Input
                      id="storage"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={newCrop.expense.storage}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          handleExpenseChange('storage', '');
                          return;
                        }
                        if (!/^\d+$/.test(value)) return;
                        if (value.length > 1 && value.startsWith('0')) return;

                        handleExpenseChange('storage', value);
                      }}
                      className={getInputClass("storage")}
                    />
                    {formErrors["expense.storage"] && (
                      <p className="text-red-500 text-sm mt-1">{formErrors["expense.storage"]}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="transport">Transport (in IDR)<span className="text-red-500">*</span></Label>
                  <Input
                    id="transport"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={newCrop.expense.transport}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          handleExpenseChange('transport', '');
                          return;
                        }
                        if (!/^\d+$/.test(value)) return;
                        if (value.length > 1 && value.startsWith('0')) return;

                        handleExpenseChange('transport', value);
                      }}
                    className={getInputClass("transport")}
                  />
                  {formErrors["expense.transport"] && (
                      <p className="text-red-500 text-sm mt-1">{formErrors["expense.transport"]}</p>
                    )}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Fertilizers</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddFertilizer}>
                      Add Fertilizer
                    </Button>
                  </div>
                  {newCrop.expense.fertilizers.map((fertilizer, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 items-center">
                      <Input
                        placeholder="Fertilizer name"
                        value={fertilizer.name}
                        onChange={(e) => handleFertilizerChange(index, 'name', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Cost"
                        value={fertilizer.cost}
                        min={0}
                        onChange={(e) => handleFertilizerChange(index, 'cost', e.target.value)}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveFertilizer(index)}
                        disabled={newCrop.expense.fertilizers.length === 1}
                        className="h-8 w-8 p-0 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Pesticides</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddPesticide}>
                      Add Pesticide
                    </Button>
                  </div>
                  {newCrop.expense.pesticides.map((pesticide, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 items-center">
                      <Input
                        placeholder="Pesticide name"
                        value={pesticide.name}
                        onChange={(e) => handlePesticideChange(index, 'name', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Cost"
                        value={pesticide.cost}
                        onChange={(e) => handlePesticideChange(index, 'cost', e.target.value)}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemovePesticide(index)}
                        disabled={newCrop.expense.pesticides.length === 1}
                        className="h-8 w-8 p-0 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button type="button" onClick={handleSubmit} className="primary-bg">{isEditMode ? "Edit Crop" :"Add Crop"}</Button>
              </div>
            </DialogContent>
          </Dialog>
          {/* <Button variant="outline">Export Data</Button>
          <Button variant="outline">Generate Report</Button> */}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Input 
          placeholder="Filter by crop name"
          value={filters.cropName}
          onChange={(e) => handleFilterChange('cropName', e.target.value)}
        />
        <Input 
          placeholder="Min Revenue"
          type="number"
          value={filters.minRevenue}
          onChange={(e) => handleFilterChange('minRevenue', e.target.value)}
        />
        <Input 
          placeholder="Max Revenue"
          type="number"
          value={filters.maxRevenue}
          onChange={(e) => handleFilterChange('maxRevenue', e.target.value)}
        />
        <Input 
          placeholder="Min Quantity"
          type="number"
          value={filters.minQuantity}
          onChange={(e) => handleFilterChange('minQuantity', e.target.value)}
        />
        <Input 
          placeholder="Max Quantity"
          type="number"
          value={filters.maxQuantity}
          onChange={(e) => handleFilterChange('maxQuantity', e.target.value)}
        />
      </div>

      {Object.values(filters).some(filter => filter) && (
        <Button 
          variant="ghost" 
          className="mb-4 text-sm"
          onClick={clearFilters}
        >
          <X className="h-4 w-4 mr-2" /> Clear Filters
        </Button>
      )}

      {/* Crops Table */}
      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading crop data...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : filteredCrops.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Tidak ada data crop yang tersedia.
          {filteredCrops.length > 0 && " Silakan ubah filter untuk melihat hasil."}
        </div>
      ) : (
        <CropsTable 
          crops={filteredCrops}
          onDelete={(id) => setDeleteConfirm({ id, open: true })}
          onEdit={(crop) => {
            setNewCrop({
              crop: { ...crop.crop },
              sold_at: crop.sold_at,
              expense: {
                ...crop.expense,
                fertilizers: crop.expense.fertilizers.length > 0 ? crop.expense.fertilizers : [{ name: '', cost: '' }],
                pesticides: crop.expense.pesticides.length > 0 ? crop.expense.pesticides : [{ name: '', cost: '' }],
              },
            });
            setIsEditMode(true);
            setEditingCropId(crop._id);
            setIsOpen(true);
          }}
        />
      )}

      <Dialog open={deleteConfirm.open} onOpenChange={(val) => setDeleteConfirm({ ...deleteConfirm, open: val })}>
        <DialogContent className="max-w-xs sm:max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Hapus Crop</DialogTitle>
          </DialogHeader>
          <p>Apakah Anda yakin ingin menghapus crop ini?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, id: null })}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  await axiosInstance.delete(`/v1/crop/deletecrop/${deleteConfirm.id}`);
                  await fetchCrops();
                  showToast("success", "Crop berhasil dihapus.");
                } catch (err) {
                  showToast("danger", "Gagal menghapus crop", err.response?.data?.message || "Terjadi kesalahan.");
                } finally {
                  setDeleteConfirm({ open: false, id: null });
                }
              }}
            >
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>)} ; 