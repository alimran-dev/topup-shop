import { useEffect } from "react";
import { Link } from "react-router-dom";


const RechargeModal = () => {

    const isOpen = false;

    
    // disable scrolling
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    return (
        <div
            className={`fixed inset-0 z-30 w-screen h-screen items-center justify-center bg-black bg-opacity-40 py-5 ${isOpen ? "flex" : "hidden"
                }`}
        >
            <div className="bg-white border w-full mx-4 sm:mx-0 sm:w-[380px] lg:w-[450px] max-h-[80vh] block px-5 py-3 rounded-md overflow-auto relative">
                <h2 className="text-lg md:text-xl font-semibold text-center pb-1 mb-2 border-b">Title Text Here</h2>
                <p className="text-justify md:text-sm">
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repudiandae enim non rerum amet? Earum eaque quisquam facilis, nemo voluptates quaerat dicta culpa omnis harum, perspiciatis odio soluta corporis iste officia.
                </p>
                <Link to={"/"} className="button w-fit flex mx-auto mt-5">Go Home</Link>
            </div>
        </div>
    );
};

export default RechargeModal;