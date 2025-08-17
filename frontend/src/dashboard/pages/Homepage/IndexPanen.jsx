import { useState } from "react";
import { Loader2 } from "lucide-react";

const IndexPanen = () => {

  const [loading, setLoading] = useState(true);
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 bg-gradient-to-br min-h-screen h-screen relative z-0">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="flex items-center gap-2 text-gray-700 text-sm font-medium">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading Index Panen Map...
          </div>
        </div>
      )}
      <iframe
        src="http://localhost:5002/indexpanen"
        width="100%"
        height="100%"
        title="External Site"
        style={{ border: "none", height: "100%", width: "100%" }}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};

export default IndexPanen;