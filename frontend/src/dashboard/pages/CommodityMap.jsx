import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from 'react-leaflet';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin, Bug, X, Info, ShieldAlert, Sprout, Activity, FileDown, Filter } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
} from "@/components/ui/drawer";
import LegendControl from '../components/LegendMap';

// --- Panel Edukasi Kontekstual --- (Tidak ada perubahan)
const ContextualHelpPanel = ({ condition, onClose }) => {
    const [info, setInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (condition) {
            setIsLoading(true);
            axios.get(`http://127.0.0.1:5000/contextual_info?condition=${condition}`)
                .then(res => setInfo(res.data))
                .catch(err => console.error("Gagal memuat info kontekstual:", err))
                .finally(() => setIsLoading(false));
        } else {
            setInfo(null);
        }
    }, [condition]);

    if (!condition) return null;
    if (isLoading) return <div className="mt-6 p-4 bg-gray-50 border rounded-lg flex items-center justify-center"><Loader2 size={18} className="animate-spin text-gray-500" /></div>;
    if (!info) return null;

    return (
        <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg relative animate-in fade-in-50 duration-300">
            <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><X size={18} /></button>
            <h3 className="text-md font-bold text-emerald-800 mb-2 flex items-center gap-2">{info.title}</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {info.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
            </ul>
        </div>
    );
};

