import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { allCategories } from "../../utils/categories";
import toast from "react-hot-toast";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import { FiEdit } from "react-icons/fi";
import Swal from "sweetalert2";
import UpdateOption from "./UpdateOption/UpdateOption";


const Options = () => {

    const [subCategories, setSubCategories] = useState([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();
    const categories = allCategories();

    // get subcategories
    useEffect(() => {
        axiosPrivate.get("/services").then((res) => {
            const data = res?.data || [];
            setSubCategories(data.map(item => ({
                id: item._id,
                title: item.title,
                category: item.category
            })));
        }).catch(err => {
            console.log(err);
            toast.error("Failed to load sub-categories")
        });
    }, [axiosPrivate]);

    // filter subCategory with selected category
    const handleSelectCategory = (e) => {
        const selectedCategory = e.target.value;
        const matchedSubCategories = subCategories.filter(sub => sub.category === selectedCategory);
        setFilteredSubCategories(matchedSubCategories);
        setSelectedSubCategoryId("");
        setOptions([]);
    };

    // load options using subcategory
    useEffect(() => {
        if (selectedSubCategoryId) {
            setLoading(true);
            axiosPrivate.get(`/services/get?id=${selectedSubCategoryId}`).then((res) => {
                // console.log(res.data.options);
                setOptions(res.data.options);
                setLoading(false);
            });
        }
    }, [axiosPrivate, selectedSubCategoryId]);

    // delete option fn
    const handleDeleteOption = async (idx, option) => {
        Swal.fire({
            title: "Are you sure?",
            text: `Delete '${option?.name}' option?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Delete"
        }).then((result) => {
            if (result.isConfirmed) {
                axiosPrivate.delete(`/option/admin/dynamic/delete?id=${selectedSubCategoryId}&index=${idx}&name=${option?.name}&price=${option?.price}`).then((res) => {
                    if (res.data.acknowledged) {
                        toast.success('Deleted Successfully!');
                        setOptions(prevOptions => prevOptions.filter((_, index) => index !== idx));
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
            <div className="flex flex-col md:flex-row justify-between items-center md:gap-4 pb-5">
                <h2 className="title !mx-0">All Options</h2>
                <div className="flex items-center gap-3">
                    <Link to={"/dashboard/addOption"} className="button flex items-center gap-1 md:text-xl bg-gradient"><FaPlus />Add Option</Link>
                    <Link to={"/dashboard/updateOptions"} className="button flex items-center gap-1 md:text-xl bg-gradient"><FiEdit />Update Option</Link>
                </div>
            </div>

            {/* filter form */}
            <form className="max-w-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label
                        htmlFor="uc"
                        className="block text-xl font-medium text-gray-700"
                    >
                        Select Category
                    </label>
                    <select
                        name="category"
                        className="py-1.5 px-3 w-full border-2 border-gray-600 rounded-md block font-medium cursor-pointer"
                        defaultValue={""}
                        required
                        onChange={(e) => handleSelectCategory(e)}
                    >
                        <option
                            value=""
                            className="bg-white hover:bg-red-500 focus:bg-red-500"
                        >
                            Choose One
                        </option>
                        {
                            categories?.map(category =>
                                <option
                                    key={category?.id}
                                    value={category?.title}
                                    className="bg-white hover:bg-red-500 focus:bg-red-500"
                                >
                                    {category?.title}
                                </option>
                            )
                        }
                    </select>
                </div>
                <div className="space-y-2">
                    <label
                        htmlFor="category"
                        className="block text-xl font-medium text-gray-700"
                    >
                        Choose Sub-Category
                    </label>
                    <select
                        name="subCategory"
                        className="py-1.5 px-3 w-full border-2 border-gray-600 rounded-md block font-medium cursor-pointer"
                        required
                        defaultValue={""}
                        onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                    >
                        <option
                            value=""
                            className="bg-white hover:bg-red-500 focus:bg-red-500"
                        >
                            Choose One
                        </option>
                        {
                            filteredSubCategories?.map(subCategory => (
                                <option
                                    key={subCategory?.id}
                                    value={subCategory?.id}
                                    className="bg-white hover:bg-red-500 focus:bg-red-500"
                                >
                                    {subCategory?.title}
                                </option>
                            ))
                        }
                    </select>
                </div>
            </form>

            {/* options */}
            {
                !selectedSubCategoryId ?
                    <div className="py-10 text-center font-bold">Please select category and sub-category</div>
                    :
                    <>
                        {
                            loading ?
                                <div className="text-center py-10 font-bold">Please Wait...</div>
                                :
                                <>
                                    {
                                        options?.length == 0 ?
                                            <div className="py-10 text-center font-bold text-red-600">No Options Found!</div>
                                            :
                                            <div>
                                                {/* table for desktop */}
                                                <div className="hidden md:block">
                                                    <table className="w-full border-collapse my-10 text-center">
                                                        <thead>
                                                            <tr>
                                                                <th className="px-3 py-1 border border-slate-400"></th>
                                                                <th className="px-3 py-1 border border-slate-400">Name</th>
                                                                <th className="px-3 py-1 border border-slate-400">Price</th>
                                                                <th className="px-3 py-1 border border-slate-400">Stock</th>
                                                                <th className="px-3 py-1 border border-slate-400">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {
                                                                options?.map((option, idx) =>
                                                                    <tr key={idx}>
                                                                        <td className="px-3 py-1 border border-slate-400">{idx + 1}</td>
                                                                        <td className="px-3 py-1 border border-slate-400">{option?.name}</td>
                                                                        <td className="px-3 py-1 border border-slate-400">৳{option?.price}</td>
                                                                        <td className="px-3 py-1 border border-slate-400">{option?.stock}</td>
                                                                        <td className="px-3 py-1 border border-slate-400 flex justify-center items-center gap-4">
                                                                            <button onClick={() => document.getElementById(`update_option_desktop_${idx}`).showModal()} className="text-3xl text-blue-700"><AiFillEdit /></button>
                                                                            <UpdateOption idx={idx} option={option} selectedSubCategoryId={selectedSubCategoryId} setOptions={setOptions} screen={'desktop'} />
                                                                            <button onClick={() => handleDeleteOption(idx, option)} className="text-3xl text-red-600"><AiFillDelete /></button>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            }
                                                        </tbody>
                                                    </table>
                                                </div>
                                                {/* card for mobile */}
                                                <div className="md:hidden my-4 space-y-3">
                                                    {
                                                        options?.map((option, idx) =>
                                                            <div key={idx} className="p-3 border border-slate-200 shadow-md flex justify-between">
                                                                <div>
                                                                    <h3 className="font-bold">
                                                                        <span className="font-semibold">Name: </span>
                                                                        {option?.name}
                                                                    </h3>
                                                                    <p>
                                                                        <span className="font-semibold">Price: </span>
                                                                        ৳{option?.price}
                                                                    </p>
                                                                    <p>
                                                                        <span className="font-semibold">Stock: </span>
                                                                        {option?.stock}

                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <button onClick={() => document.getElementById(`update_option_mobile_${idx}`).showModal()} className="text-3xl text-blue-700 mb-3"><AiFillEdit /></button>
                                                                    <UpdateOption idx={idx} option={option} selectedSubCategoryId={selectedSubCategoryId} setOptions={setOptions} screen={'mobile'} />
                                                                    <button onClick={() => handleDeleteOption(idx, option)} className="text-3xl text-red-600"><AiFillDelete /></button>
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                    }
                                </>
                        }
                    </>
            }

        </div>
    );
};

export default Options;