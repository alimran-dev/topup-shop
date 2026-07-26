import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { uploadImage } from "../../../utils/uploadImage";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AddSubCategory = () => {
  const [categories, setCategories] = useState([]);
  const axiosPublic = useAxiosPublic();
  const axiosPrivate = useAxiosPrivate();

  // Fetch categories on mount
  useEffect(() => {
    axiosPublic
      .get("/category")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Failed to load categories:", err));
  }, [axiosPublic]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [inputs, setInputs] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuto, setIsAuto] = useState(false);
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    if (inputs.length === 0 || value.trim() === "") {
      toast.error("Full all inputs!");
      setLoading(false);
      return;
    }

    try {
      // upload the image
      const uploadedImage = await uploadImage(image);

      const newSubCategory = {
        title: e.target.title.value,
        categoryId: e.target.categoryId.value,
        tutorialText: e.target.tutorialText.value,
        tutorialURL: e.target.tutorialURL.value,
        inputs,
        isAuto: e.target.isAuto.checked,
        server: isAuto ? e.target.server.value : "",
        image: uploadedImage,
        rules: value,
      };

      // call post api
      try {
        const { data } = await axiosPrivate.post(
          "/services/new",
          newSubCategory
        );
        // console.log('data---------',data);

        if (data?.insertedId) {
          toast.success("Service Added Successfully!");
          setLoading(false);
          navigate("/dashboard/services");
        } else {
          toast.error("Something went wrong! Try again!");
          setLoading(false);
        }
      } catch (error) {
        toast.error("Something went wrong! Check your network!");
        setLoading(false);
      }
    } catch (error) {
      toast.error("Error uploading image");
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="title !text-xl md:!text-5xl">Add New Sub-Category</h2>

      {/* subcategory add form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto space-y-3 md:space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* title */}
          <div>
            <label htmlFor="" className="input-label">
              Sub-Category Name
            </label>
            <input
              type="text"
              name="title"
              className="input"
              placeholder="Type sub-Category name"
              required
            />
          </div>
          {/* select category */}
          <div>
            <label htmlFor="" className="input-label">
              Select Category
            </label>
              <select
              name="categoryId"
              className="input"
              defaultValue={""}
              required
            >
              <option value="" disabled>
                Choose one
              </option>
              {categories?.map((category) => (
                <option key={category?._id} value={category?._id}>
                  {category?.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* tutorial text */}
          <div>
            <label htmlFor="" className="input-label">
              Tutorial Text
            </label>
            <input
              type="text"
              name="tutorialText"
              className="input"
              placeholder="Type tutorial text"
              required
            />
          </div>
          {/* tutorial url */}
          <div>
            <label htmlFor="" className="input-label">
              Tutorial URL
            </label>
            <input
              type="text"
              name="tutorialURL"
              className="input"
              placeholder="Type tutorial URL"
              required
            />
          </div>
        </div>

        {/* enable or disable auto topup */}
        <div className="flex items-center gap-2.5">
          <label htmlFor="" className="input-label">
            Enable Auto Topup:{" "}
          </label>
          <input
            type="checkbox"
            name="isAuto"
            className="toggle"
            onChange={(e) => setIsAuto(e.target.checked)}
          />
        </div>

        {/* auto server select */}
        {isAuto && (
          <div className="">
            <label htmlFor="server" className="input-label">
              Auto Server:{" "}
            </label>
            <select name="server" id="server" className="input">
              <option value="" disabled selected>
                Select Server
              </option>
              <option value="unipin">Unipin</option>
              <option value="unipinNormal">Unipin Without Auto</option>
              <option value="my">MY</option>
              <option value="sg">SG</option>
              <option value="indo">Indo</option>
              <option value="like">Like</option>
            </select>
          </div>
        )}

        {/* inputs */}
        <div>
          <label htmlFor="newInput" className="input-label">
            Input
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              className="input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type input field's label"
            />
            <button
              onClick={handleAdd}
              className="bg-primary px-4 py-2 rounded-md text-white font-bold"
            >
              Add
            </button>
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
          <label htmlFor="" className="input-label">
            Upload Image
          </label>
          <input
            type="file"
            name="image"
            className="input"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          {image && (
            <img
              src={preview}
              alt="Preview"
              className="mt-3 max-h-48 object-cover"
            />
          )}
        </div>

        {/* text editor */}
        <div className="rich-text-content">
          <label htmlFor="" className="input-label">
            Rules & Conditions
          </label>
          <ReactQuill theme="snow" value={value} onChange={setValue} />
        </div>

        {/* submit btn */}
        <button
          type="submit"
          className="block mx-auto button bg-gradient"
          disabled={loading}
        >
          {loading ? "Please Wait..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default AddSubCategory;
