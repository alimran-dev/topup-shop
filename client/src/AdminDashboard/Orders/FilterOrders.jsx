import { useState } from "react";
import { allCategories } from "../../utils/categories";

const FilterOrders = ({ setSearchEmail, setFormData }) => {
    const categories = allCategories();
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="my-5">
            {/* user email search */}
            <div className="max-w-3xl mx-auto border border-slate-200 p-5 mt-3 mb-6 shadow-md rounded-md">
                <label className="input-label">User{"'"}s Email</label>
                <input
                    onChange={(e) => setSearchEmail(e.target.value)}
                    type="email"
                    className="input"
                    placeholder="User's Email"
                />
            </div>

            {/* filter form */}
            <form className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-5">
                <div>
                    <label className="input-label">From</label>
                    <input
                        type="date"
                        name="fromDate"
                        className="input"
                        onChange={(e) => {
                            setFromDate(e.target.value);
                            handleInputChange(e);
                        }}
                    />
                </div>
                <div>
                    <label className="input-label">To</label>
                    <input
                        type="date"
                        name="toDate"
                        className="input"
                        min={fromDate}
                        disabled={!fromDate}
                        onChange={(e) => {
                            setToDate(e.target.value);
                            handleInputChange(e);
                        }}
                    />
                </div>
                <div>
                    <label className="input-label">Category</label>
                    <select
                        className="input"
                        name="category"
                        defaultValue={""}
                        onChange={handleInputChange}
                    >
                        <option value="" disabled>Choose One</option>
                        {categories?.map((category, idx) => (
                            <option key={idx} value={category?.title}>{category?.title}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="input-label">Sub-Category</label>
                    <select
                        className="input"
                        name="subCategory"
                        defaultValue={""}
                        onChange={handleInputChange}
                    >
                        <option value="" disabled>Choose One</option>
                        {categories?.map((category, idx) => (
                            <option key={idx} value={category?.title}>{category?.title}</option>
                        ))}
                    </select>
                </div>
                <div className="flex justify-center items-end">
                    <button type="submit" className="w-full !py-3 h-fit button">Search</button>
                </div>
            </form>
        </div>
    );
};

export default FilterOrders;
