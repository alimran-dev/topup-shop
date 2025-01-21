import { useEffect, useState } from "react";
import AddFollowUs from "./AddFollowUs/AddFollowUs";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import toast from "react-hot-toast";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import UpdateFollowUs from "./UpdateFollowUs/UpdateFollowUs";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";


const FollowUs = () => {

    const [followUsData, setFollowUsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();


    // load all follow us data
    useEffect(() => {
        setLoading(true);

        axiosPrivate.get("/follows/get").then((res) => {
            setFollowUsData(res.data || []);
            setLoading(false);
        }).catch(err => {
            console.log(err);
            setLoading(false);
            toast.error("Failed to load data!")
        });
    }, [axiosPrivate]);


    // handle delete banner fn
    const handleDeleteFollowUs = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Delete"
        }).then((result) => {
            if (result.isConfirmed) {
                axiosPrivate.delete(`/follows/delete?id=${id}`).then((res) => {
                    if (res.data.acknowledged) {
                        toast.success('Deleted Successfully!');
                        setFollowUsData(prevOptions => prevOptions?.filter((banner) => banner?._id !== id));
                    }
                    else {
                        toast.error("Failed To Delete!");
                    }
                }).catch(err => {
                    console.log(err);
                    toast.error("Failed To Delete!");
                });

            }
        });
    };

    return (
        <div>
            <AddFollowUs />

            <h1 className="title mt-4">Follow Us</h1>

            <div>
                {
                    loading ?
                        <div className="font-bold text-center py-10">Loading...</div>
                        :
                        <>
                            {
                                followUsData?.length == 0 ?
                                    <div className="font-bold text-center text-red-600">Not Data Found!</div>
                                    :
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-28 md:gap-8 pb-20">
                                        {
                                            followUsData?.map((followUs, idx) =>
                                                <div key={idx} className="bg-slate-50 px-4 py-2 border border-slate-400">
                                                    <div className="flex items-center gap-2 border-b border-b-slate-400 pb-2 mb-2">
                                                        <img src={followUs?.icon} className="w-32 h-32 object-contain" alt="" />
                                                        <p className="font-medium">
                                                            {followUs?.text}
                                                        </p>
                                                    </div>
                                                    <p>
                                                        <span className="font-bold">URL: </span>
                                                        <Link to={followUs?.url} target="_blank" className="text-blue-700">{followUs?.url}</Link>
                                                    </p>
                                                    <div className="flex justify-end items-center text-2xl gap-5 pt-3">
                                                        <button onClick={() => document.getElementById(`update_followUs_${idx}`).showModal()} className="text-green-700"><FaEdit /></button>
                                                        <UpdateFollowUs idx={idx} followUs={followUs} />
                                                        <button onClick={() => handleDeleteFollowUs(followUs?._id)} className="text-red-600"><MdDelete /></button>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div>
                            }
                        </>
                }
            </div>

        </div>
    );
};

export default FollowUs;