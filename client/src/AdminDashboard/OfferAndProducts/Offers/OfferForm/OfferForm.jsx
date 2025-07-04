import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { uploadImage } from "../../../../utils/uploadImage";
import toast, { Toaster } from "react-hot-toast";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

const OfferForm = () => {
    const { id } = useParams(); // ID for editing
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        stock: "",
        price: "",
        type: "",
        shortDescription: "",
        image: "",
        tutorialTitle: "",
        tutorialUrl: "",
        inputs: "",
    });

    // Fetch existing offer data if editing
    useEffect(() => {
        if (id) {
            axiosPrivate.get(`/special/get?id=${id}`)
                .then(({ data }) => {
                    // console.log(data);
                    setFormData({
                        ...data,
                        inputs: data.inputs.join(", "),
                        ...(id ? { isActive: data.isActive } : {}),
                        ...(id ? { sequence: data.sequence } : {}),
                    });
                    if (data.image) {
                        setPreview(data.image); // Show existing image
                    }
                })
                .catch((err) => console.error("Error fetching offer:", err));
        }
    }, [id, axiosPrivate]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: name === "isActive" ? value === "true" : value, // Convert to boolean
        });
    };


    // Handle image selection
    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file)); // Show new preview
        }
    };

    // Handle form submission (Add / Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = formData.image; // Keep existing image

            // Upload new image if selected
            if (image) {
                imageUrl = await uploadImage(image);
            }

            const payload = {
                ...formData,
                image: imageUrl,
                price: Number(formData.price),
                stock: Number(formData.stock),
                inputs: formData.inputs.split(",").map((input) => input.trim()),
                ...(id && { isActive: formData.isActive }),
                ...(id && { sequence: formData.sequence }),
            };

            // console.log(payload, "-----------payload");

            if (id) {
                // Update existing offer
                const res = await axiosPrivate.patch(`/special/update?id=${id}`, payload);
                // console.log(res.data);

                if (res.data.acknowledged) {
                    toast.success("Offer Updated Successfully!");
                }
                else {
                    toast.error("Something Went Wrong!");
                }
            } else {
                // Add new offer
                const res = await axiosPrivate.post("/special/new", payload);
                // console.log(res.data);
                if (res.data.acknowledged) {
                    toast.success("Offer Added Successfully!");
                }
                else {
                    toast.error("Something Went Wrong!");
                }
            }

            navigate("/dashboard/offersAndProducts");
        } catch (error) {
            console.error("Error submitting offer:", error);
            toast.error("Error submitting offer");
        } finally {
            setLoading(false);
        }
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
                                <option value="balance">Balance</option>
                                <option value="coin">Coin</option>
                            </select>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="input-label">Upload Image</label>
                        <input type="file" accept="image/*" onChange={handleImage} className="input cursor-pointer" />
                        {preview && <img src={preview} alt="Preview" className="mt-3 max-h-48 object-cover" />}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-5">
                        <div>
                            <label className="input-label">Tutorial Title</label>
                            <input type="text" name="tutorialTitle" className="input" value={formData.tutorialTitle} onChange={handleChange} placeholder="Tutorial Title" />
                        </div>

                        <div>
                            <label className="input-label">Tutorial URL</label>
                            <input type="text" name="tutorialUrl" className="input" value={formData.tutorialUrl} onChange={handleChange} placeholder="Tutorial URL" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="input-label">Inputs (comma-separated)</label>
                            <input type="text" name="inputs" className="input" value={formData.inputs} onChange={handleChange} placeholder="Enter inputs, separated by commas" />
                        </div>
                    </div>

                    {
                        id &&
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-5">
                            <div>
                                <label className="input-label">Type</label>
                                <select name="isActive" className="input" onChange={handleChange} value={formData.isActive}>
                                    <option value={""} disabled>Choose One</option>
                                    <option value={true}>Active</option>
                                    <option value={false}>Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="input-label">Sequence</label>
                                <input type="number" name="sequence" className="input" value={formData?.sequence} onChange={handleChange} placeholder="Enter sequence" />
                            </div>
                        </div>
                    }

                    {/* Textarea / Description */}
                    <div>
                        <label className="input-label">Short Description</label>
                        <textarea name="shortDescription" className="input h-20" value={formData.shortDescription} onChange={handleChange} placeholder="Short Description" required></textarea>
                    </div>

                    <button className="button mt-6 mx-auto flex" disabled={loading}>
                        {loading ? "Please Wait..." : id ? "Update Offer" : "Submit"}
                    </button>
                </form>
            </div>
            <Toaster />
        </div>
    );
};

export default OfferForm;
