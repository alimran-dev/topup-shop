import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../../../assets/topup-logo-crop.png";
import "./Navbar.css";
import useAuth from "../../../hooks/useAuth";
import avatar from "../../../assets/images/avater.png";
import { useState } from "react";
import { BiSupport } from "react-icons/bi";
import { TbCurrencyTaka} from "react-icons/tb";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import useIsAdmin from "../../../hooks/useIsAdmin";
import AdminNav from "./components/AdminNav";
import UserNav from "./components/UserNav";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin, isAdminLoading } = useIsAdmin();
  const { user, setUser, logOut } = useAuth();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  // console.log(isOpen);
  const handleLogOut = () => {
    logOut()
      .then(() => {
        setUser(null);
        axiosPrivate.post("/auth/logout").then(() => {
          navigate("/");
          // console.log(res.data);
        });
      })
      .catch((err) => {
        console.error(err);
      });
  };
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
          {user ? (
            <div className="flex items-center gap-3">
              {!isAdmin && !isAdminLoading ? (
                <span className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-3 text-lg text-white font-semibold rounded flex items-center">
                  {" "}
                  {user?.balance || 0} <TbCurrencyTaka />
                </span>
              ) : (
                <></>
              )}

              <img
                onClick={() => setIsOpen(!isOpen)}
                src={user?.photo || avatar}
                alt=""
                className="w-12 h-12 bg-slate-400 rounded-full cursor-pointer"
              />
              <div
                onClick={() => setIsOpen(!isOpen)}
                className={`absolute inset-0 w-screen h-screen flex ${
                  isOpen ? "" : "hidden"
                }`}
              >
                <span className="flex-1 bg-gray-700 opacity-60"></span>
                <div className="w-64 md:w-72 bg-white overflow-y-scroll pb-10">
                  <div className="flex items-center gap-2 p-3">
                    <img
                      src={user?.photo || avatar}
                      alt=""
                      className="w-14 h-14 rounded-md bg-slate-400"
                    />
                    <div className="flex-1">
                      <p className="text-lg font-bold text-gray-800">
                        {user?.name}
                      </p>
                      <p className="font-medium overflow-hidden">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogOut}
                    className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1 md:py-1.5 px-5 lg:text-lg text-white font-semibold rounded block mx-auto "
                  >
                    Log Out
                  </button>
                  <hr className="my-3 border-t-2 border-[#FA6023] border-opacity-60" />
                  {/* menu items */}
                  {isAdmin ? (
                    <AdminNav/>
                  ) : (
                    <UserNav/>
                  )}

                  <hr className="my-3 border-t-2 border-[#FA6023] border-opacity-60" />
                  <Link
                    to={"https://wa.me/+8801643204362"}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1 md:py-1.5 px-5 lg:text-lg text-white font-semibold rounded w-fit mx-auto "
                  >
                    <BiSupport /> Support
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 text-lg text-white font-semibold rounded"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
