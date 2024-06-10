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
import AddOptions from "../AdminDashboard/AddOptions/AddOptions";
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
import Method from "../pages/AddBalance/Method";

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
        path: "/idcode",
        element: <Idcode />,
      },
      {
        path: "/weekly-monthly",
        element: <WeeklyMonthly />,
      },
      {
        path: "/shell",
        element: <Shell />,
      },
      {
        path: "/special-offer",
        element: <ServerList />,
      },
      {
        path: "/special-offer/:server",
        element: <ServerOptions />
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
        element: <PrivateRoute><MyAccount /></PrivateRoute>,
      },
      {
        path: "/addBalance",
        element: <PrivateRoute><AddBalance /></PrivateRoute>,
      },
      {
        path: "/addBalance/method",
        element: <PrivateRoute><Method /></PrivateRoute>
      },
      {
        path: "/myOrders",
        element: <PrivateRoute><MyOrders /></PrivateRoute>,
      },
      {
        path: "/myTransactions",
        element: <PrivateRoute><MyTransactions /></PrivateRoute>,
      },
    ],
  },
  {
    path: "/dashboard",
    element: <AdminRoute><Root /></AdminRoute>,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/dashboard/addCodes",
        element: <AddCodes />,
      },
      {
        path: "/dashboard/addOptions",
        element: <AddOptions />,
      },
      {
        path: "/dashboard/updateOptions",
        element: <UpdateOptions />,
      },
      {
        path: "/dashboard/updateSpecialOption",
        element: <ServerList />
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
    ],
  },
]);

export default router;
