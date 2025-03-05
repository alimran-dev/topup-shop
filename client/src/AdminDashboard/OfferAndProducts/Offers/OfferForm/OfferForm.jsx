import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";


const OfferForm = () => {
    const { id } = useParams(); // optional ID
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        stock: "",
        price: "",
        type: "",
        shortDescription: ""
    });

    // Fetch existing offer data if editing
    useEffect(() => {
        if (id) {
            fetch(`/api/offers/${id}`)
                .then((res) => res.json())
                .then((data) => setFormData(data))
                .catch((err) => console.error("Error fetching offer:", err));
        }
    }, [id]);

    // Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        console.log(formData);


        // call api here
        navigate("/dashboard/offersAndProducts");
        setLoading(false);

    };

    return (
        <div>
            <h2 className="title">{id ? "Edit Offer" : "Add New Offer"}</h2>
            <div className="pt-5 max-w-3xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="input-label">Title</label>
                            <input type="text" name="title" className="input" value={formData.title} onChange={handleChange} placeholder="Title" required />
                        </div>
                        <div>
                            <label className="input-label">Stock</label>
                            <input type="number" name="stock" className="input" value={formData.stock} onChange={handleChange} placeholder="Stock" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-5">
                        <div>
                            <label className="input-label">Price</label>
                            <input type="number" name="price" className="input" value={formData.price} onChange={handleChange} placeholder="Price" required />
                        </div>
                        <div>
                            <label className="input-label">Type</label>
                            <select name="type" className="input" value={formData.type} onChange={handleChange} required>
                                <option value="" disabled>Choose One</option>
                                <option value="taka">Taka</option>
                                <option value="coin">Coin</option>
                            </select>
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

export default OfferForm;
