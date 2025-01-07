import { VscAccount } from "react-icons/vsc";
import { TfiMenuAlt } from "react-icons/tfi";
import { MdAccountBalance } from "react-icons/md";
import { IoGridOutline } from "react-icons/io5";
import { NavLink } from "react-router-dom";

const UserNav = () => {
  return (
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
  );
};

export default UserNav;
