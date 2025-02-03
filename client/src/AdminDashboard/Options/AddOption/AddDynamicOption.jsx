import { useEffect, useState } from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import toast from "react-hot-toast";
import { allCategories } from "../../../utils/categories";
import { useNavigate } from "react-router-dom";


const AddDynamicOption = () => {
    const [subCategories, setSubCategories] = useState([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();
    const categories = allCategories();
    const navigate = useNavigate(null);

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
            toast.error("Failed to load categories")
        });
    }, [axiosPrivate]);

    // filter subCategory with selected category
    const handleSelectCategory = (e) => {
        const selectedCategory = e.target.value;
        const matchedSubCategories = subCategories.filter(sub => sub.category === selectedCategory);
        setFilteredSubCategories(matchedSubCategories);
    };

    // add new option fn
    const handleAdd = (e) => {
        e.preventDefault();
        setLoading(true);

        const form = e.target;
        const name = form.name.value;
        const price = parseInt(form.price.value) || 0;
        const id = form.subCategory.value;
        const newOption = { name, price, id };

        // console.log(newOption);

        axiosPrivate.post('/option/admin/dynamic/add', newOption).then((res) => {
            if (res.data.acknowledged) {
                toast.success("Option Added Successfully!");
                setLoading(false);
                form.reset();
                navigate('/dashboard/options')
            } else {
                toast.error("Something Went Wrong!");
                setLoading(false);
            }
        });
    };


    return (
        <div>
            <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5 py-3">
                Add Dynamic Option
            </h1>
            <form onSubmit={handleAdd} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5 md:w-2/3 mx-auto items-center justify-center">
                    <div className="space-y-2">
                        <label
                            htmlFor="name"
                            className="block text-xl font-medium text-gray-700"
                        >
                            Option Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
                            placeholder="Example: 20 UC"
                        />
                    </div>
                    <div className="space-y-2">
                        <label
                            htmlFor="price"
                            className="block text-xl font-medium text-gray-700"
                        >
                            Option Price
                        </label>
                        <input
                            type="number"
                            name="price"
                            required
                            className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
                            placeholder="Example: 50"
                        />
                    </div>
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
                                disabled
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
                        >
                            <option
                                value=""
                                className="bg-white hover:bg-red-500 focus:bg-red-500"
                                disabled
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
                </div>
                <div>
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 text-lg text-white font-semibold rounded block mx-auto"
                        disabled={loading}
                    >
                        {loading ? 'Please wait' : 'Add'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddDynamicOption;