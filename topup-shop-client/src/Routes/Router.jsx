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

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        children: [
            {
                path: '/',
                element: <Home />,
            },
            {
                path: '/topup',
                element: <TopUp />,
            },
            {
                path: '/unipin',
                element: <Unipin />,
            },
            {
                path: '/idcode',
                element: <Idcode />,
            },
            {
                path: '/weekly-monthly',
                element: <WeeklyMonthly />,
            },
            {
                path: '/shell',
                element: <Shell />,
            },
            {
                path: '/contact',
                element: <ContactUs />
            },
            {
                path: '/myAccount',
                element: <MyAccount />,
            },
            {
                path: '/addBalance',
                element: <AddBalance />,
            },
            {
                path: '/myOrders',
                element: <MyOrders />,
            },
            {
                path: '/myTransactions',
                element: <MyTransactions />
            },
        ]
    }
])

export default router;