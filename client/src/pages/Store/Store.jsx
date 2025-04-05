import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import Coin from "../../components/reusuable/Coin/Coin";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import toast from "react-hot-toast";
import {Link} from "react-router-dom";


const Store = () => {

    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const axiosPrivate = useAxiosPrivate();

     // load products
     useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const res = await axiosPrivate.get("/coins/product/all");
                setProducts(res.data);
            } catch (err) {
                toast.error("Failed to load products.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [axiosPrivate]);


    // page apear from top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="py-10 md:px-6 max-w-5xl mx-auto">
            {/* Coin balance */}
            <div className="bg-primary text-center py-5 md:py-10 rounded-md text-white font-semibold">
                <h2 className="text-xl md:text-2xl">Your Coin Balance</h2>
                <p className="flex justify-center items-center gap-1">
                    <Coin />
                    <span>{user?.coins}</span>
                </p>
            </div>

            {/* Products */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2 md:gap-6 mt-5 md:mt-10">
                {/* Loading State */}
                {loading ? (
                    <div className="py-10 text-center font-semibold">Loading...</div>
                ) : products.length === 0 ? (
                    <div className="py-10 text-center font-semibold">No Product Found!</div>
                ) : (
                    products.map((product) => (
                        <div key={product?._id} className="bg-white rounded-lg shadow-md p-6 text-center border border-gray-200">
                            <h3 className="text-lg font-semibold mb-2">{product?.title}</h3>
                            <p className="text-xl font-bold text-blue-600 flex justify-center items-center gap-1">
                                <Coin />
                                {product?.price}
                            </p>
                            <p className={`text-sm font-semibold mt-2 ${product?.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {product?.stock > 0 ? "In Stock" : "Out of Stock"}
                            </p>
                            <Link to={`/store/${product?._id}`}
                                className={`inline-block mt-3 px-4 button ${!product?.stock > 0 && '!bg-gray-400 cursor-not-allowed'}`}
                                disabled={product?.stock === 0}
                            >
                                Purchase
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Store;
