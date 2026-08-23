import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../../../assets/topup-logo-crop.png";
import "./Navbar.css";
import useAuth from "../../../hooks/useAuth";
import avatar from "../../../assets/images/avater.png";
import { BiSupport } from "react-icons/bi";
import { TbCurrencyTaka } from "react-icons/tb";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import useIsAdmin from "../../../hooks/useIsAdmin";
import AdminNav from "./components/AdminNav";
import UserNav from "./components/UserNav";
import UserName from "../../../components/reusuable/UserName/UserName";
import {allLinks} from '../../../utils/constants';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin, isAdminLoading } = useIsAdmin();
  const { user, setUser, logOut } = useAuth();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  const handleLogOut = () => {
    logOut()
      .then(() => {
        setUser(null);
        axiosPrivate.post("/auth/logout").then(() => {
          navigate("/");
        });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // body scrolls, nav close effects
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('body-scroll-lock');
    } else {
      document.body.classList.remove('body-scroll-lock');
    }

    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.menu-container') && !event.target.closest('.user-avatar')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.classList.remove('body-scroll-lock');
    };
  }, [isOpen]);


  return (
    <div className="sticky top-0 left-0 z-20">
      {/* Apply body class when menu is open */}
      <div className={`flex items-center justify-between px-4 md:px-16 py-2 shadow bg-white ${isOpen ? 'overflow-hidden' : ''}`}>
        <Link to={"/"}>
          <img src={logo} alt="" className="h-14 md:h-20 w-40 md:w-auto" />
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
                <span className="bg-gradient-to-r from-primary to-secondary py-1.5 px-3 text-lg text-white font-semibold rounded flex items-center">
                  <TbCurrencyTaka /> {(user?.balance)?.toFixed(2) || 0}
                </span>
              ) : null}

              <div className="flex flex-col items-center gap-1">
                <img
                  onClick={() => setIsOpen(!isOpen)}
                  src={user?.photo || avatar}
                  alt=""
                  className={`w-12 h-12 bg-slate-400 rounded-full cursor-pointer user-avatar ${
                    user?.subscriptionTheme ? "user-avatar-ring" : ""
                  }`}
                  onError={(e) => {
                    e.target.onerror = null; // prevents looping
                    e.target.src = avatar; // fallback image
                  }}
                />
                {user?.subscriptionTheme?.typeName ? (
                  <span className="text-[9px] leading-none font-semibold text-white bg-slate-800/90 px-1.5 py-0.5 rounded-full max-w-[4.5rem] truncate">
                    {user.subscriptionTheme.typeName}
                  </span>
                ) : null}
              </div>
              {/* Menu Container */}
              <div
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed top-0 right-0 w-screen h-screen bg-black bg-opacity-50 z-20 ${isOpen ? "block" : "hidden"}`}
              />
              <div
                className={`fixed top-0 right-0 w-64 md:w-72 bg-white overflow-y-scroll pb-20 md:pb-10 z-20 menu-container ${isOpen ? "translate-x-0" : "translate-x-full"} duration-200`}
              >
                <div className="flex items-center gap-2 p-3">
                  <img
                    src={user?.photo || avatar}
                    alt=""
                    className="w-14 h-14 rounded-md bg-slate-400"
                    onError={(e) => {
                      e.target.onerror = null; // prevents looping
                      e.target.src = avatar; // fallback image
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-lg font-bold text-gray-800">
                      <UserName name={user?.name} isVerified={user?.isVerified} />
                    </p>
                    {user?.subscriptionTheme?.typeName ? (
                      <span className="text-[10px] leading-none font-semibold text-white bg-slate-800/90 px-1.5 py-0.5 rounded-full w-fit">
                        {user.subscriptionTheme.typeName}
                      </span>
                    ) : null}
                    <p className="font-medium overflow-hidden">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogOut}
                  className="bg-gradient-to-r from-primary to-secondary py-1 md:py-1.5 px-5 lg:text-lg text-white font-semibold rounded block mx-auto"
                >
                  Log Out
                </button>
                <hr className="my-3 border-t-2 border-primary border-opacity-60" />
                {isAdmin ? (
                  <AdminNav setIsOpen={setIsOpen} />
                ) : (
                  <UserNav setIsOpen={setIsOpen} />
                )}
                <hr className="my-3 border-t-2 border-primary border-opacity-60" />
                <Link
                  to={allLinks.whatsappSupport || "#"}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary py-1 md:py-1.5 px-5 lg:text-lg text-white font-semibold rounded w-fit mx-auto"
                >
                  <BiSupport /> Support
                </Link>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-primary to-secondary py-1.5 px-5 text-lg text-white font-semibold rounded"
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
