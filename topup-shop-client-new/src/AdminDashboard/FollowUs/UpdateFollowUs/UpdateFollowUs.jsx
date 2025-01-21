import PropTypes from 'prop-types';
import { useState } from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { uploadImage } from "../../../utils/uploadImage";
import toast from "react-hot-toast";


const UpdateFollowUs = ({ idx, followUs }) => {

    const [image, setImage] = useState(followUs?.icon || null);
    const [preview, setPreview] = useState(followUs?.icon || null);
    const [url, setUrl] = useState(followUs?.url || '');
    const [text, setText] = useState(followUs?.text || '');
    const [sequence, setSequence] = useState(followUs?.sequence || null);
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    // update follow us section fn
    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let uploadedImage = image;
            if (typeof image !== 'string') {
                uploadedImage = await uploadImage(image);
            }

            const followUsData = {
                id: followUs?._id,
                icon: uploadedImage,
                url,
                text,
                sequence,
            };
            
            axiosPrivate.patch('/follows/update', followUsData).then((res) => {
                console.log(res.data);
                
                if (res.data.acknowledged) {
                    document.getElementById(`update_followUs_${idx}`).close();
                    toast.success("Follow Us Updated Successfully!");
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
            <dialog id={`update_followUs_${idx}`} className="modal">
                <div className="modal-box bg-white text-black">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-xl uppercase border-b border-b-slate-400 pb-2 text-center mb-5">Update Follow Us Section</h3>

                    <form onSubmit={handleUpdate} className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="input-label">Icon</label>
                                <input type="file" onChange={handleImage} className="input cursor-pointer" />
                                {image && <img src={preview} alt="Preview" className="mt-3 max-h-48 object-cover" />}
                            </div>
                            <div>
                                <label className="input-label">URL</label>
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
                                <label className="input-label">Text</label>
                                <input
                                    type="text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    className="input"
                                    placeholder="Text"
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


UpdateFollowUs.propTypes = {
    idx: PropTypes.number,
    followUs: PropTypes.shape({
        _id: PropTypes.string,
        icon: PropTypes.string,
        url: PropTypes.string,
        text: PropTypes.string,
        sequence: PropTypes.number,
    }),
};

export default UpdateFollowUs;