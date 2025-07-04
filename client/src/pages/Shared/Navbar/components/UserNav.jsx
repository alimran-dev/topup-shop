import PropTypes from 'prop-types';
import { VscAccount } from "react-icons/vsc";
import { TfiMenuAlt } from "react-icons/tfi";
import { MdAccountBalance,MdOutlineLeaderboard ,MdOutlineStorefront } from "react-icons/md";
import { IoGridOutline } from "react-icons/io5";
import { NavLink, useLocation } from "react-router-dom";
import { BsCoin } from "react-icons/bs";

const navItems = [
  { to: "/myAccount", icon: VscAccount, label: "My Account" },
  { to: "/addBalance", icon: MdAccountBalance, label: "Add Balance" },
  { to: "/myOrders", icon: IoGridOutline, label: "My Orders" },
  { to: "/myTransactions", icon: TfiMenuAlt, label: "My Transactions" },
  { to: "/coinsAndReferral", icon: BsCoin, label: "Coins & Referral" },
  { to: "/store", icon: MdOutlineStorefront, label: "Store" },
  { to: "/leaderboard", icon: MdOutlineLeaderboard, label: "Leaderboard" },
];

const   UserNav = ({ setIsOpen }) => {
  const location = useLocation();

  const renderNavLink = ({ to, icon: Icon, label }) => (
    <NavLink
      key={to}
      to={to}
      onClick={() => setIsOpen(false)}
      className={`${location.pathname === to ? 'text-primary font-semibold' : ''} flex items-center gap-2 text-lg mx-4 py-3`}
    >
      <Icon className="text-2xl" /> {label}
    </NavLink>
  );

  return <div>{navItems.map(renderNavLink)}</div>;
};

UserNav.propTypes = {
  setIsOpen: PropTypes.func,
};

export default UserNav;
