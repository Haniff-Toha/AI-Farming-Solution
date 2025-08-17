"use client";

import React, { useState } from "react";
import { Leaf, Loader2, Sprout, TrendingUp, ChevronsRight } from "lucide-react";
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
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function CropRecommend() {
  const [formData, setFormData] = useState({
    n: 0,
    p: 0,
    k: 0,
    temperature: 0,
    humidity: 0,
    ph: 0,
    rainfall: 0,
  });
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        // "https://nfc-api-l2z3.onrender.com/crop_rec",
        "http://127.0.0.1:5000/crop_rec",
        formData
      );
      console.log(response.data);
      setRecommendation(response.data);
    } catch (error) {
      console.error("Error:", error);
      setRecommendation("Failed to get recommendation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const PredictionFooter = ({ data }) => {
    if (!data) return null;

    const {
      Humidity,
      Nitrogen,
      Ph,
      Phosporus,
      PredictedCrop,
      Rainfall,
      Temperature,
      Description,
      recomendation
    } = data;

    return (
      <div className="p-4 space-y-6">
        <div>
          <div className="space-y-3">
            <div className="flex items-start p-3 bg-blue-50 rounded-lg">
              <Sprout className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs sm:text-sm text-blue-500 font-medium">
                  Rekomendasi Tanaman
                </p>
                <p className="text-xs text-blue-900 font-semibold">
                  {PredictedCrop || "Tidak ada"}
                </p>
              </div>
            </div>
            {/* <div className="flex items-start p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs sm:text-sm text-green-500 font-medium">
                  Pupuk yang Direkomendasikan
                </p>
                <p className="text-xs text-green-900 font-semibold">
                  {fertilizerName || "Tidak ada"} tons
                </p>
              </div>
            </div> */}
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-emerald-800 flex items-center justify-center gap-2">
            <Leaf className="h-6 w-6 text-emerald-600" />
            Rekomendasi Tanaman
          </CardTitle>
          <CardDescription className="text-center">
            Masukkan data tanah dan lingkungan untuk mendapatkan rekomendasi tanaman
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="n">Nitrogen/N (mg/kg)</Label>
                <Input
                  id="n"
                  name="n"
                  type="number"
                  required
                  onChange={handleInputChange}
                  value={formData.n || ""}
                  placeholder="e.g., 40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p">Fosfor/P (mg/kg)</Label>
                <Input
                  id="p"
                  name="p"
                  type="number"
                  required
                  onChange={handleInputChange}
                  value={formData.p || ""}
                  placeholder="e.g., 50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="k">Kalium/K (mg/kg)</Label>
                <Input
                  id="k"
                  name="k"
                  type="number"
                  required
                  onChange={handleInputChange}
                  value={formData.k || ""}
                  placeholder="e.g., 30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">Suhu (°C)</Label>
                <Input
                  id="temperature"
                  name="temperature"
                  type="number"
                  required
                  onChange={handleInputChange}
                  value={formData.temperature || ""}
                  placeholder="e.g., 25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="humidity">Kelembaban (%)</Label>
                <Input
                  id="humidity"
                  name="humidity"
                  type="number"
                  required
                  onChange={handleInputChange}
                  value={formData.humidity || ""}
                  placeholder="e.g., 70"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ph">pH</Label>
                <Input
                  id="ph"
                  name="ph"
                  type="number"
                  step="0.1"
                  required
                  onChange={handleInputChange}
                  value={formData.ph || ""}
                  placeholder="e.g., 6.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rainfall">Curah hujan (mm)</Label>
                <Input
                  id="rainfall"
                  name="rainfall"
                  type="number"
                  required
                  onChange={handleInputChange}
                  value={formData.rainfall || ""}
                  placeholder="e.g., 200"
                />
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
