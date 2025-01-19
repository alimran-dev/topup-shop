import PropTypes from 'prop-types';
import toast from "react-hot-toast";
import { uploadImage } from "../../../utils/uploadImage";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useState } from "react";

const UpdateBanner = ({ idx, banner }) => {
    const [image, setImage] = useState(banner?.image || null);
    const [preview, setPreview] = useState(banner?.image || null);
    const [url, setUrl] = useState(banner?.url || '');
    const [sequence, setSequence] = useState(banner?.sequence || null);
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    // update banner fn
    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        try {
            let uploadedImage = image;
            if (typeof image !== 'string') {
                uploadedImage = await uploadImage(image);
            }
    
            const bannerData = {
                id: banner?._id,
                image: uploadedImage,
                url,
                sequence,
            };
    
            axiosPrivate.patch('/banners/update', bannerData).then((res) => {
                if (res.data.acknowledged) {
                    document.getElementById(`update_banner_${idx}`).close();
                    setLoading(false);
                    setImage(null);
                    setUrl('');
                    toast.success("Banner Updated Successfully!");
                    window.location.reload();
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
            <dialog id={`update_banner_${idx}`} className="modal">
                <div className="modal-box bg-white text-black">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-xl uppercase border-b border-b-slate-400 pb-2 text-center mb-5">Update Banner</h3>

                    <form onSubmit={handleUpdate} className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="input-label">Banner Image</label>
                                <input type="file" onChange={handleImage} className="input cursor-pointer" />
                                {image && <img src={preview} alt="Preview" className="mt-3 max-h-48 object-cover" />}
                            </div>
                            <div>
                                <label className="input-label">Banner URL</label>
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="input"
                                    placeholder="Banner URL"
                                    required
                                />
                            </div>
                            <div>
                                <label className="input-label">Banner Sequence</label>
                                <input
                                    type="number"
                                    value={sequence}
                                    onChange={(e) => setSequence(e.target.value)}
                                    className="input"
                                    placeholder="Banner Sequence"
                                />
                            </div>
                        </div>
                        <button type="submit" className="block mx-auto bg-gradient button mt-5 text-sm" disabled={loading}>
                            {loading ? 'Please wait' : 'Submit'}
                        </button>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

UpdateBanner.propTypes = {
    idx: PropTypes.number,
    banner: PropTypes.shape({
        _id: PropTypes.string,
        image: PropTypes.string,
        url: PropTypes.string,
        sequence: PropTypes.number,
    }),
};

export default UpdateBanner;
