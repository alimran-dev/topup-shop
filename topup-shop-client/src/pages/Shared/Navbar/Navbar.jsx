import { Link } from "react-router-dom";
import logo from "../../../assets/topup-logo-crop.png";

const Navbar = () => {
  return (
    <div className="flex items-center justify-between px-8 md:px-16 py-2 shadow">
      <div>
        <img src={logo} alt="" className="h-16 md:h-20" />
      </div>
      <div className="flex items-center justify-center gap-5">
        <div className="hidden md:block space-x-6">
          <Link to={"/topup"} className="font-semibold">
            Top-Up
          </Link>
          <Link to={"/contact"} className="font-semibold">
            Contact Us
          </Link>
        </div>
        <button className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 text-lg text-white font-semibold rounded">
          Login
        </button>
      </div>
    </div>
  );
};

export default Navbar;
