import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import toast from "react-hot-toast";
import { allCategories } from "../../utils/categories";
import { useNavigate } from "react-router-dom";


const FilterOrders = ({ searchEmail, setSearchEmail, setFormData, formData, setOrders }) => {

    const categories = allCategories();
    const [selectedCategory, setSelectedCategory] = useState("");
    const [subCategories, setSubCategories] = useState([]);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState("");
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();


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

        setFromDate("");
        setToDate("");
        setSelectedCategory("");
        setSelectedSubCategory("");

        setFormData({
            fromDate: "",
            toDate: "",
            category: "",
            subCategory: "",
        });
        setSearchEmail(email);
    };

    const handleFromDateChange = (e) => {
        const value = e.target.value;
        setFromDate(value);

        if (value && !toDate) {
            setToDate(value);
        }
    };

    const handleToDateChange = (e) => {
        setToDate(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Directly access the form values on submit
        const formData = {
            fromDate: fromDate,
            toDate: toDate,
            category: selectedCategory,
            subCategory: selectedSubCategory,
        };

        if (!fromDate || !toDate || !selectedCategory || !selectedSubCategory) {
            toast.error("Fill All Input");
            return;
        }

        setFormData(formData);
        setOrders([]);
    };


    const handleViewSummary = () => {

        // if (!searchEmail || !fromDate || !toDate || !selectedCategory || !selectedSubCategory) {
        //     toast.error("Please fill all inputs!");
        //     return;
        // }
        const filterData = { fromDate, toDate, selectedCategory, selectedSubCategory, searchEmail };
        navigate("/dashboard/orders/viewSummary", { state: { filterData } })
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
                        min={fromDate}
                        disabled={!fromDate}
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
                        value={selectedCategory}
                        onChange={(e) => { setSelectedCategory(e.target.value), setSubCategories([]), setSelectedSubCategory("") }
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
                        value={selectedSubCategory}
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
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
                <div className="col-span-2 md:col-span-1 flex justify-center items-end gap-2 mt-3 md:mt-0 mb-1">
                    <button type="submit" className="w-full py-2 text-white font-semibold rounded-md bg-primary">
                        Search
                    </button>
                    <button type="button" onClick={handleViewSummary} className="w-full py-2 text-white font-semibold rounded-md bg-primary">
                        View Summary
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
    formData: PropTypes.shape({
        fromDate: PropTypes.string,
        toDate: PropTypes.string,
        category: PropTypes.string,
        subCategory: PropTypes.string,
    }).isRequired,
};

export default FilterOrders;
