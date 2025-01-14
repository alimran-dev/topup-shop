import { useState } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Swal from "sweetalert2";


const categories = [
    { id: 1, title: "Recharge & Offers" },
    { id: 2, title: "FF Topup & Unipin" },
    { id: 3, title: "Telegram Packages" },
    { id: 4, title: "Like - Follow - Subscribe" },
    { id: 5, title: "Subscription" },
];


const AddSubCategory = () => {

    const [image, setImage] = useState(null);
    const [inputs, setInputs] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [value, setValue] = useState('');

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


    // Handle image file selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(URL.createObjectURL(file));
        }
    };

    // handle submit fn
    const handleSubmit = async (e) => {
        e.preventDefault();

        const values = {
            title: e.target.title.value,
            category: e.target.category.value,
            tutorialText: e.target.tutorialText.value,
            tutorialURL: e.target.tutorialURL.value,
            inputs,
            image,
            value,
        };

        if (inputs.length === 0 || value.trim() === '') {
            Swal.fire({
                position: "top",
                icon: "error",
                title: `Fill All Input Fields!`,
                showConfirmButton: false,
                timer: 1000,
                toast: true,
            });
            return;
        }


        console.log('Submitted values:', values);
    };


    return (
        <div>
            <h2 className="title !text-xl md:!text-5xl">Add New Sub-Category</h2>

            {/* subcategory add form */}
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-3 md:space-y-5">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* title */}
                    <div>
                        <label htmlFor="" className="input-label">Sub-Category Name</label>
                        <input type="text" name="title" className="input" placeholder="Type sub-Category name" required />
                    </div>
                    {/* select category */}
                    <div>
                        <label htmlFor="" className="input-label">Select Category</label>
                        <select name="category" className="input" defaultValue={""} required>
                            <option value="" disabled>Choose one</option>
                            {
                                categories?.map(category =>
                                    <option key={category?.id} value={category?.title}>{category?.title}</option>
                                )
                            }
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* tutorial text */}
                    <div>
                        <label htmlFor="" className="input-label">Tutorial Text</label>
                        <input type="text" name="tutorialText" className="input" placeholder="Type stutorial title" required />
                    </div>
                    {/* tutorial url */}
                    <div>
                        <label htmlFor="" className="input-label">Tutorial URL</label>
                        <input type="text" name="tutorialURL" className="input" placeholder="Type tutorial URL" required />
                    </div>
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
                        required
                    />
                    {image && <img src={image} alt="Preview" className="mt-3 max-h-48" />}
                </div>

                {/* text editor */}
                <div className="rich-text-content">
                    <label htmlFor="" className="input-label">Rules & Conditions</label>
                    <ReactQuill theme="snow" value={value} onChange={setValue} />
                    {/* <div
                        dangerouslySetInnerHTML={{ __html: value }}
                        className="rich-text-output"
                    /> */}
                </div>

                {/* submit btn */}
                <button type="submit" className="block mx-auto button bg-gradient">Submit</button>
            </form>

        </div>
    );
};

export default AddSubCategory;