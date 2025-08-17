import React, { useRef, useState } from "react";
import {
  ChevronRight,
  ChevronLeft, 
  Bot,
  Worm,
  Crop,
  Flashlight,
  User,
  Power,
  Warehouse,
  VeganIcon,
  WheatIcon,
  ChartBarIcon,
  MapIcon,
  ChevronDown,
  MapPinned,
  Ruler,
  Leaf,
  TrendingUp,
} from "lucide-react";
import { Route, Routes, Link, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import Dashboard from "./pages/Homepage/Dashboard";
import ChatbotUI from "./pages/chatbot";
import MarketUI from "./pages/MarketPrediction";
import CommodityUI from "./pages/CommodityMap";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import FarmerProfile from "./pages/ProfilePage";
import { CloudSunRain } from "lucide-react";
import { Sprout } from "lucide-react";
import MedicalImageAnalysis from "./pages/diseasesDetection";
import CropRecommend from "./pages/CropRecommendation/CropRecommend";
import { FarmAnalytics } from "./pages/Contacts/Contact";
import FertilizerRecommend from "./pages/FertilizerRecommend/FertilizerRecommend";
import YieldPredict from "./pages/YieldPrediction/YieldPredict";
import Header from "@/Home/components/Header";
import BottomNavbar from "@/Home/components/BottomNavbar";
import AreaPlanning from "./pages/Homepage/AreaPlanning";
import AgricultureIndex from "./pages/Homepage/AgricultureIndex";
import IndexPanen from "./pages/Homepage/IndexPanen";

function Navbar() {
  const navigate = useNavigate(); // Initialize useNavigate hook at the top level
  const navRef = useRef(null);
  const [openSubmenus, setOpenSubmenus] = useState({});

  const toggleSubmenu = (label) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };
  const navItems = [
    { label: "Home", path: "/dashboard", icon: CloudSunRain },
    { label: "Diseases", path: "/diseases", icon: Sprout },
    { label: "Chatbot", path: "/bot", icon: Bot },
    { label: "Market", path: "/market", icon: ChartBarIcon },
    { 
      label: "Maps", 
      path: "/commodity", 
      icon: MapIcon,
      children: [
        { label: "Area Planning", path: "/areaplanning", icon: Ruler },
        { label: "Mitigasi Lingkungan", path: "/agricultureindex", icon: Leaf },
        { label: "Index Panen", path: "/indexpanen", icon: TrendingUp },
        { label: "Commodity Map", path: "/commodity", icon: MapPinned },
      ],
    },
    { label: "Prediksi Hasil Panen", path: "/yield", icon: WheatIcon },
    { label: "Rekomendasi Pupuk", path: "/fertilizers", icon:Crop},
    {
      label: "Rekomendasi Tanaman",
      path: "/crop-recommendation",
      icon: VeganIcon,
    },
    {
      label: "Inventory",
      path: "/inventory",
      icon: Warehouse,
    },
  ];
  const [isExpanded, setisExpanded] = useState(false);
  const [activeTab, setactiveTab] = useState(navItems[0].label);

  const handletogglebar = () => {
    setisExpanded(!isExpanded);
  };

  const handleLogout = () => {
    window.localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Header />
      <div
        ref={navRef}
        className={`h-screen bg-gray-50 flex flex-col border-r bg-gradient-to-r from-lightBlue-400 to-blue-800 shadow-md transition-all duration-300 ease-in-out fixed top-0 left-0 d-none-small ${
          isExpanded ? "w-64" : "w-20"
        } z-20`}
      >
        <button
          onClick={handletogglebar}
          className="absolute -right-3 top-20 transform bg-white rounded-full p-1 border border-gray-300 z-20 shadow-md hover:bg-gray-100 transition-colors duration-200"
        >
          {isExpanded ? (
            <ChevronLeft
              size={20}
              strokeWidth={1.5}
              className="text-gray-600"
            />
          ) : (
            <ChevronRight
              size={20}
              strokeWidth={1.5}
              className="text-gray-600"
            />
          )}
        </button>

        <div className=" flex items-center justify-center h-16 border-b border-gray-200">
          {/* <div className="h-10 w-10 bg-green-200 rounded-md border border-green-300 flex items-center justify-center">
            <span className="text-green-800 font-bold text-lg">A</span>
          </div> */}
          {isExpanded ?  
            <>
              <img src="/logo.png" alt="MyApp Logo" className="h-10 sm:h-12 w-auto pt-2 mr-5" />
              <img src="/logo.png" alt="MyApp Logo" className="h-10 sm:h-12 w-auto" />
            </>
          :  
            <img src="/favicon.png" alt="MyApp Logo" className="h-10 w-auto" />}
        </div>

        <div className="flex flex-col h-full overflow-y-auto hide-scrollbar">
          <nav className="flex flex-col items-center space-y-1 py-4">
            {navItems.map((item, index) => (
              item.children ? (
                <>
                  {/* PARENT MENU WITH CHILDREN */}
                  <div
                    onClick={() => toggleSubmenu(item.label)}
                    className={`cursor-pointer relative flex items-center hover:bg-gray-100 transition-colors duration-200 rounded-md
                      ${isExpanded ? "w-52 justify-start px-4" : "w-14 justify-center"}
                      ${activeTab === item.label ? "primary-tc" : "text-gray-600"}
                      py-3`}
                  >
                    <item.icon
                      size={20}
                      strokeWidth={1.5}
                      className={
                        activeTab === item.label ? "primary-tc" : "text-gray-500"
                      }
                    />
                    {isExpanded && (
                      <>
                        <span className="ml-4 text-sm font-medium whitespace-nowrap overflow-hidden flex-1">
                          {item.label}
                        </span>
                        {openSubmenus[item.label] ? (
                          <ChevronDown size={16} className="ml-auto text-gray-500" />
                        ) : (
                          <ChevronRight size={16} className="ml-auto text-gray-500" />
                        )}
                      </>
                    )}
                  </div>

                  {isExpanded && openSubmenus[item.label] && (
                    <div className="mt-1 flex flex-col space-y-1">
                      {item.children.map((subItem, subIndex) => {
                        const isActive = activeTab === subItem.label;

                        return (
                          <Link
                            key={subIndex}
                            to={subItem.path}
                            onClick={() => setactiveTab(subItem.label)}
                            className={`
                              group flex items-center gap-3 px-4 py-2 rounded-md cursor-pointer transition
                              ${isActive ? "bg-gray-100 primary-tc" : "hover:bg-gray-200 text-gray-600"}
                            `}
                          >
                            <subItem.icon
                              size={20}
                              strokeWidth={1.5}
                              className={`transition ${
                                isActive ? "primary-tc" : "group-hover:text-gray-700"
                              }`}
                            />
                            <span
                              className={`
                                text-sm font-medium transition
                                ${isActive ? "primary-tc" : "group-hover:text-gray-700"}
                              `}
                            >
                              {subItem.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <React.Fragment key={index}>
                  {index === 3 || index === 6 || index === 9 ? (
                    <div
                      className={`my-2 h-px bg-gray-300 ${
                        isExpanded ? "w-52" : "w-10"
                      }`}
                    ></div>
                  ) : null}
                  <Link
                    to={item.path}
                    className={`relative flex items-center hover:bg-gray-100 transition-colors duration-200 rounded-md
                      ${
                        isExpanded
                          ? "w-52 justify-start px-4"
                          : "w-14 justify-center"
                      }
                      ${
                        activeTab === item.label
                          ? "primary-tc"
                          : "text-gray-600"
                      }
                      py-3`}
                    onClick={() => setactiveTab(item.label)}
                  >
                    <item.icon
                      size={20}
                      strokeWidth={1.5}
                      className={
                        activeTab === item.label
                          ? "primary-tc"
                          : "text-gray-500"
                      }
                    />
                    {isExpanded && (
                      <span className="ml-4 text-sm font-medium whitespace-nowrap overflow-hidden">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </React.Fragment>
              )
            ))}
          </nav>

          <div className="flex-grow"></div>

          <div className="flex flex-col items-center justify-center gap-3">
            <button
              onClick={handleLogout}
              className="hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
            >
              <Power
                size={20}
                strokeWidth={1.5}
                className="text-red-700 cursor-pointer"
              />
            </button>

            <Link to={"/profile"}>
              {" "}
              <div className="p-4 border-t border-gray-200">
                <div
                  className={`flex items-center ${
                    isExpanded ? "px-4" : "justify-center"
                  }`}
                >
                  <Avatar className="h-10 w-10 border-2 border-white">
                    <AvatarImage
                      src="https://wp.alithemes.com/html/evara/evara-frontend/assets/imgs/page/avatar-6.jpg"
                      alt="User avatar"
                    />
                    <AvatarFallback>
                      <User className="h-6 w-6 text-gray-400" />
                    </AvatarFallback>
                  </Avatar>
                  {isExpanded && (
                    <div className="ml-3">
                      <p className="text-sm font-medium text-black">
                        Rafly Kanza
                      </p>
                      <p className="text-xs text-gray-300">raflykanza@gmail.com</p> 
                      
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <ScrollArea
        className={`flex-1 overflow-y-hidden transition-all duration-300 ${
          isExpanded ? "ml-64" : "ml-20"
        } ml-responsive`}
      >
        <main>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bot" element={<ChatbotUI />} />
            <Route path="/market" element={<MarketUI />} />
            <Route path="/commodity" element={<CommodityUI />} />
            <Route path="/yield" element={<YieldPredict />} />
            <Route path="/fertilizers" element={<FertilizerRecommend />} />
            <Route path="/diseases" element={<MedicalImageAnalysis />} />
            <Route path="/profile" element={<FarmerProfile />} />
            <Route path="/crop-recommendation" element={<CropRecommend />} />
            <Route path="/inventory" element={<FarmAnalytics />} />
            <Route path="/areaplanning" element={<AreaPlanning />} />
            <Route path="/agricultureindex" element={<AgricultureIndex />} />
            <Route path="/indexpanen" element={<IndexPanen />} />
          </Routes>
        </main>
      </ScrollArea>
      <BottomNavbar />
    </div>
  );
}
export default Navbar;
