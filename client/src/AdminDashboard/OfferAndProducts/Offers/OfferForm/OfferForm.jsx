import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { uploadImage } from "../../../../utils/uploadImage";
import toast, { Toaster } from "react-hot-toast";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import ComboModal from "../../../Options/AddOption/ComboModal";

// Define combo configurations for different servers
const comboConfigs = {
  unipin: [
    { name: "25 💎", original: "25 Diamond", value: 25, quantity: 0 },
    { name: "50 💎", original: "50 Diamond", value: 50, quantity: 0 },
    { name: "115 💎", original: "115 Diamond", value: 115, quantity: 0 },
    { name: "240 💎", original: "240 Diamond", value: 240, quantity: 0 },
    { name: "610 💎", original: "610 Diamond", value: 610, quantity: 0 },
    { name: "1240 💎", original: "1240 Diamond", value: 1240, quantity: 0 },
    { name: "2530 💎", original: "2530 Diamond", value: 2530, quantity: 0 },
    { name: "Weekly", original: "Weekly Membership", value: 0, quantity: 0 },
    { name: "Monthly", original: "Monthly Membership", value: 0, quantity: 0 },
  ],
  my: [
    {
      name: "LU Pass - 6",
      original: "Level Up Package - Level 6",
      quantity: 0,
    },
    {
      name: "LU Pass - 10",
      original: "Level Up Package - Level 10",
      quantity: 0,
    },
    {
      name: "LU Pass - 15",
      original: "Level Up Package - Level 15",
      quantity: 0,
    },
    {
      name: "LU Pass - 20",
      original: "Level Up Package - Level 20",
      quantity: 0,
    },
    {
      name: "LU Pass - 25",
      original: "Level Up Package - Level 25",
      quantity: 0,
    },
    {
      name: "LU Pass - 30",
      original: "Level Up Package - Level 30",
      quantity: 0,
    },
    { name: "Evo 3D", original: "Evo Access 3D", quantity: 0 },
    { name: "Evo 7D", original: "Evo Access 7D", quantity: 0 },
    { name: "Evo 30D", original: "Evo Access 30D", quantity: 0 },
    { name: "Weekly", original: "Weekly Lite", quantity: 0 },
  ],
  indo: [
    { name: "5 💎", original: "5", quantity: 0 },
    { name: "50 💎", original: "50", quantity: 0 },
    { name: "70 💎", original: "70", quantity: 0 },
    { name: "140 💎", original: "140", quantity: 0 },
    { name: "355 💎", original: "355", quantity: 0 },
    { name: "720 💎", original: "720", quantity: 0 },
    { name: "7290 💎", original: "7.290", quantity: 0 },
    { name: "36500 💎", original: "36.500", quantity: 0 },
    { name: "73100 💎", original: "73.100", quantity: 0 },
    { name: "BP Card", original: "BP Card", quantity: 0 },
    { name: "Monthly", original: "Member Bulanan", quantity: 0 },
    { name: "Weekly", original: "Member Mingguan", quantity: 0 },
    { name: "LU Pass - 6", original: "Level Up Pass - Level 6", quantity: 0 },
    { name: "LU Pass - 10", original: "Level Up Pass - Level 10", quantity: 0 },
    { name: "LU Pass - 15", original: "Level Up Pass - Level 15", quantity: 0 },
    { name: "LU Pass - 20", original: "Level Up Pass - Level 20", quantity: 0 },
    { name: "LU Pass - 25", original: "Level Up Pass - Level 25", quantity: 0 },
    { name: "LU Pass - 30", original: "Level Up Pass - Level 30", quantity: 0 },
  ],
  sg: [
    { name: "Airdrop 1$", original: "Airdrop 1$", dollar: 1, quantity: 0 },
    { name: "Airdrop 2$", original: "Airdrop 2$", dollar: 2, quantity: 0 },
    { name: "Airdrop 3$", original: "Airdrop 3$", dollar: 3, quantity: 0 },
    { name: "Airdrop 4$", original: "Airdrop 4$", dollar: 4, quantity: 0 },
  ],
};

