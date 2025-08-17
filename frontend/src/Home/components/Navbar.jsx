import React from "react";
import Typewriter from "typewriter-effect";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/auth");
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#023020] via-[#386641] to-[#A7C957] text-white overflow-hidden">
      <div className="container mx-auto px-6 pb-20">
        {/* Navbar */}
        <nav className="py-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl font-bold tracking-wider"
            >
              <div className="flex items-center">
                <img src="/logo.png" alt="MyApp Logo" className="h-16 sm:h-20 w-auto pt-2 mr-5" />
                <img src="/logo-white.png" alt="MyApp Logo" className="h-16 sm:h-20 w-auto" />
              </div>
            </motion.div>
            <motion.button
              onClick={handleLoginClick}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="px-3 py-2 text-sm sm:px-5 sm:py-2 sm:text-base bg-lime-400 text-green-900 font-semibold rounded-full hover:bg-lime-300 transition-all duration-300 shadow-lg hover:shadow-lime-400/50"
            >
              Masuk / Daftar
            </motion.button>
          </div>
        </nav>

        <div className="flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-88px)] gap-10 lg:gap-20">

          {/* Konten Kiri */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-extrabold leading-tight">
                Tumbuh Bersama <br />
                <span className="text-lime-300">Tanah Air</span>
              </motion.h1>

              <motion.div variants={itemVariants} className="h-20 flex items-center justify-center lg:justify-start">
                <div className="text-xl lg:text-2xl text-lime-200 font-light">
                  <Typewriter
                    options={{
                      strings: [
                        "Inovasi untuk Petani Nusantara",
                        "Menjaga Warisan, Meraih Masa Depan",
                        "Teknologi untuk Panen Melimpah",
                        "Menghubungkan Petani dengan Pasar",
                        "Pertanian Presisi, Kesejahteraan Pasti",
                      ],
                      autoStart: true,
                      loop: true,
                      deleteSpeed: 30,
                      delay: 70,
                      cursor: "_",
                      wrapperClassName: "typewriter-wrapper",
                    }}
                  />
                </div>
              </motion.div>

              <motion.p variants={itemVariants} className="text-lg text-gray-200 max-w-xl mx-auto lg:mx-0">
                JadiTani.id adalah sahabat digital Anda. Kami hadir untuk memberdayakan petani Indonesia dengan data akurat dan teknologi canggih, demi kedaulatan pangan dan kesejahteraan bangsa.
              </motion.p>

              <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 mt-8 text-center">
                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                  <div className="text-3xl font-bold text-lime-300">98%</div>
                  <div className="text-gray-300 text-sm">Akurasi Prediksi</div>
                </div>
                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                  <div className="text-3xl font-bold text-lime-300">15Rb+</div>
                  <div className="text-gray-300 text-sm">Petani Terhubung</div>
                </div>
                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                  <div className="text-3xl font-bold text-lime-300">40%</div>
                  <div className="text-gray-300 text-sm">Efisiensi Air</div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Bagian Gambar */}
          <div className="w-full lg:w-1/2 h-[400px] lg:h-[650px] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-black/30"
            >
              <img
                src="/images/petani-modern.jpeg" 
                alt="Ilustrasi Pertanian Modern Indonesia"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;