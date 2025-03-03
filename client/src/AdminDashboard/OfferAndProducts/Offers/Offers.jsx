import { FaPlus } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { FaPenToSquare, FaTrash } from "react-icons/fa6";
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';


const Offers = () => {

    // dummy data
    const offers = [
        { id: 1, name: "Offer 1", description: "Limited-time discount on coins!", price: 100, type: "coin", stock: 10 },
        { id: 2, name: "Offer 2", description: "Exclusive token deal!", price: 200, type: "tk", stock: 0 },
        { id: 3, name: "Offer 3", description: "Special bonus for premium users!", price: 150, type: "coin", stock: 10 },
    ];


    // offer delete fn
    const handleDelete = (id) => {
        console.log(`Deleting offer with ID: ${id}`);
        Swal.fire({
            title: "Are you sure?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Delete"
        }).then((result) => {
            if (result.isConfirmed) {

                // call api here
                toast.success('Deleted!');

            }
        });
    };


    return (
        <div>

            {/* add new btn */}
            <div className="flex justify-center md:justify-end pt-3 pb-5">
                <Link to={"/dashboard/offersAndProducts/manageOffer"} className="button flex items-center gap-1">
                    <FaPlus />
                    All Offer
                </Link>
            </div>

            {/* Offers list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.length === 0 ? (
                    <p className="text-gray-500 text-center col-span-3">No offers available</p>
                ) : (
                    offers.map((offer) => (
                        <div key={offer.id} className="bg-white shadow-sm p-4 rounded-md border border-gray-200">
                            <h3 className="text-lg font-semibold">{offer.name}</h3>
                            <p className="text-gray-600 text-sm mt-1">{offer.description}</p>

                            {/* Offer details */}
                            <div className="mt-3 text-sm text-gray-700">
                                <p><strong>Price:</strong> {offer.price} {offer.type}</p>
                                <p><strong>Stock:</strong> {offer.stock > 0 ? offer.stock : <span className="text-red-500">Out Of Stock</span>}</p>
                            </div>

                            {/* Buttons */}
                            <div className="mt-4 flex justify-between">
                                <Link to={`/dashboard/offersAndProducts/manageOffer/${offer.id}`} className="text-blue-500 flex items-center gap-1">
                                    <FaPenToSquare />
                                    Edit
                                </Link>
                                <button onClick={() => handleDelete(offer.id)} className="text-red-500 flex items-center gap-1">
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