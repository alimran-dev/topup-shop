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
            <AddNewBanner />

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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-28 md:gap-8 pb-20">
                                        {
                                            banners?.map((banner, idx) =>
                                                <div key={idx}>
                                                    <img src={banner?.image} className="w-full h-full pb-4" alt="banner image" />
                                                    <div className="border-b border-b-slate-400 pb-2 mb-3">
                                                        <div className="flex justify-end items-center text-2xl gap-5">
                                                            <button onClick={()=>document.getElementById(`update_banner_${idx}`).showModal()} className="text-green-700"><FaEdit /></button>
                                                            <UpdateBanner idx={idx} banner={banner} />
                                                            <button onClick={() => handleDeleteBanner(banner?._id)} className="text-red-600"><MdDelete /></button>
                                                        </div>
                                                        <Link to={banner?.url} target="_blank">{banner?.url}</Link>
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