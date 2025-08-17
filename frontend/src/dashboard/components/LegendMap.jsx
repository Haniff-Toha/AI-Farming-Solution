import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const LegendControl = () => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const legend = L.control({ position: 'bottomleft' });

        legend.onAdd = () => {
          const div = L.DomUtil.create("div", "leaflet-legend");
          div.innerHTML = `
            <div style="
              margin: 0 1rem 1rem 1rem; /* left, bottom, right margin */
              padding: 10px;
              background: white;
              border-radius: 6px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              font-size: 12px;
            ">
              <strong>Risiko Status Lahan</strong><br/>
              <div style="margin-top: 6px;">
                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                  <span style="width: 12px; height: 12px; background: green; display: inline-block; margin-right: 6px; border-radius: 2px;"></span>
                  Rendah
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                  <span style="width: 12px; height: 12px; background: orange; display: inline-block; margin-right: 6px; border-radius: 2px;"></span>
                  Sedang
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="width: 12px; height: 12px; background: red; display: inline-block; margin-right: 6px; border-radius: 2px;"></span>
                  Tinggi
                </div>
                
              </div>
            </div>
          `;
          return div;
        };

        legend.addTo(map);

        // Cleanup function to remove the legend when the component unmounts
        return () => {
            legend.remove();
        };
    }, [map]);

    return null; // This component doesn't render any JSX
};

export default LegendControl;