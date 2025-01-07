import { FaPlus, FaUsersCog } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { GrAnnounce, GrTransaction } from "react-icons/gr";
import { ImBlocked } from "react-icons/im";
import { IoGridOutline } from "react-icons/io5";
import { LuListTodo } from "react-icons/lu";
import { MdDevices, MdOutlinePostAdd, MdPayment } from "react-icons/md";
import { TbTableOptions } from "react-icons/tb";
import { VscAccount } from "react-icons/vsc";
import { NavLink } from "react-router-dom";
import { IoBagAdd } from "react-icons/io5";

const navItems = [
  { to: "/dashboard", icon: IoGridOutline, label: "Dashboard" },
  { to: "/dashboard/orders", icon: LuListTodo, label: "Orders" },
  { to: "/dashboard/payments", icon: MdPayment, label: "Payments" },
  { to: "/dashboard/transactions", icon: GrTransaction, label: "Transactions" },
  { to: "/dashboard/addServices", icon: IoBagAdd, label: "Add Services"},
  { to: "/dashboard/addCodes", icon: MdOutlinePostAdd, label: "Add Codes" },
  { to: "/dashboard/addOptions", icon: TbTableOptions, label: "Add Options" },
  { to: "/dashboard/updateOptions", icon: FiEdit, label: "Update Options" },
  { to: "/dashboard/users", icon: FaUsersCog, label: "Manage Users" },
  { to: "/dashboard/addAdvertisement", icon: FaPlus, label: "Add Advertisement"},
  { to: "/dashboard/notice", icon: GrAnnounce, label: "Notice" },
  { to: "/dashboard/devices", icon: MdDevices, label: "Devices" },
  { to: "/dashboard/blockedTrx", icon: ImBlocked, label: "Block Trx" },
  { to: "/myAccount", icon: VscAccount, label: "My Account" },
];

const AdminNav = () => {
  const renderNavLink = ({ to, icon: Icon, label }) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive, isPending }) =>
        isPending
          ? "pending"
          : isActive
          ? "flex items-center gap-2 text-lg mx-4 py-3 text-[#FA6023]"
          : "flex items-center gap-2 text-lg mx-4 py-3"
      }
    >
      <Icon className="text-2xl" /> {label}
    </NavLink>
  );

  return <div>{navItems.map(renderNavLink)}</div>;
};

export default AdminNav;
