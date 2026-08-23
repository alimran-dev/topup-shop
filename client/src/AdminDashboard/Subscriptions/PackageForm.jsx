import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import toast from "react-hot-toast";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const PackageForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [types, setTypes] = useState([]);
  const [typeId, setTypeId] = useState("");
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [durationUnit, setDurationUnit] = useState("months");
  const [price, setPrice] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load types for the select
  useEffect(() => {
    axiosPrivate
      .get("/subscription/admin/types")
      .then((res) => setTypes(res.data || []))
      .catch(() => toast.error("Failed to load types!"));
  }, [axiosPrivate]);

  // Prefill when editing
  useEffect(() => {
    if (!isEdit) return;
    axiosPrivate
      .get(`/subscription/admin/packages/get?id=${id}`)
      .then((res) => {
        const data = res.data || {};
        setTypeId(data.typeId || "");
        setName(data.name || "");
        setDuration(String(data.duration ?? ""));
        setDurationUnit(data.durationUnit || "months");
        setPrice(String(data.price ?? ""));
        setTermsAndConditions(data.termsAndConditions || "");
        setIsActive(data.isActive !== false);
      })
      .catch(() => toast.error("Failed to load package!"));
  }, [axiosPrivate, isEdit, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!typeId) {
      toast.error("Please select a subscription type!");
      setLoading(false);
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter a package name!");
      setLoading(false);
      return;
    }
    const durationNum = parseFloat(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      toast.error("Please enter a valid duration!");
      setLoading(false);
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Please enter a valid price!");
      setLoading(false);
      return;
    }
    if (!termsAndConditions.trim()) {
      toast.error("Please add terms and conditions!");
      setLoading(false);
      return;
    }

    const payload = {
      typeId,
      name: name.trim(),
      duration: durationNum,
      durationUnit,
      price: priceNum,
      termsAndConditions,
      isActive,
    };

    try {
      if (isEdit) {
        const { data } = await axiosPrivate.patch("/subscription/admin/packages", {
          ...payload,
          id,
        });
        if (data?.acknowledged) {
          toast.success("Package updated successfully!");
          navigate("/dashboard/subscriptions");
        } else {
          toast.error("Update failed!");
        }
      } else {
        const { data } = await axiosPrivate.post(
          "/subscription/admin/packages",
          payload
        );
        if (data?.insertedId) {
          toast.success("Package added successfully!");
          navigate("/dashboard/subscriptions");
        } else {
          toast.error("Something went wrong!");
        }
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Something went wrong! Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      <h2 className="title !text-xl md:!text-4xl">
        {isEdit ? "Update Package" : "Add New Package"}
      </h2>
      <form onSubmit={handleSubmit} className="mt-6">
        <label className="input-label">Subscription Type</label>
        <select
          className="input"
          value={typeId}
          onChange={(e) => setTypeId(e.target.value)}
        >
          <option value="">Choose a type</option>
          {types.map((type) => (
            <option key={type._id} value={type._id}>
              {type.name}
            </option>
          ))}
        </select>

        <label className="input-label mt-4">Package Name</label>
        <input
          type="text"
          className="input"
          placeholder="e.g. Monthly Reseller"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="input-label">Duration</label>
            <input
              type="number"
              min="1"
              step="1"
              className="input"
              placeholder="e.g. 1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <div>
            <label className="input-label">Duration Unit</label>
            <select
              className="input"
              value={durationUnit}
              onChange={(e) => setDurationUnit(e.target.value)}
            >
              <option value="months">Months</option>
              <option value="days">Days</option>
            </select>
          </div>
        </div>

        <label className="input-label mt-4">Price (৳)</label>
        <input
          type="number"
          min="0"
          step="any"
          className="input"
          placeholder="e.g. 1000"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <label className="input-label mt-4">Terms &amp; Conditions</label>
        <div className="mb-2 text-xs text-gray-500">
          Shown to the user before purchase; the exact agreed text is saved with
          the purchase history.
        </div>
        <ReactQuill
          theme="snow"
          value={termsAndConditions}
          onChange={setTermsAndConditions}
          placeholder="Write the terms and conditions..."
        />

        <label className="flex items-center gap-2 mt-5 cursor-pointer">
          <input
            type="checkbox"
            className="checkbox checkbox-sm checked:border-primary [--chkbg:rgb(var(--theme-primary))] [--chkfg:#fff]"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <span>Package is active (visible in catalog)</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="button bg-gradient-to-r from-primary to-secondary text-white mt-6 w-full"
        >
          {loading ? "Saving..." : isEdit ? "Update Package" : "Add Package"}
        </button>
      </form>
    </div>
  );
};

export default PackageForm;
