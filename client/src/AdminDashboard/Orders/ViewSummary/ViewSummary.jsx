import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import toast from "react-hot-toast";


const ViewSummary = () => {

    const [summaryData, setSummaryData] = useState([{}]);
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();
    const { state } = useLocation();

    console.log(state);


    useEffect(() => {
        setLoading(false);
        const fetchData = async () => {
            try {
                const res = await axiosPrivate.get(`/order/summary?search=${state?.filterData?.searchEmail}&fromDate=${state?.filterData?.fromDate}&toDate=${state?.filterData?.toDate}&category=${encodeURIComponent(state?.filterData?.category)}&subCategory=${encodeURIComponent(state?.filterData?.subCategory)}`);
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
                <p className='px-3 py-1 bg-slate-100 rounded-sm'><strong>Category:</strong> {state?.filterData?.category}</p>
                <p className='px-3 py-1 bg-slate-100 rounded-sm'><strong>SubCategory:</strong> {state?.filterData?.subCategory}</p>
            </div>

            {/* summary data */}
            <div className="max-w-xl mx-auto border-2 border-slate-300 rounded pb-5 mt-4">
                <h2 className="font-bold text-lg py-2 mb-2 text-center bg-slate-100">
                    Order Sumarry
                </h2>
                <div className="px-4 py-2">
                    {
                        summaryData &&
                        Object.entries(summaryData[0])?.map(([key, value]) => (
                            <p key={key} className="flex items-center gap-2">
                                <span className="font-semibold capitalize">{key}</span>
                                <span>:</span>
                                <span>{value}</span>
                            </p>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default ViewSummary;