import { createBrowserRouter } from "react-router-dom";
import Root from "../layouts/Root";
import Home from "../pages/Home/Home";
import TopUp from "../pages/TopUp/TopUp";
import ContactUs from "../pages/ContactUs/ContactUs";
import MyAccount from "../pages/MyAccount/MyAccount";
import AddBalance from "../pages/AddBalance/AddBalance";
import MyOrders from "../pages/MyOrders/MyOrders";
import MyTransactions from "../pages/MyTransactions/MyTransactions";

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