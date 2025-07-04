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
import Method from "../pages/AddBalance/Method/Method";
import Pay from "../pages/AddBalance/Pay/Pay";
import Payments from "../AdminDashboard/Payments/Payments";
import Transactions from "../AdminDashboard/Transactions/Transactions";
import Notice from "../AdminDashboard/Notice/Notice";
import Devices from "../AdminDashboard/Devices/Devices";
import BlockTrx from "../AdminDashboard/BlockTrx/BlockTrx";
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
import CoinAndReferaal from "../pages/CoinAndReferral/CoinAndReferral";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import Confirmation from "../pages/AddBalance/Confirmation/Confirmation";
import LeaderBoard from "../pages/LeaderBoard/LeaderBoard";
import Referral from "../AdminDashboard/Referral/Referral";
import History from "../AdminDashboard/Referral/History/History";
import Store from "../pages/Store/Store";
import SpecialOfferDetails from "../pages/SpecialOfferDetails/SpecialOfferDetails";
import OffersAndProducts from "../AdminDashboard/OfferAndProducts/OfferAndProducts";
import SpecialProductForm from "../AdminDashboard/OfferAndProducts/SpecialProducts/SpecialProductForm/SpecialProductForm";
import OfferForm from "../AdminDashboard/OfferAndProducts/Offers/OfferForm/OfferForm";
import RedeemClaimedList from "../AdminDashboard/RedeemCode/RedeemClaimedList/RedeemClaimedList";
import MobileRecharge from "../pages/MobileRecharge/MobileRecharge";
import CoinProductDetail from "../pages/CoinProductDetail/CoinProductDetail";
import CoinHistory from "../pages/CoinAndReferral/CoinHistory/CoinHistory";
import ReferralHistory from "../pages/CoinAndReferral/ReferralHistory/ReferralHistory";
import ViewSummary from "../AdminDashboard/Orders/ViewSummary/ViewSummary";
import AdminCoinHistory from "../AdminDashboard/OfferAndProducts/SpecialProducts/CoinHistory/CoinHistory";
import ClaimRedeemCode from "../pages/Home/ClaimRedeemCode/ClaimRedeemCode";
import OrderImages from "../pages/OrderImages/OrderImages";


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
        path: "/cards/:next",
        element: <RechargeCard />,
      },
      {
        path: "/special-offer-details/:id",
        element: <SpecialOfferDetails />,
      },
      {
        path: "/mobile-recharge",
        element: <MobileRecharge />,
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
        path: "/forgotPassword",
        element: <ForgotPassword />,
      },
      {
        path: "/images/:orderId",
        element: <OrderImages />
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
        path: "/payment/confirmation",
        element: (
          <PrivateRoute>
            <Confirmation />
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
      {
        path: "/coinsAndReferral",
        element: (
          <PrivateRoute>
            <CoinAndReferaal />
          </PrivateRoute>
        ),
      },
      {
        path: "/coinsAndReferral/coinHistory",
        element: (
          <PrivateRoute>
            <CoinHistory />
          </PrivateRoute>
        ),
      },
      {
        path: "/coinsAndReferral/referralHistory",
        element: (
          <PrivateRoute>
            <ReferralHistory />
          </PrivateRoute>
        ),
      },
      {
        path: "/store",
        element: (
          <PrivateRoute>
            <Store />
          </PrivateRoute>
        ),
      },
      {
        path: "/store/:id",
        element: (
          <PrivateRoute>
            <CoinProductDetail />
          </PrivateRoute>
        ),
      },
      {
        path: "/leaderboard",
        element: (
          <PrivateRoute>
            <LeaderBoard />
          </PrivateRoute>
        ),
      },
      {
        path: "/redeem-code",
        element: <ClaimRedeemCode />
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
        path: "/dashboard/offersAndProducts",
        element: <OffersAndProducts />,
      },
      {
        path: "/dashboard/offersAndProducts/manageSpecialProduct/:id?",
        element: <SpecialProductForm />,
      },
      {
        path: "/dashboard/offersAndProducts/manageOffer/:id?",
        element: <OfferForm />,
      },
      {
        path: "/dashboard/offersAndProducts/coin/history",
        element: <AdminCoinHistory />,
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
        path: "/dashboard/redeemClaimedList/:id",
        element: <RedeemClaimedList />,
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
        path: "/dashboard/orders/viewSummary",
        element: <ViewSummary />,
      },
      {
        path: "/dashboard/referral",
        element: <Referral />,
      },
      {
        path: "/dashboard/referral/history",
        element: <History />,
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