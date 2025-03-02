import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { BsCoin } from "react-icons/bs";
import { TbCurrencyTaka } from "react-icons/tb";

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
        <div className="max-w-2xl mx-auto py-10 px-6 bg-white rounded-lg border border-slate-300 text-center">
            <h2 className="text-3xl font-bold mb-4">{offer.name}</h2>
            <p className="text-gray-600 mb-4">{offer.description}</p>
            <p className="text-lg font-bold text-blue-600 flex justify-center items-center">
                {
                    offer?.type == "coin" ?
                        <BsCoin className="mr-1" /> : <TbCurrencyTaka />
                }
                {offer?.price}
            </p>
            <p className={`text-lg font-semibold mt-2 ${offer.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {offer.stock > 0 ? "In Stock" : "Out of Stock"}
            </p>
            <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Purchase
            </button>
        </div>
    );
};

export default SpecialOfferDetails;
