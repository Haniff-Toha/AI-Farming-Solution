import { useNavigate } from "react-router-dom";
import Service from "./components/Service";
import Test from "./components/Navbar";

function Homepage() {


  return (
    <div className="overflow-x-hidden w-full bg-gray-50">
      <Test />
      <Service />
    </div>
  );
}

export default Homepage;
