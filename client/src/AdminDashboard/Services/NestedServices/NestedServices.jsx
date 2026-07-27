import { Link, useParams } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import toast from "react-hot-toast";
import { AiFillDelete } from "react-icons/ai";
import { FaRegEdit } from "react-icons/fa";
import { TbArrowsSplit2 } from "react-icons/tb";
import { IoArrowBack } from "react-icons/io5";
import Swal from "sweetalert2";

const NestedServices = () => {
  const { parentId } = useParams();
  const [parentService, setParentService] = useState(null);
  const [children, setChildren] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();
  const axiosPublic = useAxiosPublic();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch parent service
        const parentRes = await axiosPrivate.get(
          `/services/get?id=${parentId}`
        );
        setParentService(parentRes.data);

        // Fetch children
        const childrenRes = await axiosPublic.get(
          `/services/children?parentId=${parentId}`
        );
        setChildren(childrenRes.data);

        // Fetch categories for display
        const catRes = await axiosPublic.get("/category");
        setCategories(catRes.data);
      } catch (err) {
        console.error("Failed to load data:", err);
        toast.error("Failed to load data!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [axiosPrivate, axiosPublic, parentId]);

  const getCategoryTitle = (categoryId) => {
    const cat = categories.find((c) => c._id === categoryId);
    return cat ? cat.title : "Unknown";
  };

  const handleDeleteService = async (id, childCount) => {
    const warningText =
      childCount > 0
        ? `This sub-service has ${childCount} nested sub-service(s). Deleting it will also delete ALL nested sub-services!`
        : "You won't be able to revert this!";

    Swal.fire({
      title: "Are you sure?",
      text: warningText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPrivate.delete(`/services/delete?id=${id}`).then((res) => {
          if (res.data.acknowledged) {
            toast.success(
              `Deleted Successfully! ${res.data.deletedDescendants || 0} descendant(s) also removed.`
            );
            setChildren((prev) => prev.filter((child) => child._id !== id));
          } else {
            toast.error("Failed To Delete!");
          }
        }).catch((err) => {
          console.log(err);
          toast.error("Failed To Delete!");
        });
      }
    });
  };

  if (loading) {
    return <div className="font-bold text-center py-10">Loading...</div>;
  }

  if (!parentService) {
    return (
      <div className="font-bold text-center py-10 text-red-600">
        Service not found!
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center md:gap-4 pb-5">
        <div>
          <Link
            to="/dashboard/services"
            className="text-blue-600 hover:underline flex items-center gap-1 mb-2"
          >
            <IoArrowBack /> Back to Services
          </Link>
          <h2 className="title !mx-0">
            Nested Sub-Services of &apos;{parentService?.title}&apos;
          </h2>
          <p className="text-sm text-gray-500">
            Category: {getCategoryTitle(parentService?.categoryId)}
          </p>
        </div>
        <Link
          to={`/dashboard/addSubCategory?parentServiceId=${parentId}`}
          className="button flex items-center gap-1 md:text-xl bg-gradient"
        >
          <FaPlus />
          Add Nested Sub-Service
        </Link>
      </div>

      {/* Children Grid */}
      {children.length === 0 ? (
        <div className="font-bold text-center text-gray-500 py-10">
          No nested sub-services found.
          <br />
          <Link
            to={`/dashboard/addSubCategory?parentServiceId=${parentId}`}
            className="text-blue-600 underline mt-2 inline-block"
          >
            Add the first one
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 items-center gap-8 py-10">
          {children.map((child, idx) => (
            <div
              key={idx}
              className="border border-slate-400 rounded-md shadow-xl relative"
            >
              {/* Nested child count badge */}
              {child?.childCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-10">
                  {child.childCount}
                </div>
              )}
              <div className="w-full h-fit">
                <img
                  src={child?.image}
                  className="w-full h-28 md:h-36 object-fill"
                  alt={child?.title}
                />
              </div>
              <h3 className="font-bold px-4 pt-4">{child?.title}</h3>
              <div className="p-3 text-2xl flex items-center gap-3 flex-wrap">
                <Link
                  to={`/dashboard/updateSubCategory/${child?._id}`}
                  className="text-blue-700"
                >
                  <FaRegEdit />
                </Link>
                <button
                  onClick={() =>
                    handleDeleteService(child?._id, child?.childCount || 0)
                  }
                  className="text-red-600 text-3xl"
                >
                  <AiFillDelete />
                </button>
                <span className="text-sm">#{child?.serial}</span>
                {child?.childCount > 0 && (
                  <Link
                    to={`/dashboard/nested-services/${child?._id}`}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                  >
                    <TbArrowsSplit2 className="inline mr-1" />
                    Manage Children
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NestedServices;