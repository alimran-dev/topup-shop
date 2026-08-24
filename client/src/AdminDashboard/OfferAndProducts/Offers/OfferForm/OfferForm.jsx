import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { uploadImage } from "../../../../utils/uploadImage";
import toast, { Toaster } from "react-hot-toast";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import ComboModal from "../../../Options/AddOption/ComboModal";
import comboConfigs, { comboRows } from "../../../Options/AddOption/comboConfigs";

const OfferForm = () => {
  const { id } = useParams(); // ID for editing
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isOpenCombo, setIsOpenCombo] = useState(false);
  const [selectedAutoServer, setSelectedAutoServer] = useState("");

  const [combo, setCombo] = useState(() => comboRows("unipin"));
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
    maxClaimPerInput: "",
    willHaveQuantity: false,
    allowedRoles: [],
    highlightTypeId: "",
  });
  const [subTypes, setSubTypes] = useState([]);

  // subscription types for the allowed-purchasers + highlight selectors
  useEffect(() => {
    axiosPrivate
      .get("/subscription/admin/types")
      .then((res) => setSubTypes(res.data || []))
      .catch(() => {});
  }, [axiosPrivate]);

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
              const serverCombo = comboRows(data.autoServer);
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
      // For sg server (shell), only one item can be selected with quantity 1
      const selectedItem = combo.find((item) => item.quantity > 0);
      setComboSummary({
        package: selectedItem?.package,
        quantity: selectedItem?.quantity,
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
        setCombo(comboRows(value));
      } else {
        setCombo(comboRows("unipin"));
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
        inputs: formData.inputs.split(",").map((input) => input.trim()),
        // Optional caps — blank means unlimited, so send only when non-blank
        ...(formData.maxClaim !== "" && { maxClaim: Number(formData.maxClaim) }),
        ...(formData.maxClaimPerInput !== "" && {
          maxClaimPerInput: Number(formData.maxClaimPerInput),
        }),
        // Optional restriction + highlight — absent ⇒ everyone / no highlight
        ...(formData.allowedRoles?.length && {
          allowedRoles: formData.allowedRoles,
        }),
        ...(formData.highlightTypeId && {
          highlightTypeId: formData.highlightTypeId,
        }),
        ...(id && { isActive: formData.isActive }),
        ...(id && { sequence: formData.sequence }),
        ...(formData.autoServer && { autoServer: formData.autoServer }),
        ...(formData.willHaveQuantity !== undefined && {
          willHaveQuantity: formData.willHaveQuantity,
        }),
      };

      // Add combo data if auto is enabled (same shapes as normal dynamic
      // options — carries uc/package so the auto server gets real unit codes)
      if (formData.isAuto && selectedAutoServer) {
        const newCombo = combo.map((pack) => {
          if (selectedAutoServer === "indo") {
            return {
              name: pack?.original || pack?.name,
              label: pack?.name,
              package: pack?.package,
              quantity: pack?.quantity,
            };
          } else if (selectedAutoServer === "sg") {
            return {
              name: pack?.name,
              package: pack?.package,
              quantity: pack?.quantity,
            };
          } else if (selectedAutoServer === "unipin") {
            return {
              name: pack?.original || pack?.name,
              uc: pack?.uc,
              quantity: pack?.quantity,
            };
          } else {
            // my
            return {
              name: pack?.original || pack?.name,
              package: pack?.package,
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
              <label htmlFor="maxClaim">
                Max Claim Per Email:{" "}
                <span className="text-xs text-gray-400">
                  (blank = unlimited)
                </span>
              </label>
              <input
                type="number"
                id="maxClaim"
                name="maxClaim"
                className="input"
                value={formData.maxClaim}
                onChange={handleChange}
                placeholder="Max Claim Per Email"
              />
            </div>

            <div>
              <label htmlFor="maxClaimPerInput">
                Max Claim Per Input Value:{" "}
                <span className="text-xs text-gray-400">
                  (blank = unlimited)
                </span>
              </label>
              <input
                type="number"
                id="maxClaimPerInput"
                name="maxClaimPerInput"
                className="input"
                value={formData.maxClaimPerInput}
                onChange={handleChange}
                placeholder="Each input field counted separately"
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
                        : "Selected items"
                    }
                    value={
                      selectedAutoServer === "unipin"
                        ? `D-[${comboSummary?.diamond}] W-[${comboSummary?.weekly}] M-[${comboSummary?.monthly}]`
                        : selectedAutoServer === "sg"
                        ? `Lite-${comboSummary?.quantity || 0}`
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

            <div className="md:col-span-2">
              <label className="input-label">
                Allowed Purchasers{" "}
                <span className="text-xs text-gray-400">
                  (none selected = everyone)
                </span>
              </label>
              <div className="flex flex-wrap gap-4 mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowedRoles?.includes("normal")}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...(formData.allowedRoles || []), "normal"]
                        : (formData.allowedRoles || []).filter(
                            (r) => r !== "normal"
                          );
                      setFormData({ ...formData, allowedRoles: next });
                    }}
                  />
                  Normal user
                </label>
                {subTypes.map((t) => (
                  <label
                    key={t._id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.allowedRoles?.includes(t._id)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...(formData.allowedRoles || []), t._id]
                          : (formData.allowedRoles || []).filter(
                              (r) => r !== t._id
                            );
                        setFormData({ ...formData, allowedRoles: next });
                      }}
                    />
                    {t.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="input-label">
                Highlight Color Type{" "}
                <span className="text-xs text-gray-400">
                  (optional — from the allowed purchasers above)
                </span>
              </label>
              <select
                name="highlightTypeId"
                className="input"
                value={formData.highlightTypeId || ""}
                onChange={handleChange}
              >
                <option value="">None</option>
                {subTypes
                  .filter(
                    (t) =>
                      formData.allowedRoles?.includes(t._id) ||
                      t._id === formData.highlightTypeId
                  )
                  .map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
              </select>
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
