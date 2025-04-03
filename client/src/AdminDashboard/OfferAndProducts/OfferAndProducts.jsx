import { useState } from "react";
import Offers from "./Offers/Offers";
import SpecialProducts from "./SpecialProducts/SpecialProducts";


const OffersAndProducts = () => {

    const [selectedTab, setSelectedTab] = useState("special offers");

    const tabItems = [
        { id: 1, name: "special offers" },
        { id: 2, name: "coin products" },
    ];
    

    return (
        <div>

            {/* tab buttons */}
            <div className="flex justify-center items-center border-b border-b-slate-500">
                {
                    tabItems?.map(item =>
                        <button key={item?.id} onClick={() => setSelectedTab(item?.name)} className={`border ${selectedTab == item?.name ? "border-slate-500" : "border-transparent"} border-b-0 px-4 py-2 capitalize duration-200`}>
                            {item?.name}
                        </button>
                    )
                }
            </div>

            {/* content */}
            <div className="py-2 md:py-5">
                {
                    selectedTab == "special offers" && <Offers />
                }
                {
                    selectedTab == "coin products" && <SpecialProducts />
                }
            </div>

        </div>
    );
};

export default OffersAndProducts;