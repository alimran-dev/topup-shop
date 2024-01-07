import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../../../assets/topup-logo-crop.png";
import "./Navbar.css";
import useAuth from "../../../hooks/useAuth";
import avatar from "../../../assets/images/avater.png";
import { useState } from "react";
import { VscAccount } from "react-icons/vsc";
import { TfiMenuAlt } from "react-icons/tfi";
import { MdAccountBalance, MdOutlinePostAdd } from "react-icons/md";
import { IoGridOutline } from "react-icons/io5";
import { BiSupport } from "react-icons/bi";
import { TbCurrencyTaka, TbTableOptions } from "react-icons/tb";
import { FiEdit } from "react-icons/fi";
import { LuListTodo } from "react-icons/lu";
import { FaUsersCog } from "react-icons/fa";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import useIsAdmin from "../../../hooks/useIsAdmin";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin, isAdminLoading } = useIsAdmin();
  const { user, setUser, logOut } = useAuth();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  console.log(isOpen);
  const handleLogOut = () => {
    logOut()
      .then(() => {
        setUser(null);
        axiosPrivate.post("/logout").then((res) => {
          navigate("/");
          console.log(res.data);
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
                    <div>
                      <NavLink
                        to={"/dashboard"}
                        end
                        className={({ isActive, isPending }) =>
                          isPending
                            ? "pending"
                            : isActive
                            ? "flex items-center gap-2 text-lg mx-4 py-3 pt-0 text-[#FA6023]"
                            : "flex items-center gap-2 text-lg mx-4 py-3 pt-0"
                        }
                      >
                        <IoGridOutline className="text-2xl" /> Dashboard
                      </NavLink>
                      <NavLink
                        to={"/dashboard/orders"}
                        className={({ isActive, isPending }) =>
                          isPending
                            ? "pending"
                            : isActive
                            ? "flex items-center gap-2 text-lg mx-4 py-3 text-[#FA6023]"
                            : "flex items-center gap-2 text-lg mx-4 py-3"
                        }
                      >
                        <LuListTodo className="text-2xl" /> Orders
                      </NavLink>
                      <NavLink
                        to={"/dashboard/addCodes"}
                        className={({ isActive, isPending }) =>
                          isPending
                            ? "pending"
                            : isActive
                            ? "flex items-center gap-2 text-lg mx-4 py-3 text-[#FA6023]"
                            : "flex items-center gap-2 text-lg mx-4 py-3"
                        }
                      >
                        <MdOutlinePostAdd className="text-2xl" /> Add Codes
                      </NavLink>
                      <NavLink
                        to={"/dashboard/addOptions"}
                        className={({ isActive, isPending }) =>
                          isPending
                            ? "pending"
                            : isActive
                            ? "flex items-center gap-2 text-lg mx-4 py-3 text-[#FA6023]"
                            : "flex items-center gap-2 text-lg mx-4 py-3"
                        }
                      >
                        <TbTableOptions className="text-2xl" /> Add Options
                      </NavLink>
                      <NavLink
                        to={"/dashboard/updateOptions"}
                        className={({ isActive, isPending }) =>
                          isPending
                            ? "pending"
                            : isActive
                            ? "flex items-center gap-2 text-lg mx-4 py-3 text-[#FA6023]"
                            : "flex items-center gap-2 text-lg mx-4 py-3"
                        }
                      >
                        <FiEdit className="text-2xl" /> Update Options
                      </NavLink>
                      <NavLink
                        to={"/dashboard/users"}
                        className={({ isActive, isPending }) =>
                          isPending
                            ? "pending"
                            : isActive
                            ? "flex items-center gap-2 text-lg mx-4 py-3 text-[#FA6023]"
                            : "flex items-center gap-2 text-lg mx-4 py-3"
                        }
                      >
                        <FaUsersCog className="text-2xl" /> Manage Users
                      </NavLink>
                      <NavLink
                        to={"/myAccount"}
                        className={({ isActive, isPending }) =>
                          isPending
                            ? "pending"
                            : isActive
                            ? "flex items-center gap-2 text-lg mx-4 py-3 pb-0 text-[#FA6023]"
                            : "flex items-center gap-2 text-lg mx-4 py-3 pb-0"
                        }
                      >
                        <VscAccount className="text-2xl" /> My Account
                      </NavLink>
                    </div>
                  ) : (
                    <div>
                      <NavLink
                        to={"/myAccount"}
                        className={({ isActive, isPending }) =>
                          isPending
                            ? "pending"
                            : isActive
                            ? "flex items-center gap-2 text-lg mx-4 py-3 pt-0 text-[#FA6023]"
                            : "flex items-center gap-2 text-lg mx-4 py-3 pt-0"
                        }
                      >
                        <VscAccount className="text-2xl" /> My Account
                      </NavLink>
                      <NavLink
                        to={"/addBalance"}
                        className={({ isActive, isPending }) =>
                          isPending
                            ? "pending"
                            : isActive
                            ? "flex items-center gap-2 text-lg mx-4 py-3 text-[#FA6023]"
                            : "flex items-center gap-2 text-lg mx-4 py-3"
                        }
                      >
                        <MdAccountBalance className="text-2xl" /> Add Balance
                      </NavLink>
                      <NavLink
                        to={"/myOrders"}
                        className={({ isActive, isPending }) =>
                          isPending
                            ? "pending"
                            : isActive
                            ? "flex items-center gap-2 text-lg mx-4 py-3 text-[#FA6023]"
                            : "flex items-center gap-2 text-lg mx-4 py-3"
                        }
                      >
                        <IoGridOutline className="text-2xl" /> My Orders
                      </NavLink>
                      <NavLink
                        to={"myTransactions"}
                        className={({ isActive, isPending }) =>
                          isPending
                            ? "pending"
                            : isActive
                            ? "flex items-center gap-2 text-lg mx-4 py-3 pb-0 text-[#FA6023]"
                            : "flex items-center gap-2 text-lg mx-4 py-3 pb-0"
                        }
                      >
                        <TfiMenuAlt className="text-2xl" /> My Transactions
                      </NavLink>
                    </div>
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
