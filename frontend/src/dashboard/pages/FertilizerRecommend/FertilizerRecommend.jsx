import React, { useState } from "react";
import { Leaf, Loader2, Sprout, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { cropType, soilType } from "../../../../data";

export default function FertilizerRecommend() {
  const [formData, setFormData] = useState({
    CropType: "",
    SoilType: "",
    Humidity: 51,
    Nitrogen: 8,
    Phosphorous: 28,
    Potassium: 12,
    SoilMoisture: 63,
    Temperature: 31,
  });
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/fert_predict",
        {
          CropType: formData.CropType,
          SoilType: formData.SoilType,
          SoilMoisture: formData.SoilMoisture,
          Humidity: formData.Humidity,
          Nitrogen: formData.Nitrogen,
          Phosphorous: formData.Phosphorous,
          Potassium: formData.Potassium,
          Temperature: formData.Temperature,
        }
      );
      console.log(response.data);
      setRecommendation(response.data);
    } catch (error) {
      console.error("Error:", error);
      setRecommendation(
        "Failed to get fertilizer recommendation. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const PredictionFooter = ({ data }) => {
    if (!data) return null;

    const {
      "Crop Type": cropType,
      Description,
      "Fertilizer Name": fertilizerName,
      Humidity,
      Nitrogen,
      Phosphorous,
      Potassium,
      "Soil Moisture": soilMOsture,
      "Soil Type": soilType,
      Temparature,
    } = data;

    return (
      <div className="p-4 space-y-6">
        <div>
          <div className="space-y-3">
            <div className="flex items-start p-3 bg-blue-50 rounded-lg">
              <Sprout className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs sm:text-sm text-blue-500 font-medium">
                  Jenis Tanaman
                </p>
                <p className="text-xs text-blue-900 font-semibold">
                  {cropType || "Tidak ada"}
                </p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs sm:text-sm text-green-500 font-medium">
                  Pupuk yang Direkomendasikan
                </p>
                <p className="text-xs text-green-900 font-semibold">
                  {fertilizerName || "Tidak ada"}
                </p>
              </div>
            </div>
          </div>
        </div>
        {Description && (
          <div className="mt-6">
            <h3 className="text-md sm:text-lg  font-semibold text-emerald-800 mb-3">
              Penjelasan
            </h3>
            <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
              <p className="text-xs text-gray-700 leading-relaxed">
                {Description}
              </p>
            </div>
          </div>
        )}
        {/* <div>
          <h3 className="text-md sm:text-lg font-semibold text-emerald-800 mb-3">
            Rekomendasi Tindakan
          </h3>
          <ul className="space-y-2">
            {recomendation && recomendation.length > 0 ? (
              recomendation.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <ChevronsRight className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700">{rec}</span>
                </li>
              ))
            ) : (
              <p className="text-xs text-gray-500">
                Tidak ada rekomendasi tindakan saat ini.
              </p>
            )}
          </ul>
        </div> */}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-lime-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-lime-800 flex items-center justify-center gap-2">
            <Leaf className="h-6 w-6 text-lime-600" />
            Rekomendasi Pupuk
          </CardTitle>
          <CardDescription className="text-center">
            Masukkan detail tanaman dan tanah untuk mendapatkan rekomendasi pupuk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="CropType">Jenis Tanaman</Label>
              <Select
                name="CropType"
                onValueChange={(value) => handleSelectChange("CropType", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih jenis tanaman" />
                </SelectTrigger>
                <SelectContent>
                  {cropType.map((item, index) => (
                    <SelectItem value={item} key={index}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="SoilType">Jenis Tanah</Label>
              <Select
                name="SoilType"
                onValueChange={(value) => handleSelectChange("SoilType", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih jenis tanah" />
                </SelectTrigger>
                <SelectContent>
                  {soilType.map((item, index) => (
                    <SelectItem value={item} key={index}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="Humidity">Kelembaban (%)</Label>
                <Input
                  id="Humidity"
                  name="Humidity"
                  type="number"
                  required
                  onChange={handleInputChange}
                  value={formData.Humidity || ""}
                  placeholder="e.g., 51"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="Nitrogen">Nitrogen (kg/ha)</Label>
                <Input
                  id="Nitrogen"
                  name="Nitrogen"
                  type="number"
                  required
                  onChange={handleInputChange}
                  value={formData.Nitrogen || ""}
                  placeholder="e.g., 8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="Phosphorous">Fosfor (kg/ha)</Label>
                <Input
                  id="Phosphorous"
                  name="Phosphorous"
                  type="number"
                  required
                  onChange={handleInputChange}
                  value={formData.Phosphorous || ""}
                  placeholder="e.g., 28"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="Potassium">Kalium (kg/ha)</Label>
                <Input
                  id="Potassium"
                  name="Potassium"
                  type="number"
                  required
                  onChange={handleInputChange}
                  value={formData.Potassium || ""}
                  placeholder="e.g., 12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="SoilMoisture">Kelembaban Tanah (%)</Label>
                <Input
                  id="SoilMoisture"
                  name="SoilMoisture"
                  type="number"
                  required
                  onChange={handleInputChange}
                  value={formData.SoilMoisture || ""}
                  placeholder="e.g., 63"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="Temperature">Suhu (°C)</Label>
                <Input
                  id="Temperature"
                  name="Temperature"
                  type="number"
                  required
                  onChange={handleInputChange}
                  value={formData.Temperature || ""}
                  placeholder="e.g., 31"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full rounded primary-bg hover:primary-bg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengolah
                </>
              ) : (
                "Dapatkan Rekomendasi"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          {recommendation ? (
            <PredictionFooter data={recommendation} />
          ) : (
            "Hasil analisa akan tampil disini"
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
