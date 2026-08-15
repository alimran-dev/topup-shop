import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaPlus, FaRegEdit } from "react-icons/fa";
import { AiFillDelete } from "react-icons/ai";
import { TbCurrencyTaka } from "react-icons/tb";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const ServiceItems = () => {
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const axiosPrivate = useAxiosPrivate();

  // Search by unique item number (also matches the title, so a partial number
  // or a remembered name both work)
  const query = search.trim().replace(/^#/, "").toLowerCase();
  const visibleItems = query
    ? items.filter(
        (i) =>
          String(i.itemNumber || "").includes(query) ||
          (i.title || "").toLowerCase().includes(query)
      )
    : items;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [serviceRes, itemsRes] = await Promise.all([
          axiosPrivate.get(`/services/get?id=${serviceId}`),
          axiosPrivate.get(`/serviceItems/admin/all?serviceId=${serviceId}`),
        ]);
        setService(serviceRes.data);
        setItems(itemsRes.data || []);
      } catch (err) {
        console.error("Failed to load items:", err);
        toast.error("Failed to load data!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [axiosPrivate, serviceId]);

  const handleToggleActive = async (item) => {
    try {
      await axiosPrivate.patch("/serviceItems/toggleActive", {
        id: item._id,
        isActive: item.isActive === false,
      });
      setItems((prev) =>
        prev.map((i) =>
          i._id === item._id ? { ...i, isActive: i.isActive === false } : i
        )
      );
      toast.success("Updated!");
    } catch {
      toast.error("Failed to update!");
    }
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: "Are you sure?",
      text: `"${item.title}" will be permanently deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (!result.isConfirmed) return;
      axiosPrivate
        .delete(`/serviceItems/delete?id=${item._id}`)
        .then((res) => {
          if (res.data?.deletedCount) {
            toast.success("Deleted Successfully!");
            setItems((prev) => prev.filter((i) => i._id !== item._id));
          } else {
            toast.error("Failed To Delete!");
          }
        })
        .catch(() => toast.error("Failed To Delete!"));
    });
  };

  const statLabels = service?.statLabels || [];

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center md:gap-4 pb-5">
        <div>
          <h2 className="title !mx-0">Manage Items</h2>
          <p className="text-gray-500">{service?.title}</p>
        </div>
        <Link
          to={`/dashboard/services/${serviceId}/items/manage`}
          className="button flex items-center gap-1 md:text-xl bg-gradient"
        >
          <FaPlus />
          Add New Item
        </Link>
      </div>

      <Link
        to="/dashboard/services"
        className="text-blue-600 hover:underline text-sm"
      >
        ← Back to Services
      </Link>

      {service && service.serviceType !== "itemListing" && (
        <div className="text-center text-amber-600 font-semibold py-4">
          ⚠ This service is not configured as an Item Listing type. Change its
          Service Type first, otherwise these items will not be shown to users.
        </div>
      )}

      {/* search by unique item number */}
      {items.length > 0 && (
        <div className="max-w-md mx-auto mt-5">
          <label className="input-label">Search Item</label>
          <input
            type="text"
            className="input"
            placeholder="Item number (e.g. 1001) or title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {query && (
            <p className="text-xs text-gray-500 mt-1">
              {visibleItems.length} of {items.length} item(s) matched
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="font-bold text-center py-10">Loading...</div>
      ) : items.length === 0 ? (
        <div className="font-bold text-center text-red-600 py-10">
          No items added yet!
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="font-bold text-center text-red-600 py-10">
          No item matches “{search}”
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 py-8">
          {visibleItems.map((item) => (
            <div
              key={item._id}
              className="border border-slate-400 rounded-md shadow-xl overflow-hidden relative"
            >
              {/* status badge */}
              <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
                {item.isSold && (
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    SOLD
                  </span>
                )}
                {item.isActive === false && (
                  <span className="bg-gray-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    HIDDEN
                  </span>
                )}
              </div>

              <div className="relative isolate">
                <img
                  src={item.images?.[0]}
                  alt=""
                  className="w-full h-32 object-cover"
                />
                {item.itemNumber && (
                  <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                    #{item.itemNumber}
                  </span>
                )}
              </div>

              <div className="p-3 space-y-2">
                <h3 className="font-bold text-sm line-clamp-2">{item.title}</h3>

                <div className="grid grid-cols-4 gap-1 border-y py-1">
                  {statLabels.map((label, idx) => (
                    <div key={idx} className="text-center">
                      <p className="text-[9px] text-gray-500 truncate">
                        {label}
                      </p>
                      <p className="text-xs font-bold">
                        {item.stats?.[idx] ?? 0}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  {item.offerPrice < item.originalPrice && (
                    <span className="flex items-center text-gray-400 line-through">
                      <TbCurrencyTaka />
                      {item.originalPrice}
                    </span>
                  )}
                  <span className="flex items-center font-bold">
                    <TbCurrencyTaka />
                    {item.offerPrice}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    #{item.serial}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-2xl pt-1">
                  <Link
                    to={`/dashboard/services/${serviceId}/items/manage/${item._id}`}
                    className="text-blue-700"
                  >
                    <FaRegEdit />
                  </Link>
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-red-600 text-3xl"
                  >
                    <AiFillDelete />
                  </button>
                  <button
                    onClick={() => handleToggleActive(item)}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 ml-auto"
                  >
                    {item.isActive === false ? "Show" : "Hide"}
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

export default ServiceItems;
