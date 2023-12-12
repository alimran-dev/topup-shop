import { Link, NavLink } from "react-router-dom";
import logo from "../../../assets/topup-logo-crop.png";
import "./Navbar.css";

const Navbar = () => {
  return (
    <div className="sticky top-0 left-0 z-20">
      <div className="flex items-center justify-between px-8 md:px-16 py-2 shadow bg-white">
        <Link to={"/"}>
          <img src={logo} alt="" className="h-16 md:h-20" />
        </Link>
        <div className="flex items-center justify-center gap-5">
          <div className="hidden md:block space-x-6">
            <NavLink
              to={"/"}
              className={({ isActive, isPending }) =>
                isPending
                  ? "pending"
                  : isActive
                  ? "navbar-link-active"
                  : "navbar-link"
              }
            >
              Home
            </NavLink>
            <NavLink
              to={"/topup"}
              className={({ isActive, isPending }) =>
                isPending
                  ? "pending"
                  : isActive
                  ? "navbar-link-active"
                  : "navbar-link"
              }
            >
              Top-Up
            </NavLink>
            <NavLink
              to={"/contact"}
              className={({ isActive, isPending }) =>
                isPending
                  ? "pending"
                  : isActive
                  ? "navbar-link-active"
                  : "navbar-link"
              }
            >
              Contact Us
            </NavLink>
          </div>
          <button className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 text-lg text-white font-semibold rounded">
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
