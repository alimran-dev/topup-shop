import { FaPlus } from "react-icons/fa6";
import { Link } from "react-router-dom";


const SpecialProducts = () => {
    return (
        <div>

            {/* add new btn */}
            <div className="flex justify-center md:justify-end pt-3 pb-5">
                <Link to={"/dashboard/offersAndProducts/manageSpecialProduct"} className="button flex items-center gap-1">
                    <FaPlus />
                    All Special Product
                </Link>
            </div>

            {/* products */}
            <div>

            </div>

        </div>
    );
};

export default SpecialProducts;