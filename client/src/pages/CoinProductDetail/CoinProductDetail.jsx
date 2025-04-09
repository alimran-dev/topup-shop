import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Coin from "../../components/reusuable/Coin/Coin";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";


const CoinProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inputValues, setInputValues] = useState({});
    const { user } = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            setLoading(true);
            const fetchData = async () => {
                try {
                    const res = await axiosPrivate.get(`/coins/product?id=${id}`);
                    // console.log(res.data);
                    setProduct(res.data);
                } catch (err) {
                    // console.log(err);
                    toast.error(err?.response?.data?.message || "Failed to load!");
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [id, axiosPrivate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePurchase = async () => {
        if (!product?.stock) {
            toast.error("Product is out of stock!");
            return;
        }

        const info = { ...inputValues };

        if (Object.keys(inputValues).length === 0) {
            toast.error("Please Fill The Inputs!");
            return;
        }

        const payload = {
            id: product?._id,
            email: user?.email,
            info: info,
        };

        try {
            await axiosPrivate.post("/order/coin/product", payload);
            toast.success("Purchase Successful!");
            navigate("/myOrders")
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to place order!");
        }
    };


    if (loading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    if (!product) {
        return <div className="text-center py-10">Product not found!</div>;
    }

    return (
        <div className="py-10 md:px-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 text-center border border-gray-200">
                <h3 className="text-2xl font-semibold mb-4">{product?.title}</h3>
                <p className="text-gray-500 mb-4">{product?.shortDescription}</p>
                <p className="text-xl font-bold text-blue-600 flex justify-center items-center gap-1">
                    <Coin />
                    {product?.price}
                </p>
                <p className={`text-sm font-semibold mt-2 ${product?.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product?.stock > 0 ? "In Stock" : "Out of Stock"}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2 mt-3">
                    {product?.inputs?.map((input, idx) =>
                        <input key={idx} type="text" name={input} className="border px-2 py-1 rounded outline-none" placeholder={input} required onChange={handleInputChange} />
                    )}
                </div>

                <button
                    className={`mt-4 px-4 py-2 button ${!product?.stock > 0 && '!bg-gray-400 cursor-not-allowed'}`}
                    disabled={product?.stock === 0}
                    onClick={handlePurchase}
                >
                    Purchase
                </button>
            </div>
        </div>
    );
};

export default CoinProductDetail;
