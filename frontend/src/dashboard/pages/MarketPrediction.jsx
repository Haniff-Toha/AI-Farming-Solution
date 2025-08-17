import { Tabs } from "@/components/ui/tabs";
import MarketPredictionRegion from "./MarketPredition/MarketPredictionRegion";
import MarketPredictionNational from "./MarketPredition/MarketPredictionNasional";

const MarketPrediction = () => {

    const tabs = [
        {
        title: "National",
        value: "Market National",
        content: (
            <MarketPredictionNational />
        )
        },
        {
        title: "Region",
        value: "Market Region",
        content: (
            <MarketPredictionRegion />
        )}
    ];

    return (
        <div className="px-6 md:px-8 py-4 bg-gray-100 min-h-screen">
            <Tabs tabs={tabs} />
        </div>
    );
};

export default MarketPrediction;