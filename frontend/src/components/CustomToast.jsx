import { toast } from "@/components/ui/use-toast";
import { CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";

// Icon mapping
const icons = {
  success: <CheckCircle className="w-5 h-5 shrink-0" />,
  info: <Info className="w-5 h-5 shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 shrink-0" />,
  danger: <XCircle className="w-5 h-5 shrink-0" />,
};

// Toast function
export const showToast = (type, title, description) => {
  toast({
    title: (
      <div className="flex items-center gap-2">
        {icons[type]}
        <span>{title}</span>
      </div>
    ),
    description,
    duration: 5000,
    className: `toast-base toast-${type}`,
  });
};