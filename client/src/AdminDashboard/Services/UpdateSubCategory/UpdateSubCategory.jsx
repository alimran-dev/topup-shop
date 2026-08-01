import toast from "react-hot-toast";
import { uploadImage } from "../../../utils/uploadImage";
import { useNavigate, useParams } from "react-router-dom";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill";


const UpdateSubCategory = () => {
    const { id } = useParams();
    const [categoryId, setCategoryId] = useState("");
    const [parentServiceId, setParentServiceId] = useState("");
    const [childCount, setChildCount] = useState(0);
    const [categories, setCategories] = useState([]);
    const [allServices, setAllServices] = useState([]);
    const [selectableParents, setSelectableParents] = useState([]);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [inputs, setInputs] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [value, setValue] = useState('');
    const [subCategoryName, setSubCategoryName] = useState('');
    const [tutorialText, setTutorialText] = useState('');
    const [tutorialUrl, setTutorialUrl] = useState('');
    const [serial, setSerial] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [notice, setNotice] = useState('');
    const [description, setDescription] = useState('');
    const [redirectUrl, setRedirectUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();

    // Load categories for the dropdown
    useEffect(() => {
        axiosPublic
            .get("/category")
            .then((res) => setCategories(res.data))
            .catch((err) => console.error("Failed to load categories:", err));
    }, [axiosPublic]);

    // load data
    useEffect(() => {
        axiosPrivate.get(`/services/get?id=${id}`).then((res) => {
            setCategoryId(res?.data?.categoryId || '');
            setParentServiceId(res?.data?.parentServiceId || '');
            setChildCount(res?.data?.childCount || 0);
            setSubCategoryName(res?.data?.title || '');
            setTutorialText(res?.data?.tutorialText || '');
            setTutorialUrl(res?.data?.tutorialURL || '');
            setImage(res?.data?.image || null);
            setPreview(res?.data?.image || null);
            setInputs(res?.data?.inputs || []);
            setValue(res?.data?.rules || '');
            setSerial(res?.data?.serial || 0);
            setIsActive(res?.data?.isActive !== false);
            setNotice(res?.data?.notice || '');
            setDescription(res?.data?.description || '');
            setRedirectUrl(res?.data?.redirectUrl || '');
        })
    }, [axiosPrivate, id]);

    // Load all services for parent selection
    useEffect(() => {
        axiosPrivate
            .get("/services")
            .then((res) => setAllServices(res.data))
            .catch((err) => console.error("Failed to load services:", err));
    }, [axiosPrivate]);

    // Filter parent options by selected category, exclude self and descendants (to prevent circular refs)
    useEffect(() => {
        if (categoryId) {
            // Collect all descendant IDs to exclude from parent options
            const collectDescendants = (services, parentId) => {
                const ids = [];
                const children = services.filter(
                    (s) => s.parentServiceId === parentId
                );
                children.forEach((child) => {
                    ids.push(child._id);
                    ids.push(...collectDescendants(services, child._id));
                });
                return ids;
            };
            const descendantIds = collectDescendants(allServices, id);

            const filtered = allServices.filter(
                (s) =>
                    s.categoryId === categoryId &&
                    s._id !== id &&
                    !descendantIds.includes(s._id)
            );
            setSelectableParents(filtered);

            // If current parentServiceId is not in the new filtered list, reset it
            if (
                parentServiceId &&
                !filtered.some((s) => s._id === parentServiceId)
            ) {
                setParentServiceId("");
            }
        } else {
            setSelectableParents([]);
            setParentServiceId("");
        }
    }, [categoryId, allServices, id, parentServiceId]);

    // Handle adding a new input label
    const handleAdd = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setInputs([...inputs, inputValue.trim()]);
            setInputValue(""); // Clear input field
        }
    };

    // Handle removing an input label by index
    const handleRemove = (index) => {
        setInputs(inputs.filter((_, idx) => idx !== index));
    };


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file)); // Generate preview URL
        }
    };

    // update subcategory fn
    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (inputs.length === 0 || !subCategoryName.trim()) {
            toast.error("Please fill all required fields");
            setLoading(false);
            return;
        }

        try {
            let uploadedImage = image;
            if (image) {
                uploadedImage = await uploadImage(image);
            }

            const updatedSubCategory = {
                id,
                title: subCategoryName,
                categoryId,
                parentServiceId: parentServiceId || null,
                tutorialText,
                tutorialURL: tutorialUrl,
                inputs,
                serial,
                isActive,
                image: uploadedImage,
                rules: value,
                notice: notice || null,
                description: description || null,
                redirectUrl: redirectUrl || null,
            };

            // console.log(updatedSubCategory);

            const { data } = await axiosPrivate.patch('/services/update', updatedSubCategory);

            if (data.acknowledged) {
                toast.success("Updated successfully!");
                setLoading(false);
                navigate('/dashboard/services');
            } else {
                toast.error("Update failed!");
                setLoading(false);
            }
        } catch (error) {
            const errMsg =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Error updating service!";
            toast.error(errMsg);
            setLoading(false);
        }
    };


    return (
        <div>
            <h2 className="title !text-xl md:!text-5xl">Update Sub-Category</h2>

            {/* subcategory update form */}
            <form onSubmit={handleUpdate} className="max-w-3xl mx-auto space-y-3 md:space-y-5">

                {/* title */}
                <div>
                    <label htmlFor="" className="input-label">Sub-Category Name</label>
                    <input type="text" onChange={(e) => setSubCategoryName(e.target.value)} className="input" value={subCategoryName} placeholder="Type sub-Category name" required />
                </div>

                {/* category select */}
                <div>
                    <label htmlFor="" className="input-label">Category</label>
                    <select
                        className="input"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                    >
                        <option value="" disabled>Choose one</option>
                        {categories?.map((cat) => (
                            <option key={cat?._id} value={cat?._id}>
                                {cat?.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Parent Service */}
                <div>
                    <label htmlFor="" className="input-label">
                        Parent Service <span className="text-gray-400 text-sm">(optional — for nested sub-services)</span>
                    </label>
                    <select
                        className="input"
                        value={parentServiceId}
                        onChange={(e) => setParentServiceId(e.target.value)}
                    >
                        <option value="">None (top-level service)</option>
                        {selectableParents?.map((service) => (
                            <option key={service?._id} value={service?._id}>
                                {service?.title}
                            </option>
                        ))}
                    </select>
                    {childCount > 0 && parentServiceId && (
                        <p className="text-xs text-amber-600 mt-1">
                            ⚠ This service has {childCount} nested sub-service(s). Changing its parent may affect navigation.
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* tutorial text */}
                    <div>
                        <label htmlFor="" className="input-label">Tutorial Text</label>
                        <input type="text" onChange={(e) => setTutorialText(e.target.value)} className="input" value={tutorialText} placeholder="Type tutorial text" />
                    </div>
                    {/* tutorial url */}
                    <div>
                        <label htmlFor="" className="input-label">Tutorial URL</label>
                        <input type="text" onChange={(e) => setTutorialUrl(e.target.value)} className="input" value={tutorialUrl} placeholder="Type tutorial URL" required />
                    </div>
                </div>
                {/* serial */}
                <div>
                    <label htmlFor="serial">Serial</label>
                    <input type="number" onChange={(e)=>setSerial(parseInt(e.target.value))} className="input" value={serial} />
                </div>

                {/* active toggle */}
                <div className="flex items-center gap-2.5">
                    <label className="input-label !m-0">Active: </label>
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="toggle"
                    />
                </div>

                {/* inputs */}
                <div>
                    <label htmlFor="newInput" className="input-label">Input</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            className="input"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type input field's label"
                        />
                        <button onClick={handleAdd} className="bg-primary px-4 py-2 rounded-md text-white font-bold">Add</button>
                    </div>
                    {/* added input list */}
                    <div className="pt-3">
                        <ul>
                            {inputs.map((label, index) => (
                                <li key={index} className="flex justify-between items-center">
                                    {index + 1 + ". " + label}
                                    <button
                                        type="button"
                                        className="text-red-500 ml-2"
                                        onClick={() => handleRemove(index)}
                                    >
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* image */}
                <div>
                    <label htmlFor="" className="input-label">Upload Image</label>
                    <input
                        type="file"
                        name="image"
                        className="input"
                        onChange={handleImageChange}
                    />
                    {image && <img src={preview} alt="Preview" className="mt-3 max-h-48 object-cover" />}
                </div>

                {/* text editor */}
                <div className="rich-text-content">
                    <label htmlFor="" className="input-label">Rules & Conditions</label>
                    <ReactQuill theme="snow" value={value} onChange={setValue} />
                </div>

                {/* Notice */}
                <div>
                    <label htmlFor="" className="input-label">
                        Notice <span className="text-gray-400 text-sm">(optional — shown on nested services page)</span>
                    </label>
                    <textarea
                        name="notice"
                        className="input w-full h-24 resize-y"
                        placeholder="Enter notice text for the children listing page..."
                        value={notice}
                        onChange={(e) => setNotice(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        This notice banner will appear when users view this service's child services. Leave empty for no notice.
                    </p>
                </div>

                {/* Description */}
                <div className="rich-text-content">
                    <label htmlFor="" className="input-label">
                        Description <span className="text-gray-400 text-sm">(optional — rich text, shown at bottom of nested services page)</span>
                    </label>
                    <ReactQuill theme="snow" value={description} onChange={setDescription} />
                    <p className="text-xs text-gray-500 mt-1">
                        Displayed below the service grid on the nested services page. Leave empty for no description.
                    </p>
                </div>

                {/* Redirect URL */}
                <div>
                    <label htmlFor="" className="input-label">
                        Custom Redirect URL <span className="text-gray-400 text-sm">(optional)</span>
                    </label>
                    <input
                        type="text"
                        name="redirectUrl"
                        className="input"
                        placeholder="e.g., https://example.com or /store"
                        value={redirectUrl}
                        onChange={(e) => setRedirectUrl(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        If set, clicking this service card redirects here instead of opening the service page. Use absolute URLs for external links or relative paths for internal pages.
                    </p>
                </div>

                {/* submit btn */}
                <button type="submit" className="block mx-auto button bg-gradient" disabled={loading}>
                    {loading ? 'Please Wait...' : 'Update'}
                </button>
            </form>

        </div>
    );
};

export default UpdateSubCategory;