/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ScanSearch, Bot, Leaf, TestTube2, BarChart3, CloudSun } from 'lucide-react';

import deteksiPenyakit from '/images/deteksi-penyakit.jpg';
import asistenAi from '/images/asisten-ai.jpg';
import rekomendasiTanaman from '/images/rekomendasi-tanaman.jpg';
import rekomendasiPupuk from '/images/rekomendasi-pupuk.jpg';
import prediksiPanen from '/images/prediksi-panen.jpg';
import prakiraanCuaca from '/images/prakiraan-cuaca.jpg';

const servicesData = [
  {
    id: 1,
    title: "Deteksi Penyakit Tanaman",
    description: "Ambil foto tanaman Anda untuk mengidentifikasi penyakit secara cepat dan akurat. AI kami akan memberikan diagnosis dan solusi penanganan yang efektif.",
    icon: <ScanSearch className="text-green-500" size={28} />,
    image: deteksiPenyakit,
  },
  {
    id: 2,
    title: "Asisten AI JadiTani",
    description: "Tanyakan apapun seputar pertanian kepada asisten virtual kami. Dapatkan jawaban instan dan panduan terpersonalisasi untuk setiap masalah pertanian Anda.",
    icon: <Bot className="text-purple-500" size={28} />,
    image: asistenAi,
  },
  {
    id: 3,
    title: "Rekomendasi Tanaman",
    description: "Dapatkan rekomendasi jenis tanaman yang paling cocok untuk ditanam berdasarkan kondisi tanah, cuaca, dan lokasi lahan Anda untuk hasil yang optimal.",
    icon: <Leaf className="text-lime-500" size={28} />,
    image: rekomendasiTanaman,
  },
  {
    id: 4,
    title: "Rekomendasi Pupuk",
    description: "AI kami akan menganalisis kebutuhan nutrisi tanaman Anda dan memberikan rekomendasi dosis serta jenis pupuk yang paling efisien dan tepat.",
    icon: <TestTube2 className="text-orange-500" size={28} />,
    image: rekomendasiPupuk,
  },
  {
    id: 5,
    title: "Prediksi Hasil Panen",
    description: "Perkirakan jumlah hasil panen Anda dengan teknologi prediksi kami. Bantu Anda dalam merencanakan penjualan dan strategi pasca-panen.",
    icon: <BarChart3 className="text-yellow-500" size={28} />,
    image: prediksiPanen,
  },
  {
    id: 6,
    title: "Prakiraan Cuaca Akurat",
    description: "Akses prakiraan cuaca khusus untuk pertanian. Dapatkan peringatan dini dan rencanakan aktivitas tanam Anda dengan lebih baik untuk menghindari risiko gagal panen.",
    icon: <CloudSun className="text-blue-500" size={28} />,
    image: prakiraanCuaca,
  },
];


const ServiceItem = ({ image, icon, title, description, isReversed }) => (
  <div
    className={`flex flex-col md:flex-row ${isReversed ? 'md:flex-row-reverse' : ''} items-center gap-10 mb-20`}
    data-aos={isReversed ? "fade-left" : "fade-right"}
    data-aos-duration="1000"
    data-aos-once="true"
  >
    {/* Image Section */}
    <div className="w-full md:w-1/2">
      <img
        src={image}
        alt={title}
        className="w-full h-80 object-cover rounded-2xl shadow-lg"
        loading="lazy"
      />
    </div>

    {/* Text Section */}
    <div className={`w-full md:w-1/2 px-4 ${isReversed ? 'md:pr-12' : 'md:pl-12'}`}>
      <div className="flex items-center mb-4">
        <span className="text-lime-600">{icon}</span>
        <h3 className="text-2xl md:text-3xl font-bold ml-4 text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-600 text-lg leading-relaxed tracking-wide">
        {description}
      </p>
    </div>
  </div>
);

const Service = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <div id="services" className="container mx-auto py-20 px-4 bg-gray-50">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-800" data-aos="fade-up">
          Fitur Unggulan JadiTani.id
        </h2>
        <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="100">
          Teknologi canggih di genggaman Anda untuk pertanian yang lebih cerdas dan produktif.
        </p>
      </div>
      
      <div>
        {servicesData.map((service, index) => (
          <ServiceItem
            key={service.id}
            image={service.image}
            icon={service.icon}
            title={service.title}
            description={service.description}
            isReversed={index % 2 !== 0} 
          />
        ))}
      </div>
    </div>
  );
}

export default Service;