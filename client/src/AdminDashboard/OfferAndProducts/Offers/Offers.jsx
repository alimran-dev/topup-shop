import { FaPlus } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { FaPenToSquare, FaTrash } from "react-icons/fa6";
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { useState, useEffect } from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";


const Offers = () => {

    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    // load offers
    useEffect(() => {

        setLoading(true);
        const fetchData = async () => {
            const res = await axiosPrivate("/special/admin/all");
            // console.log(res.data);
            setOffers(res.data || []);
            setLoading(false);
        };
        fetchData();
    }, []);

    // offer delete fn
    const handleDelete = (id) => {
        // console.log(`Deleting offer with ID: ${id}`);
        Swal.fire({
            title: "Are you sure?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Delete"
        }).then(async (result) => {
            if (result.isConfirmed) {
                const res = await axiosPrivate.delete(`/special/delete?id=${id}`);
                // console.log(res.data);
                if (res.data.acknowledged) {
                    setOffers((prevOffers) => prevOffers?.filter((offer) => offer?._id !== id));
                    toast.success('Deleted!');
                }
                else {
                    toast.error('Something Went Wrong!');
                }
            }
        });
    };


    if (loading) {
        return <div className="py-10 text-center">Loading...</div>;
    }

    return (
        <div>

            {/* add new btn */}
            <div className="flex justify-center md:justify-end pt-3 pb-5">
                <Link to={"/dashboard/offersAndProducts/manageOffer"} className="button flex items-center gap-1">
                    <FaPlus />
                    Add Offer
                </Link>
            </div>

            {/* Offers list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 capitalize">
                {offers.length === 0 ? (
                    <p className="text-gray-500 text-center col-span-3">No offers available</p>
                ) : (
                    offers.map((offer) => (
                        <div key={offer?._id} className="bg-white shadow-sm p-4 rounded-md border border-gray-200">
                            <img src={offer?.image} className="w-full max-h-40 object-cover" alt={offer?.title || "offer image"} />
                            <div className="flex justify-between items-center pt-2">
                                <h3 className="text-lg font-semibold">{offer?.title}</h3>
                                <div className={`${offer?.isActive ? "badge-success" : "badge-error"} badge text-white`}>
                                    {offer?.isActive ? "Active" : "Inactive"}
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm mt-1">{offer?.shortDescription}</p>

                            <div className="flex justify-between items-center py-1 opacity-75">
                                <p><strong>Price:</strong> {offer?.price}</p>
                                <p><strong>Stock:</strong> {offer?.stock > 0 ? offer?.stock : <span className="text-red-500">Out Of Stock</span>}</p>
                            </div>

                            <div className="flex justify-between items-center opacity-75">
                                <p><strong>Link: </strong>
                                    <Link to={offer?.tutorialUrl || "/"} className="text-blue-600" target="_blank">{offer?.tutorialTitle}</Link>
                                </p>
                                <p><strong>Type:</strong> {offer?.type}</p>
                            </div>

                            <div className="opacity-75 pt-1 flex justify-between items-center">
                                <div>
                                    <strong>Inputs: </strong>
                                    {offer?.inputs?.map((input, idx) =>
                                        <span key={idx} className="mr-1">
                                            {input}{idx < offer.inputs.length - 1 ? "," : ""}
                                        </span>
                                    )}
                                </div>
                                <p><strong>Sequence:</strong> {offer?.sequence}</p>
                            </div>

                            {/* Buttons */}
                            <div className="mt-4 flex justify-between">
                                <Link to={`/dashboard/offersAndProducts/manageOffer/${offer?._id}`} className="text-blue-800 flex items-center gap-1">
                                    <FaPenToSquare />
                                    Edit
                                </Link>
                                <button onClick={() => handleDelete(offer?._id)} className="text-red-500 flex items-center gap-1">
                                    <FaTrash />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

        </div>
    );
};

export default Offers;