import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { BsCoin } from "react-icons/bs";
import { TbCurrencyTaka } from "react-icons/tb";
import { FaExternalLinkAlt } from "react-icons/fa";


const SpecialOfferDetails = () => {
    const { id } = useParams();
    const [offer, setOffer] = useState(null);

    const offers = [
        { id: 1, name: "Offer 1", description: "Limited-time discount on coins!", price: 100, type: "coin", stock: 10 },
        { id: 2, name: "Offer 2", description: "Exclusive token deal!", price: 200, type: "tk", stock: 10 },
        { id: 3, name: "Offer 3", description: "Special bonus for premium users!", price: 150, type: "coin", stock: 0 },
    ];

    useEffect(() => {
        const foundOffer = offers.find(o => o.id === parseInt(id));
        setOffer(foundOffer);
    }, [id]);

    if (!offer) {
        return <div className="text-center py-10 text-xl text-red-500">Offer not found!</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="py-10 px-6 bg-white rounded-lg border border-slate-300 text-center">
                <h2 className="text-lg md:text-3xl font-bold mb-3">{offer.name}</h2>
                <p className="text-gray-600 my-3">{offer.description}</p>
                <p className="text-sm md:text-lg font-bold flex justify-center items-center">
                    {
                        offer?.type == "coin" ?
                            <BsCoin className="mr-1" /> : <TbCurrencyTaka />
                    }
                    {offer?.price}
                </p>
                <p className={`text-sm md:text-lg font-semibold ${offer.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {offer.stock > 0 ? "In Stock" : "Out of Stock"}
                </p>
                <button className="mt-4 px-6 py-2 bg-primary text-white rounded-md">
                    Purchase
                </button>
                <div className="mt-5 md:mt-10 text-blue-700 font-semibold">
                    <Link to={"https://youtu.be/IpFX2vq8HKw?list=RDMMIpFX2vq8HKw"} target="_blank" className="flex justify-center items-center gap-1">
                        Click to Watch Video
                        <FaExternalLinkAlt />
                    </Link>
                </div>
            </div>

            {/* ------- show input boxes -------- */}
            {/* <>
                {Object?.entries(inputValues)?.map(([key, value]) => (
                    <p key={key} className="flex items-center gap-2 border-b border-b-slate-300 pb-1 mb-1 capitalize">
                        <span className="w-24 font-semibold">{key}</span>
                        <span>:</span>
                        <span>{value}</span>
                    </p>
                ))}
            </> */}
            {/* -------------------------------- */}
        </div>
    );
};

export default SpecialOfferDetails;
