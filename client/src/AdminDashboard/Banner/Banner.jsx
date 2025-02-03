import { useEffect, useState } from "react";
import AddNewBanner from "./AddNewBanner/AddNewBanner";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import UpdateBanner from "./UpdateBanner/UpdateBanner";
import Swal from "sweetalert2";


const Banner = () => {

    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    // load all banners
    useEffect(() => {
        setLoading(true);

        axiosPrivate.get("/banners/get").then((res) => {
            setBanners(res.data || []);
            setLoading(false);
        }).catch(err => {
            console.log(err);
            setLoading(false);
            toast.error("Failed to load Banners")
        });
    }, [axiosPrivate]);

    // handle delete banner fn
    const handleDeleteBanner = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Delete"
        }).then((result) => {
            if (result.isConfirmed) {
                axiosPrivate.delete(`/banners/delete?id=${id}`).then((res) => {
                    if (res.data.acknowledged) {
                        toast.success('Deleted Successfully!');
                        setBanners(prevOptions => prevOptions?.filter((banner) => banner?._id !== id));
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
            <AddNewBanner setBanners={setBanners} />

            <h1 className="title mt-3 md:mt-8">Banners</h1>
            <div>
                {
                    loading ?
                        <div className="font-bold text-center py-10">Loading...</div>
                        :
                        <>
                            {
                                banners?.length == 0 ?
                                    <div className="font-bold text-center text-red-600">Not Data Found!</div>
                                    :
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
                                        {
                                            banners?.map((banner, idx) =>
                                                <div key={idx} className="bg-slate-50 border border-slate-400 p-4 flex flex-col justify-between">
                                                    <div className="w-full h-[150px] md:h-[300px]">
                                                        <img src={banner?.image} className="w-full h-full object-fill pb-4" alt="banner image" />
                                                    </div>
                                                    <div className="">
                                                        <div className="flex justify-end items-center text-2xl gap-5 pb-4">
                                                            <button onClick={() => document.getElementById(`update_banner_${idx}`).showModal()} className="text-green-700"><FaEdit /></button>
                                                            <UpdateBanner idx={idx} banner={banner} setBanners={setBanners} />
                                                            <button onClick={() => handleDeleteBanner(banner?._id)} className="text-red-600"><MdDelete /></button>
                                                        </div>
                                                        <span className="font-bold">URL: </span>
                                                        <Link to={banner?.url} target="_blank" className="text-blue-700">{banner?.url}</Link>
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

export default Banner;