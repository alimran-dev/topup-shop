import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import toast from "react-hot-toast";


const ViewSummary = () => {

    const [summaryData, setSummaryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();
    const { state } = useLocation();


    useEffect(() => {
        setLoading(false);
        const fetchData = async () => {
            try {
                const res = await axiosPrivate.get("", state?.filterData);
                console.log(res.data);
                setSummaryData(res?.data || []);
            }
            catch (err) {
                toast.error(err?.response?.data?.message || "Error Fetching Data!")
            }
            finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [axiosPrivate, state?.filterData]);



    console.log(summaryData);



    if (loading) {
        return <div className='py-8 text-center'>Loading...</div>
    }

    return (
        <div className='max-w-5xl mx-auto'>
            <h2 className='title'>View Summary</h2>

            {/* all filter data */}
            <div className='flex flex-wrap justify-center items-center gap-2'>
                <p className='px-3 py-1 bg-slate-100 rounded-sm'><strong>Email:</strong> {state?.filterData?.searchEmail}</p>
                <p className='px-3 py-1 bg-slate-100 rounded-sm'>
                    <strong>Date Range:</strong>{" "}
                    {new Date(state?.filterData?.fromDate).toLocaleDateString("en-GB")} -{" "}
                    {new Date(state?.filterData?.toDate).toLocaleDateString("en-GB")}
                </p>
                <p className='px-3 py-1 bg-slate-100 rounded-sm'><strong>Category:</strong> {state?.filterData?.selectedCategory}</p>
                <p className='px-3 py-1 bg-slate-100 rounded-sm'><strong>Category:</strong> {state?.filterData?.selectedSubCategory}</p>
            </div>

            {/* summary data */}
            <div className="max-w-xl mx-auto border-2 border-slate-300 rounded pb-5 mt-4">
                <h2 className="font-bold text-lg py-2 mb-2 text-center bg-slate-100">
                    Order Sumarry
                </h2>
                <div className="px-4 py-2">
                    <p className="flex items-center gap-2 border-b border-b-slate-300 pb-1 mb-1">
                        <span className="w-28 font-semibold">Total Order</span>
                        <span>:</span>
                        <span>10</span>
                    </p>
                    <p className="flex items-center gap-2 border-b border-b-slate-300 pb-1 mb-1">
                        <span className="w-28 font-semibold">Total Amount</span>
                        <span>:</span>
                        <span>৳1000</span>
                    </p>
                    <p className="flex items-center gap-2 border-b border-b-slate-300 pb-1 mb-1">
                        <span className="w-28 font-semibold">Spam Order</span>
                        <span>:</span>
                        <span>5</span>
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="w-28 font-semibold">New Order</span>
                        <span>:</span>
                        <span>10</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ViewSummary;