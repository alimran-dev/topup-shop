import { Link, useRouteError } from "react-router-dom";
import errorImg from "../../assets/images/error-image.jpg";

const ErrorPage = () => {
    const err = useRouteError();
    return (
        <div className="w-full md:min-h-screen p-10 flex flex-col">
           <div className="flex flex-col md:flex-row items-center px-5 py-5 flex-1 border-2 border-[#FA6023] rounded-md">
            <div className="flex-1">
                <img src={errorImg} alt="error image" className="w-full" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
                <p className="text-3xl font-medium">{err?.status}</p>
                <p className="text-4xl lg:text-6xl font-semibold text-center">{err?.statusText || "Something Wrong Go to home and contact with admin"}</p>
                <Link to={"/"} className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 text-lg text-white font-semibold rounded my-5">Go to Home</Link>
            </div>
        </div> 
        </div>
        
    );
};

export default ErrorPage;