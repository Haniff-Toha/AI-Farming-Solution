import React, { useState } from "react";
import {
  Sprout,
  Loader2,
  ChevronsRight,
  Bot,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
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
import { district, season, crop } from "../../../../data";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function YieldPredict() {
  const [formData, setFormData] = useState({
    Area: 100,
    District: "",
    Crop: "",
    Season: "",
  });
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "Area" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        // "https://nfc-api-l2z3.onrender.com/crop_yield",
        "http://127.0.0.1:5000/crop_yield",
        formData
      );
      setPrediction(response.data);
    } catch (error) {
      console.error("Error:", error);
      setPrediction("Failed to get yield prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const CropPredictionFooter = ({ data }) => {
    if (!data) return null;

    const {
      Area,
      Crop,
      Description,
      District,
      "Predicted Crop Yield": yieldTotal,
      Season,
      Year,
      "Yield per Hectare": yieldPerHa,
      recomendation,
    } = data;

    return (
      <div className="p-4 space-y-6">
        <div>
          <div className="space-y-3">
            <div className="flex items-start p-3 bg-blue-50 rounded-lg">
              <Sprout className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs sm:text-sm text-blue-500 font-medium">
                  Tanaman
                </p>
                <p className="text-xs text-blue-900 font-semibold">
                  {Crop || "Tidak ada"}
                </p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs sm:text-sm text-green-500 font-medium">
                  Prediksi Panen
                </p>
                <p className="text-xs text-green-900 font-semibold">
                  {yieldTotal || "Tidak ada"} tons
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
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline" />
                  }}
                >
                  {Description}
                </ReactMarkdown>
              </p>
            </div>
          </div>
        )}
        <div>
          <h3 className="text-md sm:text-lg font-semibold text-emerald-800 mb-3">
            Rekomendasi Tindakan
          </h3>
          <ul className="space-y-2">
            {recomendation && recomendation.length > 0 ? (
              recomendation.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <ChevronsRight className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline" />
                    }}
                  >
                    {rec}
                  </ReactMarkdown>
                </li>
              ))
            ) : (
              <p className="text-xs text-gray-500">
                Tidak ada rekomendasi tindakan saat ini.
              </p>
            )}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-800 flex items-center justify-center gap-2">
            <Sprout className="h-6 w-6 text-green-600" />
            Prediksi Hasil Panen
          </CardTitle>
          <CardDescription className="text-center">
            Masukkan detail tanaman dan area untuk memprediksi hasil panen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="Area">Area (hectares)</Label>
                <Input
                  id="Area"
                  name="Area"
                  type="number"
                  required
                  onChange={handleInputChange}
                  value={formData.Area || ""}
                  placeholder="e.g., 100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="District">Daerah</Label>
                <Select
                  name="District"
                  onValueChange={(value) =>
                    handleSelectChange("District", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih daerah" />
                  </SelectTrigger>
                  <SelectContent>
                    {district.map((item, index) => (
                      <SelectItem value={item} key={index}>
                        {item}
                      </SelectItem>
                    ))}
                    {/* Add more districts as needed */}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="Crop">Tanaman</Label>
                <Select
                  name="Crop"
                  onValueChange={(value) => handleSelectChange("Crop", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tanaman" />
                  </SelectTrigger>
                  <SelectContent>
                    {crop.map((item, index) => (
                      <SelectItem value={item} key={index}>
                        {item}
                      </SelectItem>
                    ))}
                    {/* Add more crops as needed */}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="Season">Musim</Label>
                <Select
                  name="Season"
                  onValueChange={(value) => handleSelectChange("Season", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih musim" />
                  </SelectTrigger>
                  <SelectContent>
                    {season.map((item, index) => (
                      <SelectItem value={item} key={index}>
                        {item}
                      </SelectItem>
                    ))}
                    {/* Add more crops as needed */}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full primary-bg hover:primary-bg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengolah
                </>
              ) : (
                "Prediksi"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          {prediction ? (
            <CropPredictionFooter data={prediction} />
          ) : (
            "Hasil analisa akan tampil disini"
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default YieldPredict;
