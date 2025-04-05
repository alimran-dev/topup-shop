import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import toast from "react-hot-toast";
import { allCategories } from "../../utils/categories";


const FilterOrders = ({ searchEmail, setSearchEmail, setFormData, formData, getOrders, setOrders }) => {

    const categories = allCategories();
    const [selectedCategory, setSelectedCategory] = useState("");
    const [subCategories, setSubCategories] = useState([]);
    const [fromDate, setFromDate] = useState(formData.fromDate || "");
    const [toDate, setToDate] = useState(formData.toDate || "");
    const axiosPrivate = useAxiosPrivate();


    // get subcategories
    useEffect(() => {
        if (selectedCategory) {
            axiosPrivate.get("/services").then((res) => {
                const data = res?.data || [];
                // console.log("log", res.data);
                const filterSubCategories = data?.filter(item => item?.category == selectedCategory)
                setSubCategories(filterSubCategories.map(item => ({
                    id: item._id,
                    title: item.title,
                    category: item.category
                })));
            }).catch(err => {
                console.log(err);
                toast.error("Failed to load sub-categories");
            });
        }
    }, [axiosPrivate, selectedCategory]);


    const handleEmail = (email) => {
        setFormData({
            fromDate: "",
            toDate: "",
            category: "",
            subCategory: "",
        });
        setSearchEmail(email);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Directly access the form values on submit
        const form = e.target;
        const formData = {
            fromDate: form.fromDate.value,
            toDate: form.toDate.value,
            category: form.category.value,
            subCategory: form.subCategory.value,
        };

        // if(!formData?.fromDate || !formData?.toDate || !formData?.category || !formData?.subCategory){
        //     toast.error("Fill All Input");
        //     return;
        // }

        setFormData(formData);  // Update the formData state with the new values
        setOrders([]);           // Reset the orders before getting new data
        getOrders();             // Call the getOrders function
    };

    const handleFromDateChange = (e) => {
        const value = e.target.value;
        setFromDate(value);

        // If a fromDate is selected, enable the toDate input
        if (value && !toDate) {
            setToDate(value); // Set toDate to fromDate when it's initially selected
        }
    };

    const handleToDateChange = (e) => {
        setToDate(e.target.value);
    };

    return (
        <div className="my-5">
            {/* Email input */}
            <div className="max-w-3xl mx-auto border border-slate-200 p-5 mt-3 mb-6 shadow-md rounded-md">
                <label className="input-label">User{"'"}s Email</label>
                <input
                    type="email"
                    className="input"
                    placeholder="User's Email"
                    value={searchEmail}
                    onChange={(e) => handleEmail(e.target.value)}
                />
            </div>

            {/* Filter Form */}
            <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-5">
                <div>
                    <label className="input-label">From</label>
                    <input
                        type="date"
                        name="fromDate"
                        className="input"
                        value={fromDate}
                        onChange={handleFromDateChange}
                        placeholder="from date. (yyyy/mm/dd)"
                    />
                </div>
                <div>
                    <label className="input-label">To</label>
                    <input
                        type="date"
                        name="toDate"
                        className="input"
                        value={toDate}
                        min={fromDate} // Ensure toDate can't be earlier than fromDate
                        disabled={!fromDate} // Disable toDate if fromDate is not set
                        onChange={handleToDateChange}
                        placeholder="to date. (yyyy/mm/dd)"
                    />
                </div>
                <div>
                    <label className="input-label">Category</label>
                    <select
                        className="input"
                        name="category"
                        defaultValue={""}
                        onChange={(e) => 
                        {setSelectedCategory(e.target.value), setSubCategories([])}
                        }
                    >
                        <option value="" disabled>
                            Choose One
                        </option>
                        {categories?.map((category, idx) => (
                            <option key={idx}>
                                {category?.title}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="input-label">Sub-Category</label>
                    <select
                        className="input"
                        name="subCategory"
                        defaultValue={""}
                    // value={formData.subCategory}
                    // onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    >
                        <option value="" disabled>
                            Choose One
                        </option>
                        {subCategories?.map((category, idx) => (
                            <option key={idx}>
                                {category?.title}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex justify-center items-end">
                    <button type="submit" className="w-full !py-3 h-fit button">
                        Search
                    </button>
                </div>
            </form>
        </div>
    );
};

FilterOrders.propTypes = {
    searchEmail: PropTypes.string.isRequired,
    setSearchEmail: PropTypes.func.isRequired,
    setFormData: PropTypes.func.isRequired,
    setOrders: PropTypes.func.isRequired,
    getOrders: PropTypes.func.isRequired,
    formData: PropTypes.shape({
        fromDate: PropTypes.string,
        toDate: PropTypes.string,
        category: PropTypes.string,
        subCategory: PropTypes.string,
    }).isRequired,
};

export default FilterOrders;
