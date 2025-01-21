import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import { useEffect, useState } from "react";

const ConfirmPurchase = () => {
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();
    const { user, setUser } = useAuth();
    const { selected, inputValues, allData } = location.state;

    const handlePurchase = () => {

        setLoading(true);

        const orderData = {
            id: allData._id,
            email: user?.email,
            index: selected.idx - 1,
            name: selected.name,
            price: selected.price,
            info: inputValues,
        };

        axiosPrivate.post("/order/new/dynamic", orderData)
            .then((res) => {
                if (res.data.success) {
                    toast.success("Order Placed Successfully!");
                    setUser({
                        ...user,
                        balance: user?.balance - res.data.price,
                        orders: user?.orders + 1,
                        spent: user?.spent + selected.price,
                    });
                    setLoading(false);
                    navigate("/myOrders");
                } else {
                    setLoading(false);
                    toast.error(res.data.message || "Order Place Failed!");
                }
            })
            .catch((err) => {
                setLoading(false);
                toast.error(err.response.data.error || 'Failed to purchase!');
            });
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="md:py-5">
            <h1 className="title">Confirm Purchase</h1>
            <div className="max-w-xl mx-auto border-2 border-slate-300 rounded pb-5">
                <h2 className="font-bold text-lg py-2 mb-2 text-center bg-slate-100">Order Sumarry</h2>
                <div className="px-4 py-2">
                    <p className="flex items-center gap-2 border-b border-b-slate-300 pb-1 mb-1">
                        <span className="w-24 font-semibold">Option</span>
                        <span>:</span>
                        <span>{selected?.name}</span>
                    </p>
                    <p className="flex items-center gap-2 border-b border-b-slate-300 pb-1 mb-1">
                        <span className="w-24 font-semibold">Price</span>
                        <span>:</span>
                        <span>৳{selected?.price}</span>
                    </p>
                    {Object.entries(inputValues).map(([key, value]) => (
                        <p key={key} className="flex items-center gap-2 border-b border-b-slate-300 pb-1 mb-1 capitalize">
                            <span className="w-24 font-semibold">{key}</span>
                            <span>:</span>
                            <span>{value}</span>
                        </p>
                    ))}
                    <p className="flex items-center gap-2 border-b border-b-slate-300 pb-1 mb-1">
                        <span className="w-24 font-semibold normal-case">E-mail</span>
                        <span>:</span>
                        <span>{user?.email}</span>
                    </p>
                </div>
                <div className="flex justify-center mt-4">
                    <button onClick={handlePurchase} className="button" disabled={loading}>
                        {loading ? "Please Wait" : "Confirm Purchase"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmPurchase;
