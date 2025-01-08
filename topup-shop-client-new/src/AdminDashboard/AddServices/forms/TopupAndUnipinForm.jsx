/* eslint-disable react/prop-types */
import { useState } from "react";
import { uploadImage } from "../../../utils/uploadImage";

const TopupAndUnipinForm = ({ category }) => {
  const [name, setName] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState("");
  const [uc, setUc] = useState("");
  const [tutorialTitle, setTutorialTitle] = useState("");
  const [tutorialUrl, setTutorialUrl] = useState("");
  const [form, setForm] = useState([]);
  const [codes, setCodes] = useState([]);
  const [rulesAndConditions, setRulesAndConditions] = useState([]);

  const [loading, setLoading] = useState(false);

  const handleAdd = (key, value) => {
    if (key === "form") {
      setForm([...form, value]);
    } else if (key === "codes") {
      setCodes([...codes, value]);
    } else if (key === "rulesAndConditions") {
      setRulesAndConditions([...rulesAndConditions, value]);
    }
  };

  const handleRemove = (key, index) => {
    if (key === "form") {
      setForm(form.filter((_, idx) => idx !== index));
    } else if (key === "codes") {
      setCodes(codes.filter((_, idx) => idx !== index));
    } else if (key === "rulesAndConditions") {
      setRulesAndConditions(
        rulesAndConditions.filter((_, idx) => idx !== index)
      );
    }
  };

  const data = {
    category,
    subCategory,
    name,
    image,
    price,
    uc,
    tutorialTitle,
    tutorialUrl,
    form,
    codes,
    rulesAndConditions,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full">
      <div className="md:grid md:grid-cols-2 gap-2 md:w-2/3 mx-auto items-center justify-center">
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-xl font-medium text-gray-700"
          >
            Name
          </label>
          <input
            type="text"
            onChange={(e) => setName(e.target.value)}
            value={name}
            className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-400 rounded-md"
            placeholder="Enter name"
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
          <select
            name="subCategory"
            onChange={(e) => setSubCategory(e.target.value)}
            value={subCategory}
            className="py-1.5 px-3 w-full border-2 border-gray-400 rounded-md block font-medium"
          >
            {[
              "Unipin",
              "IdCode",
              "Weekly",
              "Shell",
              "Airdrop",
              "LessIsMore",
            ].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
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
            htmlFor="price"
            className="block text-xl font-medium text-gray-700"
          >
            Price
          </label>
          <input
            type="number"
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-400 rounded-md"
            placeholder="Enter price"
            required
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="uc"
            className="block text-xl font-medium text-gray-700"
          >
            UC
          </label>
          <input
            type="number"
            onChange={(e) => setUc(e.target.value)}
            value={uc}
            className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-400 rounded-md"
            placeholder="Enter UC"
            required
          />
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

      {["form", "codes", "rulesAndConditions"].map((key) => (
        <div key={key} className="space-y-5">
          <label className="block text-xl font-medium text-gray-700 capitalize">
            {key.replace(/([A-Z])/g, " $1")}:
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-400 rounded-md"
              placeholder={`Enter ${key === "form" ? "placeholder" : "value"} `}
            />
            <button
              type="button"
              className="py-1 px-3 bg-green-400 text-white font-semibold rounded"
              onClick={(e) => {
                const value = e.target.previousElementSibling.value;
                handleAdd(key, value);
                e.target.previousElementSibling.value = ""; // Clear the input field after adding
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
              {key === "codes" &&
                codes.map((item, index) => (
                  <li key={index} className="flex justify-between items-center">
                    {item}
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
                    {item}
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

export default TopupAndUnipinForm;
