import { Eye, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const CropsTable = ({ crops, onDelete, onEdit }) => {

    const calculateTotalExpense = (expense) => {
      const fertilizerCost = expense.fertilizers.reduce((acc, curr) => acc + Number(curr.cost), 0);
      const pesticideCost = expense.pesticides.reduce((acc, curr) => acc + Number(curr.cost), 0);
      return (
        Number(expense.seeds) +
        fertilizerCost +
        Number(expense.electricity) +
        Number(expense.machinery) +
        Number(expense.labor) +
        Number(expense.water_usage) +
        Number(expense.storage) +
        Number(expense.transport) +
        pesticideCost
      );
    };
  
    const calculateRevenue = (crop) => {
      return Number(crop.sold_at) * Number(crop.crop.qty);
    };
  
    const calculateProfit = (crop) => {
      const revenue = calculateRevenue(crop);
      const expense = calculateTotalExpense(crop.expense);
      return revenue - expense;
    };
  
    return (
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-medium">Crop Name</th>
              <th className="text-right p-4 font-medium">Quantity</th>
              <th className="text-right p-4 font-medium">Sold At (per unit)</th>
              <th className="text-right p-4 font-medium">Total Revenue</th>
              <th className="text-right p-4 font-medium">Total Expenses</th>
              <th className="text-right p-4 font-medium">Profit/Loss</th>
              <th className="text-left p-4 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {crops.map((crop, index) => {
              const revenue = calculateRevenue(crop);
              const expenses = calculateTotalExpense(crop.expense);
              const profit = calculateProfit(crop);
  
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-4">{crop.crop.name}</td>
                  <td className="p-4 text-right">{crop.crop.qty}</td>
                  <td className="p-4 text-right">IDR{crop.sold_at.toLocaleString()}</td>
                  <td className="p-4 text-right">IDR{revenue.toLocaleString()}</td>
                  <td className="p-4 text-right">IDR{expenses.toLocaleString()}</td>
                  <td className={`p-4 text-right font-medium IDR{profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  IDR{Math.abs(profit).toLocaleString()}
                    {profit >= 0 ? ' profit' : ' loss'}
                  </td>
                  <td className="p-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button title="View">
                          <Eye className="w-5 h-5 mr-2 text-gray-600 hover:text-[#89af4e]" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-xs max-h-[60vh] sm:max-w-2xl sm:max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{crop.crop.name} Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium mb-2">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>Quantity:</div>
                              <div>{crop.crop.qty}</div>
                              <div>Sold At:</div>
                              <div>IDR{crop.sold_at.toLocaleString()}</div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="font-medium mb-2">Expenses Breakdown</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>Seeds:</div>
                              <div>IDR{crop.expense.seeds.toLocaleString()}</div>
                              <div>Electricity:</div>
                              <div>IDR{crop.expense.electricity.toLocaleString()}</div>
                              <div>Machinery:</div>
                              <div>IDR{crop.expense.machinery.toLocaleString()}</div>
                              <div>Labor:</div>
                              <div>IDR{crop.expense.labor.toLocaleString()}</div>
                              <div>Water Usage:</div>
                              <div>IDR{crop.expense.water_usage.toLocaleString()}</div>
                              <div>Storage:</div>
                              <div>IDR{crop.expense.storage.toLocaleString()}</div>
                              <div>Transport:</div>
                              <div>IDR{crop.expense.transport.toLocaleString()}</div>
                            </div>
                          </div>
  
                          <div>
                            <h3 className="font-medium mb-2">Fertilizers</h3>
                            <div className="space-y-2">
                              {crop.expense.fertilizers.map((fertilizer, idx) => (
                                <div key={idx} className="grid grid-cols-2 gap-2 text-sm">
                                  <div>{fertilizer.name}:</div>
                                  <div>IDR{fertilizer.cost.toLocaleString()}</div>
                                </div>
                              ))}
                            </div>
                          </div>
  
                          <div>
                            <h3 className="font-medium mb-2">Pesticides</h3>
                            <div className="space-y-2">
                              {crop.expense.pesticides.map((pesticide, idx) => (
                                <div key={idx} className="grid grid-cols-2 gap-2 text-sm">
                                  <div>{pesticide.name}:</div>
                                  <div>IDR{pesticide.cost.toLocaleString()}</div>
                                </div>
                              ))}
                            </div>
                          </div>
  
                          <div className="border-t pt-4">
                            <div className="grid grid-cols-2 gap-2 text-sm font-medium">
                              <div>Total Revenue:</div>
                              <div>IDR{revenue.toLocaleString()}</div>
                              <div>Total Expenses:</div>
                              <div>IDR{expenses.toLocaleString()}</div>
                              <div>Net Profit/Loss:</div>
                              <div className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                IDR{Math.abs(profit).toLocaleString()}
                                {profit >= 0 ? ' profit' : ' loss'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <button title="Edit" onClick={() => onEdit(crop)}>
                      <Pencil className="w-5 h-5 mr-2 text-gray-600 hover:text-[#89af4e]" />
                    </button>

                    <button title="Delete" onClick={() => onDelete(crop._id)}>
                      <Trash2 className="w-5 h-5 text-gray-600 hover:text-[#89af4e]" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default CropsTable;