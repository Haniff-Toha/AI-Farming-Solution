import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import HomeIcon from '../../assets/icons/cloud.svg?react';
import ChatIcon from '../../assets/icons/robot.svg?react';
import AnalysisIcon from '../../assets/icons/plant.svg?react';
import MapIcon from '../../assets/icons/map.svg?react';
import MoreIcon from '../../assets/icons/dots.svg?react';

import HomeActiveIcon from '../../assets/icons/home-active.svg?react';
import ChatActiveIcon from '../../assets/icons/bot-active.svg?react';
import AnalysisActiveIcon from '../../assets/icons/analysis-active.svg?react';
import MapActiveIcon from '../../assets/icons/map-active.svg?react';
import MoreActiveIcon from '../../assets/icons/dots-active.svg?react';

import MarketIcon from '../../assets/icons/diagram.svg?react';
import FertilizerIcon from '../../assets/icons/crop.svg?react';
import RecommenderIcon from '../../assets/icons/leaf.svg?react';
import YieldIcon from '../../assets/icons/plantsmall.svg?react';
import InventoryIcon from '../../assets/icons/garage.svg?react';

import MarketActiveIcon from '../../assets/icons/diagram-active.svg?react';
import FertilizerActiveIcon from '../../assets/icons/crop-active.svg?react';
import RecommenderActiveIcon from '../../assets/icons/plantsmall-active.svg?react';
import YieldActiveIcon from '../../assets/icons/leaf-active.svg?react';
import InventoryActiveIcon from '../../assets/icons/garage-active.svg?react';

import {
  MapPinned,
  Ruler,
  Leaf,
  TrendingUp,
} from "lucide-react";

const BottomNavbar = () => {
  const [showMore, setShowMore] = useState(false);
  const [showMapMenu, setShowMapMenu] = useState(false);

  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <>
      {/* Slide-up More Menu */}
      {showMore && (
        <div className="fixed bottom-16 left-0 right-0 z-50">
          <div className="bg-white rounded-t-2xl shadow-lg border-t border-gray-200 py-4">
            <div
              className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer"
              onClick={() => setShowMore(false)}
            ></div>
            <div className="grid grid-cols-5 gap-4 text-center text-xs text-gray-700">
              <MoreMenuItem
                icon={<MarketIcon  className="w-6 h-6"/>} 
                activeIcon={<MarketActiveIcon className="w-6 h-6"  />}
                label="Market"
                to="/market"
                active={currentPath === "/market"}
              />
              <MoreMenuItem
                icon={<FertilizerIcon  className="w-6 h-6"/>} 
                activeIcon={<FertilizerActiveIcon className="w-6 h-6"  />}
                label="Fertilizers"
                to="/fertilizers"
                active={currentPath === "/fertilizers"}
              />
              <MoreMenuItem
                icon={<RecommenderIcon  className="w-6 h-6"/>} 
                activeIcon={<RecommenderActiveIcon className="w-6 h-6"  />}
                label="Recommender"
                to="/crop-recommendation"
                active={currentPath === "/crop-recommendation"}
              />
              <MoreMenuItem
                icon={<YieldIcon  className="w-6 h-6"/>}
                activeIcon={<YieldActiveIcon className="w-6 h-6"  />} 
                label="Yield"
                to="/yield"
                active={currentPath === "/yield"}
              />
              <MoreMenuItem
                icon={<InventoryIcon  className="w-6 h-6"/>}
                activeIcon={<InventoryActiveIcon className="w-6 h-6"  />}  
                label="Inventory"
                to="/inventory"
                active={currentPath === "/inventory"}
              />
            </div>
          </div>
        </div>
      )}

      {showMapMenu && (
        <div className="fixed bottom-16 left-0 right-0 z-50">
          <div className="bg-white rounded-t-2xl shadow-lg border-t border-gray-200 py-4">
            <div
              className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer"
              onClick={() => setShowMapMenu(false)}
            ></div>
            <div className="grid grid-cols-4 gap-4 text-center text-xs text-gray-700">
              <MoreMenuMapItem
                icon={<MapPinned className="w-6 h-6" />}
                label="Commodity"
                to="/commodity"
                active={currentPath === "/commodity"}
              />
              <MoreMenuMapItem
                icon={<Ruler className="w-6 h-6" />}
                label="Area Planning"
                to="/areaplanning"
                active={currentPath === "/areaplanning"}
              />
              <MoreMenuMapItem
                icon={<Leaf className="w-6 h-6" />}
                label="Mitigasi Lingkungan"
                to="/agricultureindex"
                active={currentPath === "/agricultureindex"}
              />
              <MoreMenuMapItem
                icon={<TrendingUp className="w-6 h-6" />}
                label="Index Panen"
                to="/indexpanen"
                active={currentPath === "/indexpanen"}
              />
            </div>
          </div>
        </div>
      )}
      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-md flex justify-around items-center h-16 md:hidden z-50 ">
        <NavItem
          icon={<HomeIcon className="w-6 h-6" />}
          activeIcon={<HomeActiveIcon className="w-6 h-6"  />}
          label="Home"
          to="/dashboard"
          active={currentPath === "/dashboard"}
        />
        <NavItem
          icon={<ChatIcon className="w-6 h-6" />}
          activeIcon={<ChatActiveIcon className="w-6 h-6"  />}
          label="Chatbot"
          to="/bot"
          active={currentPath === "/bot"}
        />
        <NavItem
          icon={<AnalysisIcon className="w-6 h-6" />}
          activeIcon={<AnalysisActiveIcon className="w-6 h-6"  />}
          label="Analysis"
          to="/diseases"
          active={currentPath === "/diseases"}
        />
        <NavItem
          icon={<MapIcon className="w-6 h-6" />}
          activeIcon={<MapActiveIcon className="w-6 h-6" />}
          label="Map"
          onClick={() => {
            setShowMapMenu(prev => !prev);
            setShowMore(false); // Hide More menu if open
          }}
          active={showMapMenu}
        />
        <NavItem
          icon={<MoreIcon className="w-6 h-6" />}
          activeIcon={<MoreActiveIcon className="w-6 h-6"  />}
          label="More"
          onClick={() => {
            setShowMore(prev => !prev);
            setShowMapMenu(false);
          }}
          active={showMore}
        />
      </nav>
    </>
  );
};

