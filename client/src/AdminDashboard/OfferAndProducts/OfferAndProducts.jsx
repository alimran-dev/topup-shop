import { useState } from "react";
import Offers from "./Offers/Offers";
import SpecialProducts from "./SpecialProducts/SpecialProducts";


const OffersAndProducts = () => {

    const [selectedTab, setSelectedTab] = useState("offers");

    const tabItems = [
        {id: 1, name: "offers"},
        {id: 2, name: "special products"},
    ]

    return (
        <div>
            
            {/* tab buttons */}
            <div className="flex justify-center items-center border-b border-b-slate-300">
                {
                    tabItems?.map(item =>
                        <button key={item?.id} onClick={() => setSelectedTab(item?.name)} className={`border ${selectedTab == item?.name ? "border-slate-300" : "border-transparent"} border-b-0 px-4 py-2 capitalize duration-200`}>
                            {item?.name}
                        </button>
                    )
                }
            </div>

            {/* content */}
            <div className="py-2 md:py-5">
                {
                    selectedTab  == "offers" && <Offers />
                }
                {
                    selectedTab  == "special products" && <SpecialProducts />
                }
            </div>
        
        </div>
    );
};

export default OffersAndProducts;