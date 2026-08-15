import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { uploadImage } from "../../../utils/uploadImage";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

const AddSubCategory = () => {
  const [searchParams] = useSearchParams();
  const preselectedParentId = searchParams.get("parentServiceId") || "";

  const [categories, setCategories] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [selectableParents, setSelectableParents] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const axiosPublic = useAxiosPublic();
  const axiosPrivate = useAxiosPrivate();

  // Fetch categories on mount
  useEffect(() => {
    axiosPublic
      .get("/category")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Failed to load categories:", err));

    // Fetch all services for parent selection
    axiosPrivate
      .get("/services")
      .then((res) => setAllServices(res.data))
      .catch((err) => console.error("Failed to load services:", err));
  }, [axiosPublic, axiosPrivate]);

  // Filter parent options by selected category
  useEffect(() => {
    if (selectedCategoryId) {
      setSelectableParents(
        allServices.filter((s) => s.categoryId === selectedCategoryId)
      );
    } else {
      setSelectableParents([]);
    }
  }, [selectedCategoryId, allServices]);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [inputs, setInputs] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [value, setValue] = useState("");
  const [descriptionValue, setDescriptionValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuto, setIsAuto] = useState(false);
  const [serviceType, setServiceType] = useState("standard");
  const [statLabels, setStatLabels] = useState(["", "", "", ""]);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [soldPerPage, setSoldPerPage] = useState(20);
  const [soldTotalLimit, setSoldTotalLimit] = useState(0);
  const navigate = useNavigate();

  const handleStatLabelChange = (index, value) => {
    setStatLabels((prev) => prev.map((l, i) => (i === index ? value : l)));
  };

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

    if (
      serviceType === "itemListing" &&
      statLabels.some((label) => !label.trim())
    ) {
      toast.error("Please fill all 4 stat labels for an Item Listing service!");
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
        notice: e.target.notice?.value || "",
        description: descriptionValue,
        redirectUrl: e.target.redirectUrl?.value || "",
      };

      // Include parentServiceId if selected
      if (e.target.parentServiceId?.value) {
        newSubCategory.parentServiceId = e.target.parentServiceId.value;
      }

      // Include item-listing configuration if that type is selected
      if (serviceType === "itemListing") {
        newSubCategory.serviceType = "itemListing";
        newSubCategory.statLabels = statLabels.map((l) => l.trim());
        newSubCategory.itemsPerPage = itemsPerPage;
        newSubCategory.soldPerPage = soldPerPage;
        newSubCategory.soldTotalLimit = soldTotalLimit;
      }

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
              onChange={(e) => setSelectedCategoryId(e.target.value)}
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

        {/* Parent Service (optional) */}
        <div>
          <label htmlFor="" className="input-label">
            Parent Service <span className="text-gray-400 text-sm">(optional — for nested sub-services)</span>
          </label>
          <select
            name="parentServiceId"
            className="input"
            defaultValue={preselectedParentId}
          >
            <option value="">None (top-level service)</option>
            {selectableParents?.map((service) => (
              <option key={service?._id} value={service?._id}>
                {service?.title}
              </option>
            ))}
          </select>
          {selectedCategoryId && selectableParents.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">
              No services in this category yet. Parent selection requires at least one service in the chosen category.
            </p>
          )}
        </div>

        {/* Service Type */}
        <div>
          <label htmlFor="" className="input-label">
            Service Type
          </label>
          <select
            className="input"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
          >
            <option value="standard">Standard (price options)</option>
            <option value="itemListing">Item Listing (e.g. ID buy)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Standard shows the usual price-option purchase page. Item Listing
            shows a grid of individual product cards that are managed separately.
          </p>
        </div>

        {/* Stat labels for item listing */}
        {serviceType === "itemListing" && (
          <div>
            <label htmlFor="" className="input-label">
              Stat Labels <span className="text-gray-400 text-sm">(4 required)</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {statLabels.map((label, idx) => (
                <input
                  key={idx}
                  type="text"
                  className="input"
                  placeholder={`Label ${idx + 1}`}
                  value={label}
                  onChange={(e) => handleStatLabelChange(idx, e.target.value)}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              These four labels are shown on every item card and detail page under
              this service (e.g. LVL, Prime LVL, Evo, Like).
            </p>

            {/* listing / sold pagination settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
              <div>
                <label className="input-label">Items Per Page</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="input"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Items shown per page in the main listing (max 100).
                </p>
              </div>
              <div>
                <label className="input-label">Sold Items Per Page</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="input"
                  value={soldPerPage}
                  onChange={(e) => setSoldPerPage(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Items shown per page in the Recently Sold section (max 100).
                </p>
              </div>
              <div>
                <label className="input-label">Total Sold Items Limit</label>
                <input
                  type="number"
                  min="0"
                  className="input"
                  value={soldTotalLimit}
                  onChange={(e) => setSoldTotalLimit(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum sold items ever shown, across all pages. Use{" "}
                  <b>0</b> for no limit.
                </p>
              </div>
            </div>
          </div>
        )}

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

        {/* Notice */}
        <div>
          <label htmlFor="" className="input-label">
            Notice <span className="text-gray-400 text-sm">(optional — shown on nested services page)</span>
          </label>
          <textarea
            name="notice"
            className="input w-full h-24 resize-y"
            placeholder="Enter notice text for the children listing page..."
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
          <ReactQuill theme="snow" value={descriptionValue} onChange={setDescriptionValue} />
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
          />
          <p className="text-xs text-gray-500 mt-1">
            If set, clicking this service card redirects here instead of opening the service page. Use absolute URLs for external links or relative paths for internal pages.
          </p>
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