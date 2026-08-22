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
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
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
      .post("/subscription/admin/types", { name: newTypeName.trim() })
      .then((res) => {
        if (res.data?.insertedId) {
          toast.success("Type added successfully!");
          setNewTypeName("");
          loadTypes();
        } else {
          toast.error("Something went wrong!");
        }
      })
      .catch(() => toast.error("Failed to add type!"));
  };

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
        <div className="flex gap-3">
          <Link
            to="/dashboard/subscriptions/subscribers"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white font-semibold"
          >
            <FaUsers /> Subscribers
          </Link>
          <Link
            to="/dashboard/subscriptions/history"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-white font-semibold"
          >
            <FaHistory /> History
          </Link>
        </div>
      </div>

      {/* Types */}
      <div className="border border-slate-200 rounded-md shadow-sm p-5 mb-6">
        <h3 className="text-lg font-semibold mb-3">Subscription Types</h3>
        <form onSubmit={handleAddType} className="flex gap-3 mb-4 max-w-md">
          <input
            type="text"
            className="input"
            placeholder="e.g. Reseller"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
          />
          <button type="submit" className="button bg-primary text-white">
            <FaPlus /> Add Type
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Serial</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {types.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-400">
                    No subscription types yet. Add your first type above.
                  </td>
                </tr>
              )}
              {types.map((type) => (
                <tr key={type._id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{type.name}</td>
                  <td className="py-2 pr-4">{type.serial}</td>
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
                          className="toggle toggle-sm toggle-primary"
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
      </div>

      {/* Packages */}
      <div className="border border-slate-200 rounded-md shadow-sm p-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4">
          <h3 className="text-lg font-semibold">Subscription Packages</h3>
          <Link
            to="/dashboard/subscriptions/packages/manage"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white font-semibold"
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

        <div className="overflow-x-auto">
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
              {packages.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-400">
                    No packages found.
                  </td>
                </tr>
              )}
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
                          className="toggle toggle-sm toggle-primary"
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
      </div>
    </div>
  );
};

export default Subscriptions;
