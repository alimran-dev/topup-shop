/* eslint-disable react/prop-types */
import { useState } from "react";
import { uploadImage } from "../../../utils/uploadImage";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import toast from "react-hot-toast";
const TelegramPackagesForm = ({ category }) => {
  const [title, setTitle] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [image, setImage] = useState("");
  const [tutorialTitle, setTutorialTitle] = useState("");
  const [tutorialUrl, setTutorialUrl] = useState("");
  const [form, setForm] = useState([]);
  const [rulesAndConditions, setRulesAndConditions] = useState([]);

  const [loading, setLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  const handleAdd = (key, value) => {
    if (key === "form") {
      setForm([...form, value]);
    } else if (key === "rulesAndConditions") {
      setRulesAndConditions([...rulesAndConditions, value]);
    }
  };

  const handleRemove = (key, index) => {
    if (key === "form") {
      setForm(form.filter((_, idx) => idx !== index));
    } else if (key === "rulesAndConditions") {
      setRulesAndConditions(
        rulesAndConditions.filter((_, idx) => idx !== index)
      );
    }
  };

  const serviceData = {
    category,
    data: {
      subCategory,
      title,
      image,
      tutorialTitle,
      tutorialUrl,
      form,
      rulesAndConditions,
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosPrivate.post("/service/post", serviceData);
      if (data.insertedId) {
        toast.success("Service Added Successfully!");
        setTitle("");
        setSubCategory("");
        setImage("");
        setTutorialTitle("");
        setTutorialUrl("");
        setForm([]);
        setRulesAndConditions([]);
        setLoading(false);
        e.target.reset();
      }
    } catch (error) {
      toast.error("Something wrong! Try again!");
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full">
      <div className="md:grid md:grid-cols-2 gap-2 md:w-2/3 mx-auto items-center justify-center">
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-xl font-medium text-gray-700"
          >
            Title
          </label>
          <input
            type="text"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-400 rounded-md"
            placeholder="Enter Title"
            required
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="subCategory"
            className="block text-xl font-medium text-gray-700"
          >
            Sub Category
          </label>
          <input
            type="text"
            onChange={(e) => setSubCategory(e.target.value)}
            value={subCategory}
            className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-400 rounded-md"
            placeholder="Enter sub category"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="image"
            className="block text-xl font-medium text-gray-700"
          >
            Image
          </label>
          <input
            type="file"
            onChange={async (e) => {
              setLoading(true);
              try {
                setImage(await uploadImage(e.target.files[0]));
                setLoading(false);
              } catch (error) {
                alert(error);
                setLoading(false);
              }
            }}
            className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-400 rounded-md"
            required
          />
        </div>
        <div className="space-y-2 text-green-400">
          {loading ? "Image Uploading..." : <img src={image} alt="" />}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="tutorialTitle"
            className="block text-xl font-medium text-gray-700"
          >
            Tutorial Title
          </label>
          <input
            type="text"
            onChange={(e) => setTutorialTitle(e.target.value)}
            value={tutorialTitle}
            className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-400 rounded-md"
            placeholder="Enter tutorial title"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="tutorialUrl"
            className="block text-xl font-medium text-gray-700"
          >
            Tutorial URL
          </label>
          <input
            type="text"
            onChange={(e) => setTutorialUrl(e.target.value)}
            value={tutorialUrl}
            className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-400 rounded-md"
            placeholder="Enter tutorial URL"
          />
        </div>
      </div>

      {["form", "rulesAndConditions"].map((key) => (
        <div key={key} className="space-y-5">
          <label className="block text-xl font-medium text-gray-700 capitalize">
            {key.replace(/([A-Z])/g, " $1")}:
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-400 rounded-md"
              placeholder={`Enter ${
                key === "form" ? "input field label" : "rules and conditions"
              } `}
            />
            <button
              type="button"
              className="py-1 px-3 bg-green-400 text-white font-semibold rounded"
              onClick={(e) => {
                const value = e.target.previousElementSibling.value;
                handleAdd(key, value);
                e.target.previousElementSibling.value = "";
              }}
            >
              Add
            </button>
          </div>
          <div className="mt-2">
            <ul>
              {key === "form" &&
                form.map((item, index) => (
                  <li key={index} className="flex justify-between items-center">
                    {index + 1 + ". " + item}
                    <button
                      type="button"
                      className="text-red-500 ml-2"
                      onClick={() => handleRemove(key, index)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              {key === "rulesAndConditions" &&
                rulesAndConditions.map((item, index) => (
                  <li key={index} className="flex justify-between items-center">
                    {index + 1 + ". " + item}
                    <button
                      type="button"
                      className="text-red-500 ml-2"
                      onClick={() => handleRemove(key, index)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      ))}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 text-lg text-white font-semibold rounded block mx-auto"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default TelegramPackagesForm;
