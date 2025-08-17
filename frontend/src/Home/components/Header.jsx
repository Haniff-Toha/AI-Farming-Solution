import {
  User,
  Power,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Header = () => {

  const navigate = useNavigate(); //

  const handleLogout = () => {
    window.localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  return (
    <header className="px-4 py-3 fixed top-0 left-0 w-full z-50 bg-white header-mobile">
      <div className="flex items-center justify-between">
        <Link to="/dashboard">
        <div className="flex items-center justify-center">
          <img src="/logo.png" alt="MyApp Logo" className="h-12 w-auto w-auto pt-2 mr-5" />
          <img src="/logo.png" alt="MyApp Logo" className="h-12 w-auto" />
        </div>
        </Link>
        <div>
        <div className="flex flex-row items-center gap-3">
          <Link to={"/profile"}>
            <div className="flex items-center">
              <Avatar className="h-8 w-8 border-2 border-white">
                <AvatarImage
                  src="https://wp.alithemes.com/html/evara/evara-frontend/assets/imgs/page/avatar-6.jpg"
                  alt="User avatar"
                />
                <AvatarFallback>
                  <User size={15} className="text-gray-400" />
                </AvatarFallback>
              </Avatar>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
          >
            <Power
              size={15}
              strokeWidth={1.5}
              className="text-red-700 cursor-pointer"
            />
          </button>
        </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
