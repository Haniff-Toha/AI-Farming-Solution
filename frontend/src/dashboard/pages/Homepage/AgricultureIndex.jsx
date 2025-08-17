import { useState } from "react";
import { Loader2 } from "lucide-react";

const AgricultureIndex = () => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative min-h-screen h-screen bg-gradient-to-br px-4 sm:px-6 lg:px-8 py-10 z-0">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="flex items-center gap-2 text-gray-700 text-sm font-medium">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading Mitigasi Lingkungan Map...
          </div>
        </div>
      )}

      <iframe
        src="http://localhost:5002/agriculture_index"
        title="Agriculture Index Map"
        width="100%"
        height="100%"
        style={{ border: "none", height: "100%", width: "100%" }}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};

export default AgricultureIndex;