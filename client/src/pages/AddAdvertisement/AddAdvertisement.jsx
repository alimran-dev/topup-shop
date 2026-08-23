import { useEffect, useState } from "react";
import { uploadImage } from "../../utils/uploadImage";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";

const NORMAL_ROLE = "normal";

const AddAdvertisement = () => {
  const [ads, setAds] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [path, setPath] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  // load all ads + subscription types (roles)
  useEffect(() => {
    setLoading(true);
    Promise.all([
      axiosPrivate.get("/ads/admin"),
      axiosPrivate.get("/subscription/admin/types"),
    ])
      .then(([adsRes, typesRes]) => {
        setAds(adsRes.data || []);
        setTypes(typesRes.data || []);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to load advertisements");
      })
      .finally(() => setLoading(false));
  }, [axiosPrivate]);

  // page apear from top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // roles already covered by ANOTHER ad — this ad's own roles stay selectable
  const takenRoles = new Set(
    ads.filter((ad) => ad._id !== editingId).flatMap((ad) => ad.roles ?? [])
  );

  const toggleRole = (role) =>
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );

  const resetForm = () => {
    setImageUrl("");
    setPath("");
    setSelectedRoles([]);
    setEditingId(null);
  };

  const roleLabel = (role) => {
    if (role === NORMAL_ROLE) return "Normal User";
    return types.find((t) => t._id === role)?.name || role;
  };

  // a type was deleted after this ad was created — still shown so the admin
  // knows why the role is unresolvable
  const roleIsMissing = (role) =>
    role !== NORMAL_ROLE && !types.some((t) => t._id === role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await axiosPrivate.patch("/ads/update", {
          id: editingId,
          imageUrl,
          path,
          roles: selectedRoles,
        });
        toast.success("Advertisement updated!");
      } else {
        await axiosPrivate.post("/ads/post", {
          imageUrl,
          path,
          roles: selectedRoles,
        });
        toast.success("Advertisement added!");
      }
      resetForm();
      const { data } = await axiosPrivate.get("/ads/admin");
      setAds(data || []);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to save advertisement"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (ad) => {
    setEditingId(ad._id);
    setImageUrl(ad.imageUrl || "");
    setPath(ad.path || "");
    setSelectedRoles(ad.roles ?? []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Users of this ad's roles will stop seeing it.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPrivate
          .delete(`/ads/delete?id=${id}`)
          .then((res) => {
            if (res.data.acknowledged) {
              toast.success("Advertisement deleted!");
              if (editingId === id) resetForm();
              setAds((prev) => prev.filter((ad) => ad._id !== id));
            } else {
              toast.error("Failed to delete!");
            }
          })
          .catch((err) => {
            console.log(err);
            toast.error("Failed to delete!");
          });
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="bg-gradient-to-r from-primary to-secondary w-fit text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5 py-3">
        Add Advertisement
      </h1>
      <p className="text-xs text-gray-500 max-w-2xl mx-auto text-center mb-5">
        One ad per role. Each ad shows to the roles you select — a user with an
        active subscription sees the ad of their highest-priority type, everyone
        else sees the Normal User ad. Roles with no ad get no popup at all.
      </p>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto border-2 border-primary rounded-lg p-4 md:p-6 space-y-4 bg-white shadow-sm"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Image
            </label>
            {/* not `required`: the submit button already enforces imageUrl for
                adds, and `required` on a file input would block editing an ad
                without re-uploading its existing image */}
            <input
              type="file"
              className="block w-full py-1.5 px-3 font-medium text-sm border-2 border-gray-600 rounded-md"
              onChange={async (e) => {
                setUploading(true);
                try {
                  const url = await uploadImage(e.target.files[0]);
                  if (url) setImageUrl(url);
                } catch (error) {
                  toast.error("Image upload failed");
                } finally {
                  setUploading(false);
                }
              }}
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="ad preview"
                className="w-full max-h-40 object-contain border border-slate-300 rounded"
              />
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Redirect Path
            </label>
            <input
              type="text"
              required
              className="block w-full py-1.5 px-3 font-medium text-sm border-2 border-gray-600 rounded-md"
              placeholder="Enter redirect path"
              value={path}
              onChange={(e) => setPath(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Show this ad to
          </label>
          <div className="flex flex-wrap gap-3">
            <label
              className={`flex items-center gap-1.5 text-sm cursor-pointer ${
                takenRoles.has(NORMAL_ROLE) ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <input
                type="checkbox"
                value={NORMAL_ROLE}
                checked={selectedRoles.includes(NORMAL_ROLE)}
                disabled={takenRoles.has(NORMAL_ROLE)}
                onChange={() => toggleRole(NORMAL_ROLE)}
                className="checkbox checkbox-sm checkbox-primary"
              />
              Normal User
              {takenRoles.has(NORMAL_ROLE) && (
                <span className="text-[10px] text-red-500">(taken)</span>
              )}
            </label>
            {types.map((type) => (
              <label
                key={type._id}
                className={`flex items-center gap-1.5 text-sm cursor-pointer ${
                  takenRoles.has(type._id) ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <input
                  type="checkbox"
                  value={type._id}
                  checked={selectedRoles.includes(type._id)}
                  disabled={takenRoles.has(type._id)}
                  onChange={() => toggleRole(type._id)}
                  className="checkbox checkbox-sm checkbox-primary"
                />
                {type.name}
                {takenRoles.has(type._id) && (
                  <span className="text-[10px] text-red-500">(taken)</span>
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 justify-center">
          <button
            type="submit"
            disabled={
              uploading || saving || !imageUrl || !path || selectedRoles.length === 0
            }
            className="bg-gradient-to-r from-primary to-secondary py-1.5 px-5 text-sm text-white font-semibold rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading
              ? "Uploading..."
              : saving
              ? "Saving..."
              : editingId
              ? "Update Advertisement"
              : "Add Advertisement"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="py-1.5 px-5 text-sm font-semibold rounded border border-gray-400 text-gray-600"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <h2 className="title mt-8">Advertisements</h2>
      {loading ? (
        <div className="font-bold text-center py-10">Loading...</div>
      ) : ads?.length === 0 ? (
        <div className="font-bold text-center text-red-600">No ads found!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
          {ads.map((ad) => (
            <div
              key={ad._id}
              className="bg-slate-50 border border-slate-400 p-4 flex flex-col justify-between"
            >
              <div className="w-full h-[150px] md:h-[220px] overflow-hidden">
                <img
                  src={ad.imageUrl}
                  className="w-full h-full object-contain"
                  alt="advertisement"
                />
              </div>
              <div className="pt-3 space-y-2">
                <div>
                  <span className="font-bold">Redirect: </span>
                  <Link
                    to={ad.path || "#"}
                    target="_blank"
                    className="text-blue-700 text-sm break-all"
                  >
                    {ad.path || "(none)"}
                  </Link>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(ad.roles ?? []).length === 0 ? (
                    <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-300 rounded-full px-2 py-0.5">
                      No roles — never shown to users
                    </span>
                  ) : (
                    (ad.roles ?? []).map((role) => (
                      <span
                        key={role}
                        className={`text-[10px] font-semibold rounded-full px-2 py-0.5 border ${
                          roleIsMissing(role)
                            ? "bg-red-100 text-red-700 border-red-300"
                            : "bg-white text-primary border-primary/30"
                        }`}
                      >
                        {roleLabel(role)}
                        {roleIsMissing(role) && " (missing type)"}
                      </span>
                    ))
                  )}
                </div>
                <div className="flex justify-end items-center text-2xl gap-5">
                  <button
                    onClick={() => handleEdit(ad)}
                    className="text-green-700"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(ad._id)}
                    className="text-red-600"
                    title="Delete"
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddAdvertisement;
