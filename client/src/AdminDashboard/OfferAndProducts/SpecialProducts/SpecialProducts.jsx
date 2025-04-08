import { useEffect, useState } from "react";
import { FaPenToSquare, FaPlus, FaTrash } from "react-icons/fa6";
import { Link } from "react-router-dom";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import Coin from "../../../components/reusuable/Coin/Coin";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const SpecialProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    // Load products
    useEffect(() => {
        setLoading(true);
        const fetchProducts = async () => {
            try {
                const res = await axiosPrivate.get("/coins/product/all");
                setProducts(res.data);
            } catch (error) {
                console.error("Failed to load special products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [axiosPrivate]);


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
        }).then(async (result) => {
            if (result.isConfirmed) {
                const res = await axiosPrivate.delete(`/coins/product/delete?id=${id}`);
                // console.log(res.data);
                if (res.data.acknowledged) {
                    setProducts((prevOffers) => prevOffers?.filter((offer) => offer?._id !== id));
                    toast.success('Deleted!');
                }
                else {
                    toast.error('Something Went Wrong!');
                }
            }
        });
    };


    return (
        <div className="px-4">
            {/* Add new btn */}
            <div className="flex justify-center md:justify-end pt-3 pb-5">
                <Link
                    to="/dashboard/offersAndProducts/manageSpecialProduct"
                    className="button flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-md transition"
                >
                    <FaPlus />
                    All Coin Product
                </Link>
            </div>

            {/* Products */}
            {loading ? (
                <p className="text-center text-gray-500">Loading products...</p>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div
                            key={product?._id}
                            className="bg-white rounded-xl shadow-md p-5 border border-gray-100"
                        >
                            <div className="mb-3 flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                                    {product?.title}
                                </h3>
                                <p className={`badge ${product?.isActive ? "badge-success" : "badge-error"} text-white capitalize`}>
                                    {product?.isActive ? "Active" : "Inactive"}
                                </p>
                            </div>
                            <p className="text-gray-600 text-sm">{product?.shortDescription}</p>
                            <div className="flex justify-between text-sm text-gray-700">
                                <div>
                                    <span className="font-semibold">Price:</span> <Coin /> {product?.price}
                                </div>
                                <div>
                                    <span className="font-semibold">Stock:</span> {product?.stock}
                                </div>
                            </div>
                            <div className="opacity-75 pt-1">
                                <span className="font-semibold">Inputs: </span>
                                {product?.inputs?.map((input, idx) =>
                                    <span key={idx} className="mr-1">
                                        {input}{idx < product.inputs.length - 1 ? "," : ""}
                                    </span>
                                )}
                            </div>
                            {/* Buttons */}
                            <div className="mt-4 flex justify-between">
                                <Link to={`/dashboard/offersAndProducts/manageSpecialProduct/${product?._id}`} className="text-blue-800 flex items-center gap-1">
                                    <FaPenToSquare />
                                    Edit
                                </Link>
                                <button onClick={() => handleDelete(product?._id)} className="text-red-500 flex items-center gap-1">
                                    <FaTrash />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-400">No special products found.</p>
            )}
        </div>
    );
};

export default SpecialProducts;
