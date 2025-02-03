import PropTypes from 'prop-types';
import { useState } from "react";
import { uploadImage } from "../../../utils/uploadImage";
import toast, { Toaster } from "react-hot-toast";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";


const AddNewBanner = ({ setBanners }) => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    // handle image change
    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file)); // Generate preview URL
        }
    };

    // add new banner fn
    const handleAddBanner = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const uploadedImage = await uploadImage(image);

            const bannerData = {
                image: uploadedImage,
                url
            };

            axiosPrivate.post('/banners/new', bannerData).then((res) => {
                console.log(res.data.insertedId);

                if (res.data.insertedId) {
                    setLoading(false);
                    setImage(null);
                    setUrl('');
                    toast.success("Banner Uploaded Successfully!");

                    // update state
                    setBanners(prevBanners => [...prevBanners, { _id: res.data.insertedId, image: uploadedImage, url }]);
                } else {
                    toast.error("Something Went Wrong!");
                    setLoading(false);
                }
            });
        } catch (error) {
            setLoading(false);
            toast.error("Error uploading image");
        }
    };

    return (
        <div>
            <h1 className="title">Add New Banner</h1>
            <form onSubmit={handleAddBanner} className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="input-label">Banner Image</label>
                        <input type="file" onChange={handleImage} className="input cursor-pointer" required />
                        {image && <img src={preview} alt="Preview" className="mt-3 max-h-48 object-cover" />}
                    </div>
                    <div>
                        <label className="input-label">Banner URL</label>
                        <input
                            type="text"
                            onChange={(e) => setUrl(e.target.value)}
                            value={url}
                            className="input"
                            placeholder="Banner URL"
                            required
                        />
                    </div>
                </div>
                <button type="submit" className="block mx-auto bg-gradient button mt-5" disabled={loading}>
                    {loading ? 'Please wait' : 'Submit'}
                </button>
            </form>
            <Toaster />
        </div>
    );
};


AddNewBanner.propTypes = {
    setBanners: PropTypes.func,
};

export default AddNewBanner;
