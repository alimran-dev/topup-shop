import { FaPlus } from "react-icons/fa6";
import { Link } from "react-router-dom";


const Offers = () => {
    return (
        <div>

            {/* add new btn */}
            <div className="flex justify-end">
                <Link to={"/dashboard/offersAndProducts/addOffer"} className="button flex items-center gap-1">
                    <FaPlus />
                    All Offer
                </Link>
            </div>
            
            {/* offers */}
            <div>

            </div>

        </div>
    );
};

export default Offers;