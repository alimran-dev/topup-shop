import PropTypes from 'prop-types';
import toast, { Toaster } from "react-hot-toast";
import { uploadImage } from "../../../utils/uploadImage";
import { useState } from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";


const AddFollowUs = ({ setFollowUsData }) => {

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [text, setText] = useState('');
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

    // add new follow section fn
    const handleAddSection = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const uploadedImage = await uploadImage(image);

            const sectionData = {
                text,
                url,
                icon: uploadedImage,
            };

            axiosPrivate.post('/follows/new', sectionData).then((res) => {
                if (res.data.insertedId) {
                    toast.success("Added Follow Us Successfully!");

                    e.target.elements.iconInput.value = '';
                    setImage(null);
                    setPreview(null);
                    setText('');
                    setUrl('');

                    // update state
                    setFollowUsData(prevFollow => [...prevFollow, { _id: res.data.insertedId, text, icon: uploadedImage, url }]);
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
            <h1 className="title">Add Follow Us Section</h1>
            <form onSubmit={handleAddSection} className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="input-label">Follow Text</label>
                        <input
                            type="text"
                            onChange={(e) => setText(e.target.value)}
                            value={text}
                            className="input"
                            placeholder="Type follow text"
                        />
                    </div>
                    <div>
                        <label className="input-label">Icon Image</label>
                        <input type="file" onChange={handleImage} name='iconInput' className="input cursor-pointer" />
                        {image && <img src={preview} alt="Preview" className="mt-3 w-20 h-20 object-contain" />}
                    </div>
                    <div>
                        <label className="input-label">Redirect URL</label>
                        <input
                            type="text"
                            onChange={(e) => setUrl(e.target.value)}
                            value={url}
                            className="input"
                            placeholder="Type redirect url"
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

AddFollowUs.propTypes = {
    setFollowUsData: PropTypes.func,
};

export default AddFollowUs;