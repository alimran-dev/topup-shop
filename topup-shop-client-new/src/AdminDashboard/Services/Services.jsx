import { Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

const Services = () => {

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center md:gap-4 pb-5">
                <h2 className="title !mx-0">All Services</h2>
                <Link to={"/dashboard/addSubCategory"} className="button flex items-center gap-1 md:text-xl bg-gradient"><FaPlus />Add New Sub-Category</Link>
            </div>
            all services
        </div>
    );
};

export default Services;