import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { FaPlus, FaRegEdit, FaUsers, FaHistory } from "react-icons/fa";
import { AiFillDelete } from "react-icons/ai";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const formatDuration = (pkg) => {
  const n = pkg.duration;
  const unit = pkg.durationUnit === "months" ? "Month" : "Day";
  return `${n} ${unit}${n === 1 ? "" : "s"}`;
};

const Subscriptions = () => {
  const [types, setTypes] = useState([]);
  const [packages, setPackages] = useState([]);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeColors, setNewTypeColors] = useState({
    primary: "#FA6023",
    secondary: "#E61C55",
  });
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  // inline row edits (serial + theme colors) — drafts stage values until the
  // per-row Save button commits both in one PATCH
  const [serialDrafts, setSerialDrafts] = useState({});
  const [colorDrafts, setColorDrafts] = useState({});
  const [savingId, setSavingId] = useState("");
  const axiosPrivate = useAxiosPrivate();

  const loadTypes = () =>
    axiosPrivate
      .get("/subscription/admin/types")
      .then((res) => setTypes(res.data || []));

  const loadPackages = () => {
    const params = new URLSearchParams();
    if (typeFilter) params.set("typeId", typeFilter);
    if (search) params.set("search", search);
    return axiosPrivate
      .get(`/subscription/admin/packages?${params}`)
      .then((res) => setPackages(res.data || []));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([loadTypes(), loadPackages()])
      .catch(() => toast.error("Failed to load data!"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reload packages when filters change
  useEffect(() => {
    loadPackages().catch(() => toast.error("Failed to load packages!"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, search]);

  // --- types --------------------------------------------------------------

  const handleAddType = (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) {
      toast.error("Please enter a type name!");
      return;
    }
    axiosPrivate
      .post("/subscription/admin/types", {
        name: newTypeName.trim(),
        // server expects primaryColor/secondaryColor (per-field hex)
        primaryColor: newTypeColors.primary,
        secondaryColor: newTypeColors.secondary,
      })
      .then((res) => {
        if (res.data?.insertedId) {
          toast.success("Type added successfully!");
          setNewTypeName("");
          setNewTypeColors({ primary: "#FA6023", secondary: "#E61C55" });
          loadTypes();
        } else {
          toast.error("Something went wrong!");
        }
      })
      .catch(() => toast.error("Failed to add type!"));
  };

  // Inline row editor: serial + theme-color inputs stage drafts; the row's
  // explicit Save button commits both in one PATCH (updateType $sets only
  // the provided fields). Drafts survive a failed save so the admin can fix
  // and retry.
  const hasDraft = (type) =>
    !!serialDrafts[type._id] || !!colorDrafts[type._id];

  const saveRow = (type) => {
    const serialDraft = serialDrafts[type._id];
    const colorDraft = colorDrafts[type._id];
    const body = { id: type._id };
    if (serialDraft !== undefined && serialDraft.trim()) {
      const serial = Number(serialDraft);
      if (!Number.isInteger(serial) || serial <= 0) {
        toast.error("Serial must be a positive whole number!");
        return;
      }
      if (serial !== type.serial) body.serial = serial;
    }
    const primaryColor = colorDraft?.primary ?? type.primaryColor ?? "#FA6023";
    const secondaryColor =
      colorDraft?.secondary ?? type.secondaryColor ?? "#E61C55";
    if (
      colorDraft &&
      (primaryColor !== (type.primaryColor ?? "#FA6023") ||
        secondaryColor !== (type.secondaryColor ?? "#E61C55"))
    ) {
      body.primaryColor = primaryColor;
      body.secondaryColor = secondaryColor;
    }
    if (Object.keys(body).length === 1) {
      toast.error("No changes to save!");
      return;
    }
    setSavingId(type._id);
    axiosPrivate
      .patch("/subscription/admin/types", body)
      .then((res) => {
        if (res.data?.acknowledged) {
          toast.success("Type updated!");
          setSerialDrafts((prev) => {
            const next = { ...prev };
            delete next[type._id];
            return next;
          });
          setColorDrafts((prev) => {
            const next = { ...prev };
            delete next[type._id];
            return next;
          });
          loadTypes(); // refetches so the serial-sorted order updates
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Failed to update type!");
      })
      .finally(() => setSavingId(""));
  };

  const serialInput = (type) => (
    <input
      type="number"
      min="1"
      step="1"
      className="w-20 border border-slate-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-primary disabled:opacity-60"
      value={serialDrafts[type._id] ?? type.serial}
      disabled={savingId === type._id}
      onChange={(e) =>
        setSerialDrafts((prev) => ({ ...prev, [type._id]: e.target.value }))
      }
      onKeyDown={(e) => {
        if (e.key === "Enter") saveRow(type);
      }}
    />
  );

  const colorInput = (type, key) => (
    <input
      type="color"
      className="w-9 h-7 rounded border border-slate-300 cursor-pointer disabled:opacity-60"
      value={
        colorDrafts[type._id]?.[key] ??
        type[key === "primary" ? "primaryColor" : "secondaryColor"] ??
        (key === "primary" ? "#FA6023" : "#E61C55")
      }
      disabled={savingId === type._id}
      onChange={(e) =>
        setColorDrafts((prev) => ({
          ...prev,
          [type._id]: { ...prev[type._id], [key]: e.target.value },
        }))
      }
    />
  );

  const saveButton = (type) => (
    <button
      title="Save serial & color changes"
      className="px-3 py-1 rounded text-xs font-semibold bg-gradient text-white disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      disabled={savingId === type._id || !hasDraft(type)}
      onClick={() => saveRow(type)}
    >
      {savingId === type._id ? "Saving..." : "Save"}
    </button>
  );

  const handleRenameType = (type) => {
    Swal.fire({
      title: "Rename Subscription Type",
      input: "text",
      inputValue: type.name,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Rename",
    }).then((result) => {
      if (!result.isConfirmed || !result.value?.trim()) return;
      axiosPrivate
        .patch("/subscription/admin/types", {
          id: type._id,
          name: result.value.trim(),
        })
        .then((res) => {
          if (res.data?.acknowledged) {
            toast.success("Type renamed!");
            loadTypes();
          }
        })
        .catch(() => toast.error("Failed to rename type!"));
    });
  };

  const handleToggleType = async (type) => {
    try {
      await axiosPrivate.patch("/subscription/admin/types", {
        id: type._id,
        isActive: type.isActive === false,
      });
      setTypes((prev) =>
        prev.map((t) =>
          t._id === type._id ? { ...t, isActive: t.isActive === false } : t
        )
      );
      toast.success("Updated!");
    } catch {
      toast.error("Failed to update!");
    }
  };

  const handleDeleteType = (type) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Type "${type.name}" will be deleted. Deleting is blocked while packages exist under it.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (!result.isConfirmed) return;
      axiosPrivate
        .delete(`/subscription/admin/types?id=${type._id}`)
        .then((res) => {
          if (res.data?.success) {
            toast.success("Deleted Successfully!");
            setTypes((prev) => prev.filter((t) => t._id !== type._id));
          } else {
            toast.error("Failed To Delete!");
          }
        })
        .catch((err) =>
          toast.error(err?.response?.data?.message || "Failed To Delete!")
        );
    });
  };

  // --- packages -----------------------------------------------------------

  const handleTogglePackage = async (pkg) => {
    try {
      await axiosPrivate.patch("/subscription/admin/packages", {
        id: pkg._id,
        isActive: pkg.isActive === false,
      });
      setPackages((prev) =>
        prev.map((p) =>
          p._id === pkg._id ? { ...p, isActive: p.isActive === false } : p
        )
      );
      toast.success("Updated!");
    } catch {
      toast.error("Failed to update!");
    }
  };

  const handleDeletePackage = (pkg) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Package "${pkg.name}" will be removed from the catalog. It is soft-deleted if already purchased (history is preserved).`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (!result.isConfirmed) return;
      axiosPrivate
        .delete(`/subscription/admin/packages?id=${pkg._id}`)
        .then((res) => {
          if (res.data?.success) {
            toast.success(
              res.data.softDeleted
                ? "Package deactivated (history preserved)!"
                : "Package deleted!"
            );
            loadPackages();
          } else {
            toast.error("Failed To Delete!");
          }
        })
        .catch((err) =>
          toast.error(err?.response?.data?.message || "Failed To Delete!")
        );
    });
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-5">
        <h2 className="title !text-xl md:!text-4xl">Subscriptions</h2>
        <div className="flex w-full md:w-auto gap-3">
          <Link
            to="/dashboard/subscriptions/subscribers"
            className="button bg-gradient inline-flex items-center gap-2 flex-1 md:flex-none justify-center"
          >
            <FaUsers /> Subscribers
          </Link>
          <Link
            to="/dashboard/subscriptions/history"
            className="button bg-gradient inline-flex items-center gap-2 flex-1 md:flex-none justify-center"
          >
            <FaHistory /> History
          </Link>
        </div>
      </div>

      {/* Types */}
      <div className="border border-slate-200 rounded-md shadow-sm p-5 mb-6">
        <h3 className="text-lg font-semibold mb-3">Subscription Types</h3>
        <form
          onSubmit={handleAddType}
          className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4 max-w-xl"
        >
          <input
            type="text"
            className="input sm:flex-1"
            placeholder="e.g. Reseller"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
          />
          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            Primary
            <input
              type="color"
              className="w-9 h-7 rounded border border-slate-300 cursor-pointer"
              value={newTypeColors.primary}
              onChange={(e) =>
                setNewTypeColors((prev) => ({
                  ...prev,
                  primary: e.target.value,
                }))
              }
            />
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            Secondary
            <input
              type="color"
              className="w-9 h-7 rounded border border-slate-300 cursor-pointer"
              value={newTypeColors.secondary}
              onChange={(e) =>
                setNewTypeColors((prev) => ({
                  ...prev,
                  secondary: e.target.value,
                }))
              }
            />
          </label>
          <button type="submit" className="button bg-gradient shrink-0 flex items-center gap-2">
            <FaPlus /> Add Type
          </button>
        </form>

        {types.length === 0 ? (
          <p className="py-4 text-center text-gray-400">
            No subscription types yet. Add your first type above.
          </p>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Serial</th>
                    <th className="py-2 pr-4">Colors</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {types.map((type) => (
                    <tr key={type._id} className="border-b border-slate-100">
                      <td className="py-2 pr-4">{type.name}</td>
                      <td className="py-2 pr-4">{serialInput(type)}</td>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-1.5">
                          {colorInput(type, "primary")}
                          {colorInput(type, "secondary")}
                        </div>
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={`badge ${
                            type.isActive === false
                              ? "badge-error"
                              : "badge-success"
                          }`}
                        >
                          {type.isActive === false ? "Inactive" : "Active"}
                        </span>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center gap-3">
                          {saveButton(type)}
                          <button
                            title="Rename"
                            onClick={() => handleRenameType(type)}
                            className="text-primary hover:opacity-70"
                          >
                            <FaRegEdit />
                          </button>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              className="toggle toggle-sm checked:bg-primary checked:border-primary checked:text-primary"
                              checked={type.isActive !== false}
                              onChange={() => handleToggleType(type)}
                            />
                          </label>
                          <button
                            title="Delete"
                            onClick={() => handleDeleteType(type)}
                            className="text-red-500 hover:opacity-70"
                          >
                            <AiFillDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* mobile cards */}
            <div className="md:hidden space-y-3">
              {types.map((type) => (
                <div
                  key={type._id}
                  className="p-3 border border-slate-200 shadow-md rounded-md space-y-2"
                >
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold">{type.name}</h3>
                    <span
                      className={`badge ${
                        type.isActive === false
                          ? "badge-error"
                          : "badge-success"
                      }`}
                    >
                      {type.isActive === false ? "Inactive" : "Active"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    Serial: {serialInput(type)}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    Colors: {colorInput(type, "primary")}
                    {colorInput(type, "secondary")}
                  </p>
                  <div className="flex items-center gap-4 pt-1">
                    {saveButton(type)}
                    <button
                      title="Rename"
                      onClick={() => handleRenameType(type)}
                      className="text-primary hover:opacity-70"
                    >
                      <FaRegEdit />
                    </button>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        className="toggle toggle-sm checked:bg-primary checked:border-primary checked:text-primary"
                        checked={type.isActive !== false}
                        onChange={() => handleToggleType(type)}
                      />
                    </label>
                    <button
                      title="Delete"
                      onClick={() => handleDeleteType(type)}
                      className="text-red-500 hover:opacity-70"
                    >
                      <AiFillDelete />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Packages */}
      <div className="border border-slate-200 rounded-md shadow-sm p-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4">
          <h3 className="text-lg font-semibold">Subscription Packages</h3>
          <Link
            to="/dashboard/subscriptions/packages/manage"
            className="button bg-gradient inline-flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <FaPlus /> Add Package
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <select
            className="input"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {types.map((type) => (
              <option key={type._id} value={type._id}>
                {type.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="input md:col-span-2"
            placeholder="Search package name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {packages.length === 0 ? (
          <p className="py-4 text-center text-gray-400">No packages found.</p>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Duration</th>
                    <th className="py-2 pr-4">Price (৳)</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg) => (
                    <tr key={pkg._id} className="border-b border-slate-100">
                      <td className="py-2 pr-4">{pkg.name}</td>
                      <td className="py-2 pr-4">{pkg.typeName}</td>
                      <td className="py-2 pr-4">{formatDuration(pkg)}</td>
                      <td className="py-2 pr-4">{pkg.price}</td>
                      <td className="py-2 pr-4">
                        <span
                          className={`badge ${
                            pkg.isActive === false
                              ? "badge-error"
                              : "badge-success"
                          }`}
                        >
                          {pkg.isActive === false ? "Inactive" : "Active"}
                        </span>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center gap-3">
                          <Link
                            title="Edit"
                            to={`/dashboard/subscriptions/packages/manage/${pkg._id}`}
                            className="text-primary hover:opacity-70"
                          >
                            <FaRegEdit />
                          </Link>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              className="toggle toggle-sm checked:bg-primary checked:border-primary checked:text-primary"
                              checked={pkg.isActive !== false}
                              onChange={() => handleTogglePackage(pkg)}
                            />
                          </label>
                          <button
                            title="Delete"
                            onClick={() => handleDeletePackage(pkg)}
                            className="text-red-500 hover:opacity-70"
                          >
                            <AiFillDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* mobile cards */}
            <div className="md:hidden space-y-3">
              {packages.map((pkg) => (
                <div
                  key={pkg._id}
                  className="p-3 border border-slate-200 shadow-md rounded-md space-y-2"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-bold">{pkg.name}</h3>
                      <p className="text-sm text-gray-500">{pkg.typeName}</p>
                    </div>
                    <span
                      className={`badge ${
                        pkg.isActive === false
                          ? "badge-error"
                          : "badge-success"
                      }`}
                    >
                      {pkg.isActive === false ? "Inactive" : "Active"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDuration(pkg)} · ৳{pkg.price}
                  </p>
                  <div className="flex items-center gap-4 pt-1">
                    <Link
                      title="Edit"
                      to={`/dashboard/subscriptions/packages/manage/${pkg._id}`}
                      className="text-primary hover:opacity-70"
                    >
                      <FaRegEdit />
                    </Link>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        className="toggle toggle-sm checked:bg-primary checked:border-primary checked:text-primary"
                        checked={pkg.isActive !== false}
                        onChange={() => handleTogglePackage(pkg)}
                      />
                    </label>
                    <button
                      title="Delete"
                      onClick={() => handleDeletePackage(pkg)}
                      className="text-red-500 hover:opacity-70"
                    >
                      <AiFillDelete />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