const OfferForm = () => {
  const { id } = useParams(); // ID for editing
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isOpenCombo, setIsOpenCombo] = useState(false);
  const [selectedAutoServer, setSelectedAutoServer] = useState("");

  const [combo, setCombo] = useState(comboConfigs.unipin);
  const [comboSummary, setComboSummary] = useState({
    diamond: 0,
    weekly: 0,
    monthly: 0,
  });

  const [formData, setFormData] = useState({
    title: "",
    stock: "",
    price: "",
    type: "",
    shortDescription: "",
    image: "",
    tutorialTitle: "",
    tutorialUrl: "",
    inputs: "",
    isAuto: false,
    maxClaim: "",
    willHaveQuantity: false,
  });

  // Fetch existing offer data if editing
  useEffect(() => {
    if (id) {
      axiosPrivate
        .get(`/special/get?id=${id}`)
        .then(({ data }) => {
          // console.log(data);
          setFormData({
            ...data,
            inputs: data.inputs.join(", "),
            ...(id ? { isActive: data.isActive } : {}),
            ...(id ? { sequence: data.sequence } : {}),
            ...(data.isAuto !== undefined ? { isAuto: data.isAuto } : {}),
            ...(data.autoServer ? { autoServer: data.autoServer } : {}),
          });
          if (data.image) {
            setPreview(data.image); // Show existing image
          }
          // If editing an auto offer, set up combo
          if (data.isAuto && data.autoServer) {
            setSelectedAutoServer(data.autoServer);
            if (comboConfigs[data.autoServer]) {
              const existingCombo = data.combo || [];
              const serverCombo = [...comboConfigs[data.autoServer]];
              // Restore combo quantities if they exist
              serverCombo.forEach((item) => {
                const existingItem = existingCombo.find(
                  (c) => c.name === item.original || c.name === item.name
                );
                if (existingItem) {
                  item.quantity = existingItem.quantity || 0;
                }
              });
              setCombo(serverCombo);
            }
          }
        })
        .catch((err) => console.error("Error fetching offer:", err));
    }
  }, [id, axiosPrivate]);

  // make new combo summary
  useEffect(() => {
    if (selectedAutoServer === "unipin") {
      const totalDiamond = combo.reduce(
        (sum, curr) => sum + (curr.value || 0) * curr.quantity,
        0
      );
      const totalWeekly =
        combo.find((item) => item.name === "Weekly")?.quantity || 0;
      const totalMonthly =
        combo.find((item) => item.name === "Monthly")?.quantity || 0;
      setComboSummary({
        diamond: totalDiamond,
        weekly: totalWeekly,
        monthly: totalMonthly,
      });
    } else if (selectedAutoServer === "sg") {
      // For sg server, only one item can be selected with quantity 1
      const selectedItem = combo.find((item) => item.quantity > 0);
      const totalDollars = selectedItem ? selectedItem.dollar || 0 : 0;
      setComboSummary({
        diamond: totalDollars,
        weekly: 0,
        monthly: 0,
      });
    } else {
      // For other servers (my, indo), just count total items
      const totalItems = combo.reduce((sum, curr) => sum + curr.quantity, 0);
      setComboSummary({
        diamond: totalItems,
        weekly: 0,
        monthly: 0,
      });
    }
  }, [combo, selectedAutoServer]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    if (name === "isAuto") {
      const isAutoChecked = checked;
      setFormData({
        ...formData,
        [name]: isAutoChecked,
      });
      if (!isAutoChecked) {
        setSelectedAutoServer("");
        setCombo(comboConfigs.unipin);
      }
    } else if (name === "autoServer") {
      setSelectedAutoServer(value);
      if (comboConfigs[value]) {
        setCombo([...comboConfigs[value]]);
      } else {
        setCombo([...comboConfigs.unipin]);
      }
      setFormData({
        ...formData,
        [name]: value,
      });
    } else if (name === "willHaveQuantity") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === "isActive" ? value === "true" : value, // Convert to boolean
      });
    }
  };

  // Handle image selection
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); // Show new preview
    }
  };

  // Handle form submission (Add / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("hitted");

    try {
      let imageUrl = formData.image; // Keep existing image

      // Upload new image if selected
      if (image) {
        imageUrl = await uploadImage(image);
      }

      const payload = {
        ...formData,
        image: imageUrl,
        price: Number(formData.price),
        stock: Number(formData.stock),
        maxClaim: Number(formData.maxClaim || 0),
        inputs: formData.inputs.split(",").map((input) => input.trim()),
        ...(id && { isActive: formData.isActive }),
        ...(id && { sequence: formData.sequence }),
        ...(formData.autoServer && { autoServer: formData.autoServer }),
        ...(formData.willHaveQuantity !== undefined && {
          willHaveQuantity: formData.willHaveQuantity,
        }),
      };

      // Add combo data if auto is enabled
      if (formData.isAuto && selectedAutoServer) {
        const newCombo = combo.map((pack) => {
          if (selectedAutoServer === "my" || selectedAutoServer === "indo") {
            return {
              name: pack?.original || pack?.name,
              label: pack?.name,
              quantity: pack?.quantity,
            };
          } else if (selectedAutoServer === "sg") {
            return {
              name: pack?.original || pack?.name,
              dollar: pack?.dollar,
              quantity: pack?.quantity,
            };
          } else {
            return {
              name: pack?.original || pack?.name,
              quantity: pack?.quantity,
            };
          }
        });
        payload.combo = newCombo;
      }

      //   console.log(payload, "-----------payload");

      if (id) {
        // Update existing offer
        const res = await axiosPrivate.patch(
          `/special/update?id=${id}`,
          payload
        );
        // console.log(res.data);

        if (res.data.acknowledged) {
          toast.success("Offer Updated Successfully!");
        } else {
          toast.error("Something Went Wrong!");
        }
      } else {
        // Add new offer
        const res = await axiosPrivate.post("/special/new", payload);
        // console.log(res.data);
        if (res.data.acknowledged) {
          toast.success("Offer Added Successfully!");
        } else {
          toast.error("Something Went Wrong!");
        }
      }

      navigate("/dashboard/offersAndProducts");
    } catch (error) {
      console.error("Error submitting offer:", error);
      toast.error("Error submitting offer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="title">{id ? "Edit Offer" : "Add New Offer"}</h2>
      <ComboModal
        combo={combo}
        setCombo={setCombo}
        isOpenCombo={isOpenCombo}
        setIsOpenCombo={setIsOpenCombo}
        selectedServer={selectedAutoServer}
      />
      <div className="pt-5 max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="input-label">Title</label>
              <input
                type="text"
                name="title"
                className="input"
                value={formData.title}
                onChange={handleChange}
                placeholder="Title"
                required
              />
            </div>
            <div>
              <label className="input-label">Stock</label>
              <input
                type="number"
                name="stock"
                className="input"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Stock"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-5">
            <div>
              <label className="input-label">Price</label>
              <input
                type="number"
                name="price"
                className="input"
                value={formData.price}
                onChange={handleChange}
                placeholder="Price"
                required
              />
            </div>
            <div>
              <label className="input-label">Type</label>
              <select
                name="type"
                className="input"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Choose One
                </option>
                <option value="balance">Balance</option>
                <option value="coin">Coin</option>
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="input-label">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="input cursor-pointer"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-3 max-h-48 object-cover"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-5">
            <div>
              <label className="input-label">Tutorial Title</label>
              <input
                type="text"
                name="tutorialTitle"
                className="input"
                value={formData.tutorialTitle}
                onChange={handleChange}
                placeholder="Tutorial Title"
              />
            </div>

            <div>
              <label className="input-label">Tutorial URL</label>
              <input
                type="text"
                name="tutorialUrl"
                className="input"
                value={formData.tutorialUrl}
                onChange={handleChange}
                placeholder="Tutorial URL"
              />
            </div>

            <div>
              <label htmlFor="maxClaim">Max Claim:</label>
              <input
                type="number"
                id="maxClaim"
                name="maxClaim"
                className="input"
                value={formData.maxClaim}
                onChange={handleChange}
                placeholder="Max Claim"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="isAuto" className="input-label !mb-0">
                Is It Auto?
              </label>
              <input
                type="checkbox"
                id="isAuto"
                name="isAuto"
                className="toggle"
                checked={formData.isAuto}
                onChange={handleChange}
              />
            </div>

            {formData?.isAuto && (
              <div>
                <label className="input-label">Auto Server:</label>
                <select
                  name="autoServer"
                  className="input"
                  value={formData.autoServer}
                  defaultValue={""}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Choose One
                  </option>
                  <option value="unipin">Unipin</option>
                  <option value="my">MY</option>
                  <option value="sg">SG</option>
                  <option value="indo">Indo</option>
                </select>
              </div>
            )}

            {formData.isAuto && selectedAutoServer && (
              <div className="space-y-2">
                <label
                  htmlFor="combo"
                  className="block text-xl font-medium text-gray-700"
                >
                  {selectedAutoServer === "unipin"
                    ? "Total Diamond:"
                    : selectedAutoServer === "sg"
                    ? "Selected Airdrop:"
                    : "Combo Items:"}
                </label>
                <div className="flex">
                  <input
                    type="text"
                    name="combo"
                    required
                    disabled
                    className="block w-full py-1.5 !px-0.5 md:!px-2.5 font-medium border-2 border-gray-600 rounded-md !rounded-r-none"
                    placeholder={
                      selectedAutoServer === "unipin"
                        ? "Example: 115"
                        : selectedAutoServer === "sg"
                        ? "Select airdrop"
                        : "Selected items"
                    }
                    value={
                      selectedAutoServer === "unipin"
                        ? `D-[${comboSummary?.diamond}] W-[${comboSummary?.weekly}] M-[${comboSummary?.monthly}]`
                        : selectedAutoServer === "sg"
                        ? `$${comboSummary?.diamond}`
                        : `Items-[${comboSummary?.diamond}]`
                    }
                  />
                  <button
                    className="button !rounded-l-none"
                    type="button"
                    onClick={() => {
                      setIsOpenCombo(!isOpenCombo);
                    }}
                  >
                    Combo
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <label htmlFor="willHaveQuantity">Will Have Quantity?</label>
              <input
                type="checkbox"
                id="willHaveQuantity"
                name="willHaveQuantity"
                className="toggle"
                checked={formData.willHaveQuantity}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <label className="input-label">Inputs (comma-separated)</label>
              <input
                type="text"
                name="inputs"
                className="input"
                value={formData.inputs}
                onChange={handleChange}
                placeholder="Enter inputs, separated by commas"
              />
            </div>
          </div>

          {id && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-5">
              <div>
                <label className="input-label">Type</label>
                <select
                  name="isActive"
                  className="input"
                  onChange={handleChange}
                  value={formData.isActive}
                >
                  <option value={""} disabled>
                    Choose One
                  </option>
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
              <div>
                <label className="input-label">Sequence</label>
                <input
                  type="number"
                  name="sequence"
                  className="input"
                  value={formData?.sequence}
                  onChange={handleChange}
                  placeholder="Enter sequence"
                />
              </div>
            </div>
          )}

          {/* Textarea / Description */}
          <div>
            <label className="input-label">Short Description</label>
            <textarea
              name="shortDescription"
              className="input h-20"
              value={formData.shortDescription}
              onChange={handleChange}
              placeholder="Short Description"
              required
            ></textarea>
          </div>

          <button className="button mt-6 mx-auto flex" disabled={loading}>
            {loading ? "Please Wait..." : id ? "Update Offer" : "Submit"}
          </button>
        </form>
      </div>
      <Toaster />
    </div>
  );
};

export default OfferForm;
