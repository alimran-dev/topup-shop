import { createBrowserRouter } from "react-router-dom";
import Root from "../layouts/Root";
import Home from "../pages/Home/Home";
import TopUp from "../pages/TopUp/TopUp";
import ContactUs from "../pages/ContactUs/ContactUs";
import MyAccount from "../pages/MyAccount/MyAccount";
import AddBalance from "../pages/AddBalance/AddBalance";
import MyOrders from "../pages/MyOrders/MyOrders";
import MyTransactions from "../pages/MyTransactions/MyTransactions";
import Unipin from "../pages/Unipin/Unipin";
import Idcode from "../pages/Idcode/Idcode";
import WeeklyMonthly from "../pages/WeeklyMonthly/WeeklyMonthly";
import Shell from "../pages/Shell/Shell";
import Dashboard from "../AdminDashboard/Dashboard";
import AddCodes from "../AdminDashboard/AddCodes/AddCodes";
import UpdateOptions from "../AdminDashboard/Update/UpdateOptions";
import Orders from "../AdminDashboard/Orders/Orders";
import Users from "../AdminDashboard/Users/Users";
import UpdateItems from "../AdminDashboard/Update/UpdateItems";
import UpdateDelete from "../AdminDashboard/Update/UpdateDelete";
import Login from "../pages/Login/Login";
import SignUp from "../pages/SignUp/SignUp";
import AdminRoute from "./AdminRoute";
import PrivateRoute from "./PrivateRoute";
import ErrorPage from "../pages/ErrorPage/ErrorPage";
import ServerList from "../pages/SpecialOffer/ServerList";
import ServerOptions from "../pages/SpecialOffer/ServerOptions";
import UpdateSpecialOption from "../AdminDashboard/Update/UpdateSpecialOption";
import UpdateSpOptionItem from "../AdminDashboard/Update/UpdateSpOptionItem";
import Method from "../pages/AddBalance/Method/Method";
import Pay from "../pages/AddBalance/Pay/Pay";
import Payments from "../AdminDashboard/Payments/Payments";
import Transactions from "../AdminDashboard/Transactions/Transactions";
import Notice from "../AdminDashboard/Notice/Notice";
import Devices from "../AdminDashboard/Devices/Devices";
import BlockTrx from "../AdminDashboard/BlockTrx/BlockTrx";
import UidAirdrop from "../pages/UidAirdrop/UidAirdrop";
import LessIsMore from "../pages/LessIsMore/LessIsMore";
import RechargeCard from "../pages/RechargeCard/RechargeCard";
import AddAdvertisement from "../pages/AddAdvertisement/AddAdvertisement";
import ConfirmPurchase from "../pages/ConfirmPurchase/ConfirmPurchase";
import RedeemCode from "../AdminDashboard/RedeemCode/RedeemCode";
import ArchivedUnipins from "../AdminDashboard/ArchivedUnipins/ArchivedUnipins";
import AddSubCategory from "../AdminDashboard/Services/AddSubCategory/AddSubCategory";
import Services from "../AdminDashboard/Services/Services";
import SubCategory from "../pages/SubCategory/SubCategory";
import Banner from "../AdminDashboard/Banner/Banner";
import FollowUs from "../AdminDashboard/FollowUs/FollowUs";
import AddOption from "../AdminDashboard/Options/AddOption/AddOption";
import Options from "../AdminDashboard/Options/Options";
import UpdateSubCategory from "../AdminDashboard/Services/UpdateSubCategory/UpdateSubCategory";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/topup",
        element: <TopUp />,
      },
      {
        path: "/unipin",
        element: <Unipin />,
      },
      {
        path: "/subCategory/:id",
        element: <SubCategory />,
      },
      {
        path: "/shell",
        element: <Shell />,
      },
      {
        path: "/idcode",
        element: <Idcode />,
      },
      {
        path: "/weekly-monthly",
        element: <WeeklyMonthly />,
      },
      {
        path: "/uid-airdrop",
        element: <UidAirdrop />,
      },
      {
        path: "/less-is-more",
        element: <LessIsMore />,
      },
      {
        path: "/cards/:next",
        element: <RechargeCard />,
      },
      {
        path: "/special-offer",
        element: <ServerList />,
      },
      {
        path: "/special-offer/:server",
        element: <ServerOptions />,
      },
      {
        path: "/contact",
        element: <ContactUs />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <SignUp />,
      },
      {
        path: "/myAccount",
        element: (
          <PrivateRoute>
            <MyAccount />
          </PrivateRoute>
        ),
      },
      {
        path: "/addBalance",
        element: (
          <PrivateRoute>
            <AddBalance />
          </PrivateRoute>
        ),
      },
      {
        path: "/addBalance/method",
        element: (
          <PrivateRoute>
            <Method />
          </PrivateRoute>
        ),
      },
      {
        path: "/addBalance/pay",
        element: (
          <PrivateRoute>
            <Pay />
          </PrivateRoute>
        ),
      },
      {
        path: "/confirmPurchase",
        element: (
          <PrivateRoute>
            <ConfirmPurchase />
          </PrivateRoute>
        ),
      },
      {
        path: "/myOrders",
        element: (
          <PrivateRoute>
            <MyOrders />
          </PrivateRoute>
        ),
      },
      {
        path: "/myTransactions",
        element: (
          <PrivateRoute>
            <MyTransactions />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <AdminRoute>
        <Root />
      </AdminRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/dashboard/services",
        element: <Services />,
      },
      {
        path: "/dashboard/banner",
        element: <Banner />,
      },
      {
        path: "/dashboard/addSubCategory",
        element: <AddSubCategory />,
      },
      {
        path: "/dashboard/updateSubCategory/:id",
        element: <UpdateSubCategory />,
      },
      {
        path: "/dashboard/addCodes",
        element: <AddCodes />,
      },
      {
        path: "/dashboard/redeemCode",
        element: <RedeemCode />,
      },
      {
        path: "/dashboard/archivedUnipins",
        element: <ArchivedUnipins />,
      },
      {
        path: "/dashboard/options",
        element: <Options />,
      },
      {
        path: "/dashboard/addOption",
        element: <AddOption />,
      },
      {
        path: "/dashboard/updateOptions",
        element: <UpdateOptions />,
      },
      {
        path: "/dashboard/updateSpecialOption",
        element: <ServerList />,
      },
      {
        path: "/dashboard/updateSpecialOption/:server",
        element: <UpdateSpecialOption />,
      },
      {
        path: "/dashboard/updateSpecialOption/:server/:id",
        element: <UpdateSpOptionItem />,
      },
      {
        path: "/dashboard/updateOptions/:category",
        element: <UpdateItems />,
      },
      {
        path: "/dashboard/updateOptions/:category/:id",
        element: <UpdateDelete />,
      },
      {
        path: "/dashboard/orders",
        element: <Orders />,
      },
      {
        path: "/dashboard/users",
        element: <Users />,
      },
      {
        path: "/dashboard/payments",
        element: <Payments />,
      },
      {
        path: "/dashboard/transactions",
        element: <Transactions />,
      },
      {
        path: "/dashboard/notice",
        element: <Notice />,
      },
      {
        path: "/dashboard/followUs",
        element: <FollowUs />,
      },
      {
        path: "/dashboard/devices",
        element: <Devices />,
      },
      {
        path: "/dashboard/blockedTrx",
        element: <BlockTrx />,
      },
      {
        path: "/dashboard/addAdvertisement",
        element: <AddAdvertisement />,
      },
    ],
  },
]);

export default router;
