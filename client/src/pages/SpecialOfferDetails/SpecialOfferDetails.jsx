import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { BsCoin } from "react-icons/bs";
import { TbCurrencyTaka } from "react-icons/tb";
import { FaExternalLinkAlt } from "react-icons/fa";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const SpecialOfferDetails = () => {
    const { id } = useParams();
    const [offer, setOffer] = useState(null);
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const axiosPublic = useAxiosPublic();
    const axiosPrivate = useAxiosPrivate();


    // load offers
    useEffect(() => {
        setLoading(true);
        const fetchData = async () => {
            const res = await axiosPublic.get(`/special/get?id=${id}`);
            setOffer(res?.data || null);
            setLoading(false);
        };
        fetchData();
    }, [axiosPublic, id]);

    // purchase fn
    const handlePurchase = async (e) => {

        e.preventDefault();
        setBtnLoading(true);

        // Get input values as an object
        const formData = new FormData(e.target);
        const inputValues = offer?.inputs?.reduce((acc, input) => {
            acc[input] = formData.get(input) || "";
            return acc;
        }, {});

        // Check if any field is empty
        if (Object.values(inputValues).some(value => value.trim() === "")) {
            toast.error("Please fill the boxes!");
            setBtnLoading(false);
            return;
        }

        // if user is not varified
        if(!user?.isVerified){
            setBtnLoading(false);
            toast.error("Please Verify Your Email!");
            return;
        }

        const orderData = {
            id,
            email: user?.email,
            info: inputValues
        };

        // console.log(orderData);
        

        try {
            const res = await axiosPrivate.post("/order/new/special", orderData);

            // console.log("res-------", res.data);
            if (res.data.success) {
                toast.success("Purchase successful!");
            } else {
                toast.error("Purchase failed. Please try again.");
            }
        } catch (error) {
            // console.log(error);
            toast.error(error?.response?.data?.message || "Something went wrong. Try again later.");
        }
        finally {
            setBtnLoading(false);
        }
    };
    

    if (loading) {
        return <div className="py-10 text-center">Loading...</div>
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="py-10 px-6 bg-white rounded-lg border border-slate-300 text-center relative">
                <p className={`absolute top-2 right-2 text-white text-[10px] md:text-xs font-semibold badge ${offer?.stock > 0 ? 'badge-success' : 'badge-error'}`}>
                    {offer?.stock > 0 ? "In Stock" : "Stock Out"}
                </p>
                <img src={offer?.image} className="w-full h-full object-cover" alt={offer?.title || "Offer image"} />
                <h2 className="text-lg md:text-3xl font-bold my-3">{offer?.title}</h2>
                <p className="text-lg font-bold flex justify-center items-center text-primary">
                    {
                        offer?.type == "coin" ?
                            <BsCoin className="mr-1" /> : <TbCurrencyTaka />
                    }
                    {offer?.price}
                </p>
                <p className="text-gray-600 mb-2">{offer?.shortDescription}</p>
                {/* input boxes*/}
                <h3 className="font-semibold py-2 text-left">Fill the inputs:</h3>
                <form onSubmit={handlePurchase}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {offer?.inputs?.map((input, idx) =>
                            <input key={idx} type="text" name={input} className="border px-2 py-1 rounded outline-none" placeholder={input} required />
                        )}
                    </div>
                    <button type="submit" className="mt-4 px-6 py-2 bg-primary text-white rounded-md" disabled={btnLoading}>
                        {btnLoading ? "Loading..." : "Purchase"}
                    </button>
                </form>
                <div className="mt-5 md:mt-10 text-blue-700 font-semibold">
                    <Link to={offer?.tutorialUrl || "/"} target="_blank" className="flex justify-center items-center gap-1">
                        {offer?.tutorialTitle}
                        <FaExternalLinkAlt />
                    </Link>
                </div>
            </div>

        </div>
    );
};

export default SpecialOfferDetails;
