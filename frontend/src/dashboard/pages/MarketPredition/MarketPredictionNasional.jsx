import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  Alert, AlertDescription, AlertTitle,
} from "@/components/ui/alert";
import {
  BarChart, Tag, TrendingUp, TrendingDown, Info, Loader2, CalendarDays,
} from "lucide-react";
import axios from "axios";
import { showToast } from "@/components/CustomToast";
import SelectCommodity from "./components/SelectCommodity";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Filter options
const commodities = [
  "Beras Medium", "Beras Premium", "Gula Pasir Curah",
  "Minyak Goreng Sawit Kemasan Premium", "Minyak Goreng Sawit Curah",
  "Minyakita", "Tepung Terigu", "Kedelai Impor", "Cabai Merah Keriting",
  "Cabai Rawit Merah", "Cabai Merah Besar", "Bawang Merah", "Bawang Putih Honan",
];

const periods = {
  '30d': '30 Hari Terakhir',
  '90d': '90 Hari Terakhir',
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(value);

const MarketPredictionNational = () => {
  const [selectedCommodity, setSelectedCommodity] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedCommodity && selectedPeriod) {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        setMarketData(null);
        try {
          const response = await axios.get('http://127.0.0.1:5000/market_prices_new', {
            params: {
              commodity: selectedCommodity,
              region: "Indonesia",
              period: selectedPeriod,
            },
          });
          setMarketData(response.data);
        } catch (err) {
          setError("Gagal memuat data dari server. Silakan coba lagi nanti.");
          console.error(err);
          showToast(
            "danger",
            "Gagal mengambil data analisis pasar.",
            err.response?.data?.message || "Terjadi kesalahan saat mengambil data. Silakan coba lagi nanti."
          );
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [selectedCommodity, selectedPeriod]);

  const renderData = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
          <p className="ml-4 text-lg">Menganalisis data pasar...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!marketData) {
      return (
        <div className="text-center h-64 flex flex-col justify-center items-center bg-gray-50 rounded-lg">
          <Info className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-md sm:text-xl font-semibold text-gray-700">Pilih Opsi Analisis</h3>
          <p className="text-gray-500">Silakan pilih komoditas dan periode waktu untuk memulai analisis.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Harga Hari Ini</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(marketData.current_price)}</div>
              <p className="text-xs text-muted-foreground">per {marketData.satuan_display} (sumber: SP2KP - simulasi)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tertinggi ({periods[selectedPeriod]})</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(marketData.highest_price_period)}</div>
              <p className="text-xs text-muted-foreground">Harga puncak dalam periode</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terendah ({periods[selectedPeriod]})</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(marketData.lowest_price_period)}</div>
              <p className="text-xs text-muted-foreground">Harga terendah dalam periode</p>
            </CardContent>
          </Card>
        </div>

        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          <AlertTitle className="font-semibold">Analisis Tren & Rekomendasi</AlertTitle>
          <AlertDescription>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline" />
              }}
            >
              {marketData.trend_analysis}
            </ReactMarkdown>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Grafik Fluktuasi Harga ({periods[selectedPeriod]})</CardTitle>
            <CardDescription>
              Visualisasi pergerakan harga untuk {marketData.commodity} secara nasional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer>
                <LineChart
                  data={marketData.historical_prices}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(str) =>
                      new Date(str).toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'short',
                      })}
                    angle={-20}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    tickFormatter={(val) =>
                      new Intl.NumberFormat('id-ID', {
                        notation: "compact", compactDisplay: "short",
                      }).format(val)
                    }
                    domain={['dataMin - 2000', 'dataMax + 2000']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid #ddd',
                    }}
                    labelStyle={{ fontWeight: 'bold' }}
                    formatter={(value) => [formatCurrency(value), 'Harga']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="price"
                    name="Harga (IDR)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 bg-gray-100 min-h-screen">
      <header className="mb-8">
        <h1 className="text-lg sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
          <BarChart className="w-8 h-8 text-emerald-600" />
          Analisis Harga & Pasar Komoditas Nasional
        </h1>
        <p className="text-gray-600 mt-2">
          Dapatkan analisis tren harga berdasarkan musim dan waktu untuk membantu Anda menentukan waktu penjualan terbaik.
        </p>
      </header>

      <section className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline-block mr-1" />
              Pilih Komoditas
            </label>
            <Select onValueChange={setSelectedCommodity}>
              <SelectTrigger>
                <SelectValue placeholder="Contoh: Beras Medium" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {commodities.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
          <SelectCommodity
            commodities={commodities}
            selected={selectedCommodity}
            setSelected={setSelectedCommodity}
            popoverWidthClass="max-w-xl"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarDays className="w-4 h-4 inline-block mr-1" />
              Pilih Periode Waktu
            </label>
            <Select onValueChange={setSelectedPeriod} disabled={!selectedCommodity}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(periods).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <main>{renderData()}</main>
    </div>
  );
};

export default MarketPredictionNational;
