import { Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import toast from 'react-hot-toast';
import { AiFillDelete } from "react-icons/ai";
import { FaRegEdit } from "react-icons/fa";
import { TbArrowsSplit2, TbListDetails } from "react-icons/tb";
import Swal from "sweetalert2";


const Services = () => {

    const [selectedCategory, setSelectedCategory] = useState("");
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();
    const axiosPublic = useAxiosPublic();

    // Load categories
    useEffect(() => {
        axiosPublic
            .get("/category")
            .then((res) => setCategories(res.data))
            .catch((err) => console.error("Failed to load categories:", err));
    }, [axiosPublic]);

    // load services
    useEffect(() => {
        const fetchServices = async () => {
            if (selectedCategory) {
                setLoading(true);
                try {
                    const { data } = await axiosPrivate.get('/services');
                    const filteredServices = data.filter(service => service.categoryId === selectedCategory);
                    setServices(filteredServices);
                    setLoading(false);
                } catch (error) {
                    setLoading(false);
                    console.error("Failed to fetch services:", error);
                    toast.error('Failed To Load Data!');
                }
            }
        };

        fetchServices();
    }, [selectedCategory, axiosPrivate]);


    // delete service fn
    const handleDeleteService = async (id, childCount) => {
        const warningText = childCount > 0
            ? `This service has ${childCount} nested sub-service(s). Deleting it will also delete ALL nested sub-services!`
            : "You won't be able to revert this!";

        Swal.fire({
            title: "Are you sure?",
            text: warningText,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Delete"
        }).then((result) => {
            if (result.isConfirmed) {
                axiosPrivate.delete(`/services/delete?id=${id}`).then((res) => {
                    if (res.data.acknowledged) {
                        toast.success(`Deleted Successfully! ${res.data.deletedDescendants || 0} descendant(s) also removed.`);
                        setServices(prevOptions => prevOptions?.filter((service) => service?._id !== id));
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

    // page apear from top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center md:gap-4 pb-5">
                <h2 className="title !mx-0">All Services</h2>
                <Link to={"/dashboard/addSubCategory"} className="button flex items-center gap-1 md:text-xl bg-gradient"><FaPlus />Add New Sub-Category</Link>
            </div>

            {/* select category form */}
            <div className="md:max-w-4xl md:mx-auto flex flex-col md:flex-row items-center gap-0 md:gap-4">
                <h2 className="title !text-xl !w-60 !mb-0">Select Category</h2>
                <select onChange={(e) => setSelectedCategory(e.target.value)} className="input cursor-pointer" defaultValue={""}>
                    <option value="" disabled>Choose One</option>
                    {
                        categories?.map((category) =>
                            <option key={category?._id} value={category?._id}>{category?.title}</option>
                        )
                    }
                </select>
            </div>

            {/* services */}
            {
                !selectedCategory ?
                    <div className="font-bold text-center py-10">Please select a category</div>
                    : loading ?
                        <div className="font-bold text-center py-10">Loading...</div>
                        :
                        services?.length === 0 ?
                            <div className="font-bold text-center text-red-600 py-10">No Data Found!</div>
                            :
                            <div className="grid grid-cols-2 md:grid-cols-5 items-center gap-8 py-10">
                                {
                                    services?.map((service, idx) =>
                                        <div key={idx} className="border border-slate-400 rounded-md shadow-xl relative">
                                            {/* Nested child count badge */}
                                            {service?.childCount > 0 && (
                                                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-10">
                                                    {service.childCount}
                                                </div>
                                            )}
                                            <div className="w-full h-fit">
                                                <img src={service?.image} className="w-full h-28 md:h-36 object-fill" alt="service image" />
                                            </div>
                                            <h3 className="font-bold px-4 pt-4">{service?.title}</h3>
                                            {/* Parent badge */}
                                            {service?.parentServiceId && (
                                                <p className="text-xs text-gray-400 px-4">(nested sub-service)</p>
                                            )}
                                            <div className="p-3 text-2xl flex items-center gap-3 flex-wrap">
                                                <Link to={`/dashboard/updateSubCategory/${service?._id}`} className="text-blue-700"><FaRegEdit /></Link>
                                                <button onClick={() => handleDeleteService(service?._id, service?.childCount || 0)} className="text-red-600 text-3xl"><AiFillDelete /></button>
                                                <span className="text-sm">#{service?.serial}</span>
                                                {service?.childCount > 0 && (
                                                    <Link
                                                        to={`/dashboard/nested-services/${service?._id}`}
                                                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                                                    >
                                                        <TbArrowsSplit2 className="inline mr-1" />
                                                        Manage Children
                                                    </Link>
                                                )}
                                                {service?.serviceType === "itemListing" && (
                                                    <Link
                                                        to={`/dashboard/services/${service?._id}/items`}
                                                        className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200"
                                                    >
                                                        <TbListDetails className="inline mr-1" />
                                                        Manage Items
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
            }

        </div>
    );
};

export default Services;