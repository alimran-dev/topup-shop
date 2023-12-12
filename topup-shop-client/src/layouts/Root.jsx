import { Outlet } from "react-router-dom";
import Navbar from "../pages/Shared/Navbar/Navbar";
import Footer from "../pages/Shared/Footer/Footer";

const Root = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1 px-8 md:px-16 my-5 md:my-10">
            <Outlet />
            </div>
            <Footer />
        </div>
    );
};

export default Root;