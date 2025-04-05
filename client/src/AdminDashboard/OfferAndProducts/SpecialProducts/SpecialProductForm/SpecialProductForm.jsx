import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import toast from "react-hot-toast";


const SpecialProductForm = () => {
    const { id } = useParams(); // optional ID
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const axiosPrivate = useAxiosPrivate();
    const [formData, setFormData] = useState({
        title: "",
        stock: "",
        price: "",
        inputs: [],
        shortDescription: ""
    });

    // Fetch existing offer data if editing
    useEffect(() => {
        if (id) {
            const fetchProduct = async () => {
                try {
                    const res = await axiosPrivate.get(`/coins/product?id=${id}`);
                    // console.log(res.data);
                    setFormData(res.data);
                } catch (error) {
                    console.error("Error fetching product:", error);
                    toast.error(error.response.data.message || "Failed to load product");
                }
            };
            fetchProduct();
        }
    }, [id, axiosPrivate]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'isActive') {
            setFormData({
                ...formData,
                [name]: value === 'true' ? true : false // Convert string to boolean
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };
    

    // Handle adding a new input label
    const handleAddInput = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setFormData((prev) => ({
                ...prev,
                inputs: [...prev.inputs, inputValue.trim()]
            }));
            setInputValue(""); // Clear input field
        }
    };

    // Handle removing an input label by index (updates formData.inputs)
    const handleRemoveInput = (index) => {
        setFormData((prev) => ({
            ...prev,
            inputs: prev.inputs.filter((_, idx) => idx !== index)
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // console.log(formData);

        if (id) {
            // update api
            try {
                const res = await axiosPrivate.patch(`/coins/product/update?id=${id}`, formData);
                if (res.data?.modifiedCount > 0 || res.data?.acknowledged) {
                    toast.success("Updated Successfully!");
                    navigate("/dashboard/offersAndProducts", { state: { page: "coinProducts" } });
                } else {
                    toast.error("Update failed!");
                }
            } catch (err) {
                // console.error(err);
                toast.error(err.response.data.message || "Failed to update product!");
            } finally {
                setLoading(false);
            }
        }

        else {
            // add api
            try {
                const res = await axiosPrivate.post("/coins/product/add", formData);
                // console.log(res.data);
                if (res.data?.insertedId) {
                    toast.success("Added Successfully!")
                    navigate("/dashboard/offersAndProducts", { state: { page: "coinProducts" } });
                }
                else {
                    toast.error("Something Went Wrong!")
                }
            }
            catch (err) {
                // console.log(err);
                toast.error(err.response.data.message || "Failed to add!")
            }
            finally {
                setLoading(false);
            }
        }
    };

    return (
        <div>
            <h2 className="title">{id ? "Edit Coin Product" : "Add Coin Product"}</h2>
            <div className="pt-5 max-w-3xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <div className={`grid grid-cols-1 ${id && "md:grid-cols-2"} gap-5`}>
                        <div>
                            <label className="input-label">Title</label>
                            <input type="text" name="title" className="input" value={formData.title} onChange={handleChange} placeholder="Title" required />
                        </div>
                        {id &&
                            <div>
                                <label className="input-label">Status</label>
                                <select name="isActive" className="input" value={formData.isActive} onChange={handleChange} >
                                    <option value={true}>Active</option>
                                    <option value={false}>Inactive</option>
                                </select>
                            </div>
                        }
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-5">
                        <div>
                            <label className="input-label">Price</label>
                            <input type="number" name="price" className="input" value={formData.price} onChange={handleChange} placeholder="Price" required />
                        </div>
                        <div>
                            <label className="input-label">Stock</label>
                            <input type="number" name="stock" className="input" value={formData.stock} onChange={handleChange} placeholder="Stock" required />
                        </div>
                    </div>

                    {/* Dynamic Inputs */}
                    <div>
                        <label htmlFor="newInput" className="input-label">Input Fields</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                className="input"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Type input field's label"
                            />
                            <button onClick={handleAddInput} className="bg-primary px-4 py-2 rounded-md text-white font-bold">
                                Add
                            </button>
                        </div>
                        {/* Display added input labels */}
                        <div className="pt-3 pb-4">
                            <ul>
                                {formData.inputs.map((label, index) => (
                                    <li key={index} className="flex justify-between items-center">
                                        {index + 1 + ". " + label}
                                        <button
                                            type="button"
                                            className="text-red-500 ml-2"
                                            onClick={() => handleRemoveInput(index)}
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>


                    {/* textarea / description */}
                    <div>
                        <label className="input-label">Short Description</label>
                        <textarea name="shortDescription" className="input h-20" value={formData.shortDescription} onChange={handleChange} placeholder="Short Description" required></textarea>
                    </div>
                    <button className="button mt-6 mx-auto flex" disabled={loading}>
                        {loading ? "Please Wait..." : id ? "Update Offer" : "Submit"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SpecialProductForm;
