import { AiOutlineHome, AiOutlineSolution } from "react-icons/ai";
import { GiRollingEnergy } from "react-icons/gi";
import { NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import avatar from "../assets/images/avater.png";
import { IoGridOutline } from "react-icons/io5";
import { MdAccountBalance, MdOutlinePostAdd } from "react-icons/md";
import useIsAdmin from "../hooks/useIsAdmin";
import { FaUsersCog } from "react-icons/fa";
import { LuListTodo } from "react-icons/lu";

const LowerNav = () => {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  // const user = true;
  // const isAdmin = true;
  return (
    <div className="sticky left-0 bottom-0 w-full z-20 pb-1 pt-1.5 bg-white flex items-center justify-around outline outline-2 outline-gray-400 md:hidden">
      {user ? (
        isAdmin ? (
          <>
            <NavLink
              to={"/"}
              className={({ isActive, isPending }) =>
                isPending ? "pending" : isActive ? "text-[#FA6023] flex-1" : "flex-1"
              }
            >
              <div className="flex flex-col items-center">
                <AiOutlineHome className="text-2xl" />
                <p className="text-xs font-medium">Home</p>
              </div>
            </NavLink>
            <NavLink
              to={"/dashboard/addCodes"}
              className={({ isActive, isPending }) =>
                isPending ? "pending" : isActive ? "text-[#FA6023] flex-1" : "flex-1"
              }
            >
              <div className="flex flex-col items-center">
                <MdOutlinePostAdd className="text-2xl" />
                <p className="text-xs font-medium">Add Codes</p>
              </div>
            </NavLink>
            <NavLink
              to={"/dashboard/users"}
              className={({ isActive, isPending }) =>
                isPending ? "pending" : isActive ? "text-[#FA6023] flex-1" : "flex-1"
              }
            >
              <div className="flex flex-col items-center">
                <FaUsersCog className="text-2xl" />
                <p className="text-xs font-medium text-center">Manage Users</p>
              </div>
            </NavLink>
            <NavLink
              to={"/dashboard/orders"}
              className={({ isActive, isPending }) =>
                isPending ? "pending" : isActive ? "text-[#FA6023] flex-1" : "flex-1"
              }
            >
              <div className="flex flex-col items-center">
                <LuListTodo className="text-2xl" />
                <p className="text-xs font-medium">Orders</p>
              </div>
            </NavLink>
            <NavLink
              to={"/dashboard"}
              end
              className={({ isActive, isPending }) =>
                isPending ? "pending" : isActive ? "text-[#FA6023] flex-1" : "flex-1"
              }
            >
              <div className="flex flex-col items-center">
                <IoGridOutline className="text-2xl" />
                <p className="text-xs font-medium">Dashboard</p>
              </div>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to={"/"}
              className={({ isActive, isPending }) =>
                isPending ? "pending" : isActive ? "text-[#FA6023] flex-1" : "flex-1"
              }
            >
              <div className="flex flex-col items-center">
                <AiOutlineHome className="text-2xl" />
                <p className="text-xs font-medium">Home</p>
              </div>
            </NavLink>
            <NavLink
              to={"/topup"}
              className={({ isActive, isPending }) =>
                isPending ? "pending" : isActive ? "text-[#FA6023] flex-1" : "flex-1"
              }
            >
              <div className="flex flex-col items-center">
                <GiRollingEnergy className="text-2xl" />
                <p className="text-xs font-medium">Top-Up</p>
              </div>
            </NavLink>
            <NavLink
              to={"/addBalance"}
              className={({ isActive, isPending }) =>
                isPending ? "pending" : isActive ? "text-[#FA6023] flex-1" : "flex-1"
              }
            >
              <div className="flex flex-col items-center">
                <MdAccountBalance className="text-2xl" />
                <p className="text-xs font-medium text-center">Add Balance</p>
              </div>
            </NavLink>
            <NavLink
              to={"/myOrders"}
              className={({ isActive, isPending }) =>
                isPending ? "pending" : isActive ? "text-[#FA6023] flex-1" : "flex-1"
              }
            >
              <div className="flex flex-col items-center">
                <IoGridOutline className="text-2xl" />
                <p className="text-xs font-medium">My Orders</p>
              </div>
            </NavLink>
            <NavLink
              to={"/myAccount"}
              className={({ isActive, isPending }) =>
                isPending ? "pending" : isActive ? "text-[#FA6023] flex-1" : "flex-1"
              }
            >
              <div className="flex flex-col items-center">
                <img
                  src={user?.photo || avatar}
                  alt="photo"
                  className="w-9 h-7 rounded-full"
                />
                <p className="text-xs font-medium text-center">My Account</p>
              </div>
            </NavLink>
          </>
        )
      ) : (
        <>
          <NavLink
            to={"/"}
            className={({ isActive, isPending }) =>
              isPending ? "pending" : isActive ? "text-[#FA6023] flex-1" : "flex-1"
            }
          >
            <div className="flex flex-col items-center">
              <AiOutlineHome className="text-3xl" />
              <p className="text-xs font-medium">Home</p>
            </div>
          </NavLink>
          <NavLink
            to={"/topup"}
            className={({ isActive, isPending }) =>
              isPending ? "pending" : isActive ? "text-[#FA6023] flex-1" : "flex-1"
            }
          >
            <div className="flex flex-col items-center">
              <GiRollingEnergy className="text-3xl" />
              <p className="text-xs font-medium">Top-Up</p>
            </div>
          </NavLink>
          <NavLink
            to={"/contact"}
            className={({ isActive, isPending }) =>
              isPending ? "pending" : isActive ? "text-[#FA6023] flex-1" : "flex-1"
            }
          >
            <div className="flex flex-col items-center">
              <AiOutlineSolution className="text-3xl" />
              <p className="text-xs font-medium">Contact Us</p>
            </div>
          </NavLink>
        </>
      )}
    </div>
  );
};

export default LowerNav;