// --- Komponen Utama Peta ---
const CommodityMap = () => {
    // --- State Management ---
    const [selectedProvince, setSelectedProvince] = useState('Jawa Timur');
    const [selectedCommodity, setSelectedCommodity] = useState('Semua'); // [FITUR BARU] State untuk filter komoditas
    const [mapData, setMapData] = useState({ harvest: [], monitoring: [], weather: {}, soil: {}, pests: [] });
    const [activeLayers, setActiveLayers] = useState({ pests: false });
    const [isLoading, setIsLoading] = useState(true);
    const [mapInstance, setMapInstance] = useState(null);
    const [contextualCondition, setContextualCondition] = useState(null);
    const commodityOptions = ["Semua", "Padi", "Jagung", "Cabai Merah", "Bawang Merah", "Kelapa Sawit"];

    // --- [LOGIKA DIPERBARUI] Pengambilan Data dari Backend dengan Filter ---
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const CancelToken = axios.CancelToken;
            const source = CancelToken.source();

            // Tambahkan parameter filter jika bukan "Semua"
            const params = selectedCommodity !== 'Semua' ? { commodity: selectedCommodity } : {};

            try {
                const [harvest, monitoring, weather, soil, pests] = await Promise.all([
                    axios.get('http://127.0.0.1:5000/harvest_prediction', { params, cancelToken: source.token }),
                    axios.get('http://127.0.0.1:5000/land_monitoring', { params, cancelToken: source.token }),
                    axios.get('http://127.0.0.1:5000/weather_data', { params, cancelToken: source.token }),
                    axios.get('http://127.0.0.1:5000/soil_data', { params, cancelToken: source.token }),
                    axios.get('http://127.0.0.1:5000/pest_outbreaks', { cancelToken: source.token }), // Wabah tidak difilter
                ]);
                setMapData({ harvest: harvest.data, monitoring: monitoring.data, weather: weather.data, soil: soil.data, pests: pests.data });
            } catch (error) {
                if (!axios.isCancel(error)) {
                    console.error("Gagal memuat data peta:", error);
                }
            } finally {
                setIsLoading(false);
            }
            return () => source.cancel();
        };
        fetchData();
    }, [selectedCommodity]); // Re-fetch data saat filter komoditas berubah

    useEffect(() => {
        if (mapInstance && selectedProvince) {
            const provinceData = mapData.harvest.find(p => p.province === selectedProvince);
            if (provinceData) mapInstance.flyTo(provinceData.coords, 8, { duration: 1.5 });
            
            const monitoringInfo = mapData.monitoring.find(p => p.province === selectedProvince);
            if (["drought", "pest_outbreak"].includes(monitoringInfo?.risk_reason)) {
                setContextualCondition(monitoringInfo.risk_reason);
            } else {
                setContextualCondition(null);
            }
        }
    }, [selectedProvince, mapInstance, mapData]);

    // --- [FUNGSI DIPERBARUI] Menggunakan exceljs untuk ekspor ---
    const handleExport = async (format) => {
        const cleanEmoji = (text) => text.replace(/[^\x00-\x7F]/g, '').trim();

        const reportData = mapData.monitoring.map(m => ({
            Provinsi: m.province,
            Aktivitas_Dominan: m.dominant_activity,
            Level_Risiko: m.risk_level,
            Alasan_Risiko: m.risk_reason_display,
            Status_Panen: mapData.harvest.find(h => h.province === m.province)?.harvesting_now
                .map(item => cleanEmoji(item))
                .join(', ') || 'N/A',
            Suhu: mapData.weather[m.province]?.temperature || 'N/A',
            pH_Tanah: mapData.soil[m.province]?.ph_level || 'N/A',
        }));

        if (reportData.length === 0) {
            alert("Tidak ada data untuk diekspor.");
            return;
        }

        if (format === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Laporan Monitoring");

            // Menyiapkan header
            worksheet.columns = Object.keys(reportData[0]).map(key => ({
                header: key.replace(/_/g, ' '),
                key: key,
                width: 25,
            }));
            
            // Menambahkan data
            worksheet.addRows(reportData);

            // Membuat file dan men-download
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "Laporan_Monitoring_Nasional.xlsx";
            link.click();
            URL.revokeObjectURL(link.href);

        } else if (format === 'pdf') {
            const doc = new jsPDF();
            doc.text("Laporan Monitoring & Komoditas Nasional", 14, 15);

            autoTable(doc, {
                startY: 20,
                head: [Object.keys(reportData[0]).map(k => k.replace(/_/g, ' '))],
                body: reportData.map(Object.values),
                styles: { fontSize: 8 },
                headStyles: { fillColor: [22, 163, 74] },
            });

            doc.save("Laporan_Monitoring_Nasional.pdf");
        }
    };
    
    // --- [RENDER DIPERBARUI] Menggunakan Popup, bukan Tooltip ---
    const renderProvinceMarkers = () => (
        mapData.harvest.map(province => {
            const monitoring = mapData.monitoring.find(m => m.province === province.province) || {};
            const weather = mapData.weather[province.province] || {};
            const soil = mapData.soil[province.province] || {};
            
            let pathOptions = { fillOpacity: 0.8, weight: 2, radius: 10 };
            switch (monitoring.risk_level) {
                case "Tinggi": pathOptions.color = '#ef4444'; pathOptions.fillColor = '#fca5a5'; break;
                case "Sedang": pathOptions.color = '#f97316'; pathOptions.fillColor = '#fdba74'; break;
                default: pathOptions.color = '#22c55e'; pathOptions.fillColor = '#86efac'; break;
            }

            return (
                <CircleMarker key={province.province} center={province.coords} pathOptions={pathOptions} eventHandlers={{ click: () => setSelectedProvince(province.province) }}>
                    <Popup>
                        <div className="font-sans w-64">
                            <h3 className="font-bold text-base mb-2 border-b pb-1">{province.province}</h3>
                            <div className="space-y-2 text-xs">
                                <p className="font-bold text-gray-700 flex items-center gap-1"><Info size={13}/>Status Lahan</p>
                                <p className="flex items-center gap-1.5 pl-1"><ShieldAlert size={13}/>Risiko: <span className="font-semibold">{monitoring.risk_level} ({monitoring.risk_reason_display})</span></p>
                                <p className="flex items-center gap-1.5 pl-1"><Activity size={13}/>Aktivitas: <span className="font-semibold">{monitoring.dominant_activity}</span></p>
                                
                                <p className="font-bold text-gray-700 flex items-center gap-1 pt-1"><Sprout size={13}/>Status Panen</p>
                                <p className="pl-1">{province.harvesting_now.join(', ')}</p>

                                <p className="font-semibold pt-1">🌡️ Suhu: {weather.temperature}, 💧 Kelembaban: {weather.humidity}</p>
                                <p className="font-semibold">🌿 pH Tanah: {soil.ph_level}, 💧 Kelembaban: {soil.moisture}</p>
                            </div>
                        </div>
                    </Popup>
                </CircleMarker>
            );
        })
    );

    const renderPestMarkers = () => (
        activeLayers.pests && mapData.pests.map(pest => (
            <CircleMarker key={pest.id} center={pest.coords} radius={8} pathOptions={{ color: '#ef4444', fillColor: '#fca5a5', fillOpacity: 0.8, weight: 2 }} eventHandlers={{ click: () => setContextualCondition('pest_outbreak') }}>
                <Popup>
                    <div className="font-sans">
                        <p className="font-bold flex items-center gap-1"><Bug size={14}/> Wabah Terdeteksi</p>
                        <p>Jenis: {pest.pest_name}</p>
                        <p>Level: {pest.severity}</p>
                    </div>
                </Popup>
            </CircleMarker>
        ))
    );

    return (
        <div className="flex h-screen w-screen bg-gray-50">
            <div className="max-w sm:max-w-sm w-full p-6 bg-white shadow-lg overflow-y-auto flex-shrink-0">
                <div className="flex items-center gap-3">
                    <MapPin className="w-8 h-8 text-emerald-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Pemetaan Nasional</h1>
                        <p className="text-sm text-gray-500">Monitoring lahan & komoditas.</p>
                    </div>
                </div>
                
                <div className="space-y-6 mt-8">
                    
                    <div className="sm:hidden">
                        <Drawer>
                            <DrawerTrigger asChild>
                                <Button className="w-full rounded primary-bg">Mulai Monitoring</Button>
                            </DrawerTrigger>
                            <DrawerContent className="sm:hidden rounded-t-xl p-4">

                                <div className='block sm:hidden'>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Fokus Provinsi</label>
                                    <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent className="max-h-60">
                                            {mapData.harvest.map(p => <SelectItem key={p.province} value={p.province}>{p.province}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className='block sm:hidden'>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter Komoditas</label>
                                    <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
                                        <SelectTrigger><SelectValue placeholder="Pilih komoditas..." /></SelectTrigger>
                                        <SelectContent>
                                            {commodityOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className='block sm:hidden'>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Layer Tambahan</label>
                                    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50">
                                        <Checkbox id="pests" checked={activeLayers.pests} onCheckedChange={() => setActiveLayers(prev => ({...prev, pests: !prev.pests}))} />
                                        <label htmlFor="pests" className="text-sm font-medium leading-none flex-grow cursor-pointer">Tampilkan Wabah Hama</label>
                                    </div>
                                </div>

                                {/* ✅ Close Button */}
                                <DrawerClose asChild>
                                <Button className="w-full  rounded primary-bg mt-6">Terapkan</Button>
                                </DrawerClose>
                            </DrawerContent>
                        </Drawer>
                        </div>
                    {/* [FITUR BARU] Filter Komoditas */}

                    <div className='hidden sm:block'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fokus Provinsi</label>
                        <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent className="max-h-60">
                                {mapData.harvest.map(p => <SelectItem key={p.province} value={p.province}>{p.province}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='hidden sm:block'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter Komoditas</label>
                        <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
                            <SelectTrigger><SelectValue placeholder="Pilih komoditas..." /></SelectTrigger>
                            <SelectContent>
                                {commodityOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='hidden sm:block'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Layer Tambahan</label>
                        <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50">
                            <Checkbox id="pests" checked={activeLayers.pests} onCheckedChange={() => setActiveLayers(prev => ({...prev, pests: !prev.pests}))} />
                            <label htmlFor="pests" className="text-sm font-medium leading-none flex-grow cursor-pointer">Tampilkan Wabah Hama</label>
                        </div>
                    </div>
                    
                    <div className="block sm:hidden h-[28rem] w-full mb-6 rounded-md overflow-hidden relative z-0">
                        <MapContainer
                            center={[-2.5489, 118.0149]}
                            zoom={5}
                            zoomControl={false}
                            style={{ height: '100%', width: '100%' }}
                            whenCreated={setMapInstance}
                        >
                            {/* Map Layers */}
                            <ZoomControl position="topright" />
                            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Tiles © Esri" />
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png" pane="shadowPane" />
                            {renderProvinceMarkers()}
                            {renderPestMarkers()}
                            <LegendControl />
                        </MapContainer>
                    </div>

                    {/* [FITUR BARU] Ekspor Laporan */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ekspor Laporan</label>
                        <div className="flex items-center gap-2">
                             <Button onClick={() => handleExport('pdf')} variant="outline" className="w-full text-red-600 hover:text-red-700"><FileDown size={16} className="mr-2"/>PDF</Button>
                             <Button onClick={() => handleExport('excel')} variant="outline" className="w-full text-green-600 hover:text-green-700"><FileDown size={16} className="mr-2"/>Excel</Button>
                        </div>
                    </div>
                    
                    <ContextualHelpPanel condition={contextualCondition} onClose={() => setContextualCondition(null)} />
                </div>
            </div>

            <div className="hidden sm:block flex-grow h-full bg-gray-200">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full"><Loader2 className="w-12 h-12 animate-spin text-emerald-600" /></div>
                ) : (
                    <MapContainer center={[-2.5489, 118.0149]} zoom={5} zoomControl={false} style={{ height: '100%', width: '100%' }} whenCreated={setMapInstance}>
                        <ZoomControl position="topright" />
                        <TileLayer url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' attribution='Tiles © Esri' />
                        <TileLayer url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png' pane="shadowPane" />
                        
                        {renderProvinceMarkers()}
                        {renderPestMarkers()}
                        <LegendControl />
                    </MapContainer>
                )}
            </div>
        </div>
    );
};

export default CommodityMap;