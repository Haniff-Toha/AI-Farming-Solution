import React from 'react';
import { Sun, CloudRain, Wind, Thermometer, RefreshCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import WeatherLineChart from './WeatherLineChart';
import WeatherAreaChart from './WeatherAreaChart';
import WeatherBarChart from './WeatherBarChart';
import WeatherComposedChart from './WeatherCharts';

const getGradientClass = (type) => {
  const gradients = {
    temperature: 'from-red-50 to-rose-100',
    humidity: 'from-blue-50 to-blue-100',
    wind: 'from-purple-50 to-purple-100',
    max: 'from-orange-50 to-amber-100'
  };
  return gradients[type] || 'from-gray-50 to-gray-100';
};

const StatCard = ({ title, value, icon: Icon, color, type }) => {
  const gradientClass = getGradientClass(type);
  
  return (
    <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-40 group-hover:opacity-50 transition-opacity`} />
      
      <div className="relative p-6 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">{title}</h3>
          <Icon className={`w-6 h-6 ${color} group-hover:scale-110 transition-transform duration-300`} />
        </div>
        
        <div className="flex items-baseline space-x-2">
          <span className="text-md sm:text-3xl font-bold text-gray-900">{value}</span>
        </div>
      </div>
    </Card>
  );
};

const ChartContainer = ({ children, title }) => (
  <div className="transform transition-all duration-300 hover:scale-[1.01] hover:shadow-xl rounded-xl overflow-hidden bg-white bg-opacity-90 backdrop-blur-xl p-6">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
    {children}
  </div>
);

const WeatherDashboard = ({ forecastData }) => {
  const averageTemp = Math.round(forecastData.reduce((acc, curr) => acc + curr.temp, 0) / forecastData.length);
  const averageHumidity = Math.round(forecastData.reduce((acc, curr) => acc + curr.humidity, 0) / forecastData.length);
  const averageWind = Math.round(forecastData.reduce((acc, curr) => acc + curr.windSpeed, 0) / forecastData.length);
  const maxTemp = Math.max(...forecastData.map(d => d.temp));

  return (
    <div className="min-h-0 sm:min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div>
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Weather Dashboard
          </h1>
          <p className="text-md sm:text-lg  text-gray-600 max-w-2xl mx-auto">
            Real-time weather metrics and comprehensive analysis
          </p>
        </div>

        {/* Stats Section */}
        <div className="mb-12">
          {/* Grid for screens 451px and up */}
          <div className="hidden [@media(min-width:451px)]:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard 
              title="Average Temperature"
              value={`${averageTemp}°F`}
              icon={Thermometer}
              color="text-red-600"
              type="temperature"
            />
            <StatCard 
              title="Average Humidity"
              value={`${averageHumidity}%`}
              icon={CloudRain}
              color="text-blue-600"
              type="humidity"
            />
            <StatCard 
              title="Average Wind Speed"
              value={`${averageWind} mph`}
              icon={Wind}
              color="text-purple-600"
              type="wind"
            />
            <StatCard 
              title="Max Temperature"
              value={`${parseFloat(maxTemp).toFixed(2)}°F`}
              icon={Sun}
              color="text-orange-600"
              type="max"
            />
          </div>

          {/* Slider for screens under 450px */}
          <div className="[@media(min-width:451px)]:hidden relative px-2 -mx-2 ">
            <div className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar">
              {[
                {
                  title: "Average Temperature",
                  value: `${averageTemp}°F`,
                  icon: Thermometer,
                  color: "text-red-600",
                  type: "temperature"
                },
                {
                  title: "Average Humidity",
                  value: `${averageHumidity}%`,
                  icon: CloudRain,
                  color: "text-blue-600",
                  type: "humidity"
                },
                {
                  title: "Average Wind Speed",
                  value: `${averageWind} mph`,
                  icon: Wind,
                  color: "text-purple-600",
                  type: "wind"
                },
                {
                  title: "Max Temperature",
                  value: `${parseFloat(maxTemp).toFixed(2)}°F`,
                  icon: Sun,
                  color: "text-orange-600",
                  type: "max"
                }
              ].map((item, index) => (
                <div key={index} className="min-w-[55%] snap-center shrink-0">
                  <StatCard 
                    title={item.title}
                    value={item.value}
                    icon={item.icon}
                    color={item.color}
                    type={item.type}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-1 d-none-small">
          <ChartContainer title="Temperature Trends">
            <WeatherLineChart data={forecastData} />
          </ChartContainer>
          <ChartContainer title="Humidity Analysis">
            <WeatherAreaChart data={forecastData} />
          </ChartContainer>
          <ChartContainer title="Wind Speed Distribution">
            <WeatherBarChart data={forecastData} />
          </ChartContainer>
          <ChartContainer title="Combined Weather Metrics">
            <WeatherComposedChart data={forecastData} />
          </ChartContainer>
        </div>

        {/* Footer Section */}
        <div className="flex items-center justify-center space-x-2 text-gray-600 text-sm bg-white bg-opacity-50 backdrop-blur-sm py-4  rounded-xl shadow-sm">
          <RefreshCcw className="w-4 h-4 animate-spin" />
          <p>Last updated: {new Date().toLocaleTimeString()} • Data refreshes hourly</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;