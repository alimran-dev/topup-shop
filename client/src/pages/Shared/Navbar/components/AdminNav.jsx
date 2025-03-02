import PropTypes from 'prop-types';
import { FaPlus, FaUsersCog, FaRegImage,FaRegFlag ,FaStaylinked } from "react-icons/fa";
import { FiEdit,FiUsers } from "react-icons/fi";
import { GrAnnounce, GrTransaction } from "react-icons/gr";
import { ImBlocked } from "react-icons/im";
import { IoGridOutline, IoBagHandleOutline } from "react-icons/io5";
import { LuListTodo } from "react-icons/lu";
import { MdDevices, MdOutlinePostAdd, MdPayment, MdOutlineNumbers } from "react-icons/md";
import { TbTableOptions } from "react-icons/tb";
import { VscAccount } from "react-icons/vsc";
import { NavLink, useLocation } from "react-router-dom";
import { GoCodeSquare } from "react-icons/go";


const navItems = [
  { to: "/dashboard", icon: IoGridOutline, label: "Dashboard" },
  { to: "/dashboard/orders", icon: LuListTodo, label: "Orders" },
  { to: "/dashboard/services", icon: IoBagHandleOutline, label: "Services" },
  { to: "/dashboard/options", icon: TbTableOptions, label: "Options" },
  { to: "/dashboard/offersAndProducts", icon: FaStaylinked, label: "Offers & Products" },
  { to: "/dashboard/payments", icon: MdPayment, label: "Payments" },
  { to: "/dashboard/referral", icon: FiUsers, label: "Referral" },
  { to: "/dashboard/transactions", icon: GrTransaction, label: "Transactions" },
  { to: "/dashboard/banner", icon: FaRegImage, label: "Banner" },
  { to: "/dashboard/addCodes", icon: MdOutlinePostAdd, label: "Add Codes" },
  { to: "/dashboard/redeemCode", icon: GoCodeSquare, label: "Redeem Code" },
  { to: "/dashboard/archivedUnipins", icon: MdOutlineNumbers, label: "Archived Unipins" },
  { to: "/dashboard/updateOptions", icon: FiEdit, label: "Update Options" },
  { to: "/dashboard/users", icon: FaUsersCog, label: "Manage Users" },
  { to: "/dashboard/addAdvertisement", icon: FaPlus, label: "Add Advertisement" },
  { to: "/dashboard/notice", icon: GrAnnounce, label: "Notice" },
  { to: "/dashboard/followUs", icon: FaRegFlag, label: "Follow Us" },
  { to: "/dashboard/devices", icon: MdDevices, label: "Devices" },
  { to: "/dashboard/blockedTrx", icon: ImBlocked, label: "Block Trx" },
  { to: "/myAccount", icon: VscAccount, label: "My Account" },
];

const AdminNav = ({ setIsOpen }) => {

  const location = useLocation();

  const renderNavLink = ({ to, icon: Icon, label }) => (
    <NavLink
      key={to}
      to={to}
      onClick={() => setIsOpen(false)}
      className={`${location?.pathname == to ? 'text-primary font-semibold' : ''} flex items-center gap-2 text-lg mx-4 py-3`}
    >
      <Icon className="text-2xl" /> {label}
    </NavLink>
  );

  return <div>{navItems.map(renderNavLink)}</div>;
};


AdminNav.propTypes = {
  setIsOpen: PropTypes.func,
};

export default AdminNav;
