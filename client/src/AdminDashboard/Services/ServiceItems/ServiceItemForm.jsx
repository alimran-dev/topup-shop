import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import toast from "react-hot-toast";
import { AiFillDelete } from "react-icons/ai";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { uploadImage } from "../../../utils/uploadImage";

const DEFAULT_SWIPER_DELAY = 3000;

const ServiceItemForm = () => {
  const { serviceId, itemId } = useParams();
  const isEdit = Boolean(itemId);

  const [service, setService] = useState(null);
  // Each entry is either an already-uploaded url or a freshly picked file
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState("");
  const [stats, setStats] = useState(["", "", "", ""]);
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [swiperDelay, setSwiperDelay] = useState(DEFAULT_SWIPER_DELAY);
  const [coin, setCoin] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappText, setWhatsappText] = useState("");
  // Left blank on create so the server assigns the next serial automatically
  const [serial, setSerial] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load the parent service (for the stat labels)
  useEffect(() => {
    axiosPrivate
      .get(`/services/get?id=${serviceId}`)
      .then((res) => setService(res.data))
      .catch(() => toast.error("Failed to load service!"));
  }, [axiosPrivate, serviceId]);

  // Load the item when editing
  useEffect(() => {
    if (!isEdit) return;
    axiosPrivate
      .get(`/serviceItems/admin/get?id=${itemId}`)
      .then((res) => {
        const data = res.data || {};
        setImages(
          (data.images || []).map((url) => ({ url, file: null, preview: url }))
        );
        setTitle(data.title || "");
        setStats(
          Array.isArray(data.stats) && data.stats.length === 4
            ? data.stats.map((s) => String(s))
            : ["", "", "", ""]
        );
        setShortDescription(data.shortDescription || "");
        setDescription(data.description || "");
        setVideoUrl(data.videoUrl || "");
        setOriginalPrice(String(data.originalPrice ?? ""));
        setOfferPrice(String(data.offerPrice ?? ""));
        setSwiperDelay(data.swiperDelay || DEFAULT_SWIPER_DELAY);
        setCoin(data.coin || 0);
        setFeedback(data.feedback || "");
        setWhatsappNumber(data.whatsappNumber || "");
        setWhatsappText(data.whatsappText || "");
        setSerial(data.serial ?? "");
        setIsActive(data.isActive !== false);
      })
      .catch(() => toast.error("Failed to load item!"));
  }, [axiosPrivate, isEdit, itemId]);

  const handleStatChange = (index, value) => {
    setStats((prev) => prev.map((s, i) => (i === index ? value : s)));
  };

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImages((prev) => [
      ...prev,
      ...files.map((file) => ({
        url: null,
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const removed = prev[index];
      // Release the object URL created for a locally-picked file
      if (removed?.file && removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (images.length === 0) {
      toast.error("Please add at least one image!");
      setLoading(false);
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a title!");
      setLoading(false);
      return;
    }
    if (stats.some((s) => s === "" || isNaN(parseFloat(s)))) {
      toast.error("Please fill all 4 stat values with numbers!");
      setLoading(false);
      return;
    }
    if (originalPrice === "" || isNaN(parseFloat(originalPrice))) {
      toast.error("Please enter a valid original price!");
      setLoading(false);
      return;
    }

    try {
      // Upload any newly picked files, keep already-hosted urls as they are
      const uploadedImages = [];
      for (const entry of images) {
        if (entry.url) {
          uploadedImages.push(entry.url);
        } else if (entry.file) {
          const url = await uploadImage(entry.file);
          if (!url) {
            toast.error("Image upload failed!");
            setLoading(false);
            return;
          }
          uploadedImages.push(url);
        }
      }

      const payload = {
        serviceId,
        images: uploadedImages,
        title: title.trim(),
        stats: stats.map((s) => parseFloat(s)),
        shortDescription,
        description,
        videoUrl,
        originalPrice: parseFloat(originalPrice),
        offerPrice: offerPrice === "" ? parseFloat(originalPrice) : parseFloat(offerPrice),
        swiperDelay: parseInt(swiperDelay) || DEFAULT_SWIPER_DELAY,
        coin: parseInt(coin) || 0,
        feedback,
        whatsappNumber,
        whatsappText,
        isActive,
      };

      // Omitted when blank so the server auto-assigns the next serial
      if (String(serial).trim() !== "" && !isNaN(parseInt(serial))) {
        payload.serial = parseInt(serial);
      }

      if (isEdit) {
        const { data } = await axiosPrivate.patch("/serviceItems/update", {
          ...payload,
          id: itemId,
        });
        if (data?.acknowledged) {
          toast.success("Item updated successfully!");
          navigate(`/dashboard/services/${serviceId}/items`);
        } else {
          toast.error("Update failed!");
        }
      } else {
        const { data } = await axiosPrivate.post("/serviceItems/new", payload);
        if (data?.insertedId) {
          toast.success("Item added successfully!");
          navigate(`/dashboard/services/${serviceId}/items`);
        } else {
          toast.error("Something went wrong!");
        }
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Something went wrong! Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const statLabels = service?.statLabels || ["Stat 1", "Stat 2", "Stat 3", "Stat 4"];

  return (
    <div>
      <h2 className="title !text-xl md:!text-5xl">
        {isEdit ? "Update Item" : "Add New Item"}
      </h2>
      <p className="text-center text-gray-500 mb-4">{service?.title}</p>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto space-y-3 md:space-y-5"
      >
        {/* images */}
        <div>
          <label className="input-label">
            Images <span className="text-gray-400 text-sm">(at least one)</span>
          </label>
          <input
            type="file"
            className="input"
            accept="image/*"
            multiple
            onChange={handleAddImages}
          />
          {images.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-3">
              {images.map((entry, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={entry.preview}
                    alt=""
                    className="w-full h-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                  >
                    <AiFillDelete className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Images are shown in an auto-scrolling swiper on the card and detail
            page, in the order added.
          </p>
        </div>

        {/* title */}
        <div>
          <label className="input-label">Title</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Level 60 Prime Account"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* stats */}
        <div>
          <label className="input-label">Stats</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statLabels.map((label, idx) => (
              <div key={idx}>
                <label className="block text-xs text-gray-500 mb-1 capitalize">
                  {label}
                </label>
                <input
                  type="number"
                  className="input"
                  placeholder="0"
                  value={stats[idx]}
                  onChange={(e) => handleStatChange(idx, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* short description */}
        <div>
          <label className="input-label">
            Short Description{" "}
            <span className="text-gray-400 text-sm">(optional — shown on the card)</span>
          </label>
          <textarea
            className="input w-full h-20 resize-y"
            placeholder="A one or two line summary shown on the product card..."
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
          />
        </div>

        {/* description */}
        <div className="rich-text-content">
          <label className="input-label">
            Description{" "}
            <span className="text-gray-400 text-sm">(optional — shown on the detail page)</span>
          </label>
          <ReactQuill theme="snow" value={description} onChange={setDescription} />
        </div>

        {/* video */}
        <div>
          <label className="input-label">
            YouTube Video URL{" "}
            <span className="text-gray-400 text-sm">(optional)</span>
          </label>
          <input
            type="text"
            className="input"
            placeholder="https://www.youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Embedded on the detail page below the stats. Leave empty for no video.
          </p>
        </div>

        {/* admin whatsapp contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="input-label">
              Admin WhatsApp Number{" "}
              <span className="text-gray-400 text-sm">(optional)</span>
            </label>
            <input
              type="text"
              className="input"
              placeholder="8801712345678"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Must include the country code and no leading &quot;+&quot; or spaces
              (e.g. <b>8801712345678</b> for Bangladesh). Leave empty to hide the
              WhatsApp button on this item.
            </p>
          </div>
          <div>
            <label className="input-label">
              WhatsApp Message{" "}
              <span className="text-gray-400 text-sm">(optional)</span>
            </label>
            <textarea
              className="input w-full h-20 resize-y"
              placeholder="Hello, I am interested in this ID..."
              value={whatsappText}
              onChange={(e) => setWhatsappText(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Pre-filled in the customer&apos;s WhatsApp chat. Mention the item so
              you know which one they mean.
            </p>
          </div>
        </div>

        {/* prices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="input-label">Original Price</label>
            <input
              type="number"
              className="input"
              placeholder="0"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="input-label">
              Offer Price{" "}
              <span className="text-gray-400 text-sm">(optional)</span>
            </label>
            <input
              type="number"
              className="input"
              placeholder="Leave empty for no discount"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              This is the price the customer pays. If left empty (or equal to the
              original price) no strikethrough is shown.
            </p>
          </div>
        </div>

        {/* swiper delay + coin + serial */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="input-label">Swiper Delay (ms)</label>
            <input
              type="number"
              className="input"
              value={swiperDelay}
              onChange={(e) => setSwiperDelay(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-scroll interval for this item&apos;s images.
            </p>
          </div>
          <div>
            <label className="input-label">Bonus Coin</label>
            <input
              type="number"
              className="input"
              value={coin}
              onChange={(e) => setCoin(e.target.value)}
            />
          </div>
          <div>
            <label className="input-label">Serial</label>
            <input
              type="number"
              className="input"
              placeholder="Auto"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Used for the default sort order. Leave blank to place this item at
              the end automatically.
            </p>
          </div>
        </div>

        {/* feedback / delivery message */}
        <div>
          <label className="input-label">Delivery Message</label>
          <textarea
            className="input w-full h-28 resize-y"
            placeholder="Shown to the buyer as the order feedback — put the account details here, or instructions to contact admin."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            The order is completed instantly on purchase and this text is attached
            to it as the feedback the buyer sees.
          </p>
        </div>

        {/* active toggle */}
        <div className="flex items-center gap-2.5">
          <label className="input-label !m-0">Active: </label>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="toggle"
          />
        </div>

        <button
          type="submit"
          className="block mx-auto button bg-gradient"
          disabled={loading}
        >
          {loading ? "Please Wait..." : isEdit ? "Update" : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default ServiceItemForm;
