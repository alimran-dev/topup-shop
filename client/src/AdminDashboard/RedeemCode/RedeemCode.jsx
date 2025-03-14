import { useEffect, useState } from "react";
import RedeemCodeForm from "./RedeemCodeForm/RedeemCodeForm";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import toast from 'react-hot-toast';


const RedeemCode = () => {
    const [redeemCodes, setRedeemCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    // load codes
    useEffect(() => {
        const fetchRedeemCodes = async () => {
            setLoading(true);
            try {
                const res = await axiosPrivate.get('/redeem/all');
                console.log(res?.data);
                setRedeemCodes(res?.data?.codes);
            } catch (error) {
                console.error("Error fetching redeem codes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRedeemCodes();
    }, [axiosPrivate]);


    // delete fn
    const handleDelete = (id) => {

        Swal.fire({
            title: "Are you sure?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {

                try {
                    const res = await axiosPrivate.delete(`/redeem/delete?id=${id}`);
                    // console.log(res?.data);
                    setRedeemCodes(prevCodes => prevCodes.filter(code => code._id !== id));
                    toast.success('Deleted Successfully!');
                } catch (error) {
                    // console.error("Error fetching redeem codes:", error);
                    toast.error('Something went wrong!');
                }
            }
        });
    };


    return (
        <div>
            <h2 className="title">Redeem Code</h2>

            {/* Add new redeem code */}
            <div>
                <button onClick={() => document.getElementById('add_redeem_code').showModal()} className="button flex mx-auto">
                    Add Redeem Code
                </button>

                <dialog id="add_redeem_code" className="modal">
                    <div className="modal-box bg-white">
                        <form method="dialog">
                            {/* If there is a button in form, it will close the modal */}
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                        </form>
                        <RedeemCodeForm setRedeemCodes={setRedeemCodes} />
                    </div>
                </dialog>
            </div>

            {/* Display redeem codes */}
            {loading ? (
                <p className="text-center py-10">Loading...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {redeemCodes?.map((code, idx) => (
                        <div key={code._id} className={`${idx % 2 ? "bg-slate-50" : "bg-slate-100"} p-4 rounded-md shadow-md border border-slate-200 space-y-1`}>

                            <div className="flex justify-between items-center">
                                <h3 className="text-base md:text-lg font-semibold">Code: {code?.code}</h3>
                                <p className={`badge text-white ${code?.isActive ? 'badge-success' : "badge-error"}`}>{code?.isActive ? "Active" : "Inactive"}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p>Type: <span className="font-medium">{code?.type}</span></p>
                                <p>Value: <span className="font-medium">{code?.value}</span></p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p>Quantity: <span className="font-medium">{code?.quantity}</span></p>
                                <p>Remaining: <span className="font-medium">{code?.remaining}</span></p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p>Expires: {new Date(code?.expiredAt)?.toLocaleDateString()}</p>
                            </div>

                            <div className="flex justify-between items-center pt-3 text-white text-xs md:text-sm">

                                {/* update btn with modal */}
                                <div>
                                    <button onClick={() => document.getElementById(`update_redeem_code${code?._id}`).showModal()} className="px-3 py-1 rounded-md bg-blue-600 flex items-center gap-1">
                                        <FaEdit />
                                        Edit
                                    </button>
                                    <dialog id={`update_redeem_code${code?._id}`} className="modal">
                                        <div className="modal-box bg-white">
                                            <form method="dialog">
                                                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-black">✕</button>
                                            </form>
                                            <RedeemCodeForm redeemCodeData={code} setRedeemCodes={setRedeemCodes} />
                                        </div>
                                    </dialog>
                                </div>

                                {/* delete btn */}
                                <button onClick={() => handleDelete(code._id)} className="px-3 py-1 rounded-md bg-red-600 flex items-center gap-1">
                                    <FaTrashAlt />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RedeemCode;