const NavItem = ({ icon, activeIcon, label, to, onClick, active }) => {
  const navigate = useNavigate();
  const displayedIcon = active && activeIcon ? activeIcon : icon;
  
  return (
    <button
      onClick={() => {
        if (to) navigate(to);
        if (onClick) onClick();
      }}
      className={`flex flex-col items-center justify-center text-xs ${
        active ? 'primary-tc' : 'text-gray-600'
      } hover:primary-tc focus:outline-none`}
    >
      {React.cloneElement(displayedIcon, {
        className: `w-6 h-6 ${active ? 'primary-tc' : 'text-gray-600'}`
      })}
      <span className='mt-1'>{label}</span>
    </button>
  );
};

const MoreMenuItem = ({ icon, activeIcon, label, to, onClick, active }) => {
  const navigate = useNavigate();
  const displayedIcon = active && activeIcon ? activeIcon : icon;


  return (
    <button
      onClick={() => {
        if (to) navigate(to);
        if (onClick) onClick();
      }}
      className={`flex flex-col items-center justify-center text-xs w-full bg-transparent border-none p-0 m-0 appearance-none focus:outline-none ${
        active ? 'primary-tc' : 'text-gray-600'
      } hover:primary-tc`}
    >
      <div
        className={`${
          active ? 'border-transparent' : 'p-3 rounded-md mb-1 bg-gray-200'
        }`}
      >
        {React.cloneElement(displayedIcon, {
          className: `${active ? 'primary-tc w-[3.37rem] h-[3.37rem] ' : 'text-gray-600 w-6 h-6 '}`
        })}
      </div>
      <span>{label}</span>
    </button>
  );
};

const MoreMenuMapItem = ({ icon, label, to, onClick, active }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => {
        if (to) navigate(to);
        if (onClick) onClick();
      }}
      className={`flex flex-col items-center justify-center text-xs w-full bg-transparent border-none p-0 m-0 appearance-none focus:outline-none ${
        active ? 'primary-tc' : 'text-gray-600'
      } hover:primary-tc`}
    >
      <div
        className={`p-3 rounded-md mb-1  ${active ? 'second-bg' : 'bg-gray-200'}`}
      >
        {React.cloneElement(icon, {
          className: `w-6 h-6  ${active ? 'primary-tc' : 'text-gray-600'}`
        })}
      </div>
      <span>{label}</span>
    </button>
  );
};



export default BottomNavbar;
