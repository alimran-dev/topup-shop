import { createBrowserRouter } from "react-router-dom";
import Root from "../layouts/Root";
import Home from "../pages/Home/Home";
import TopUp from "../pages/TopUp/TopUp";
import ContactUs from "../pages/ContactUs/ContactUs";

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
            }
        ]
    }
])

export default router;