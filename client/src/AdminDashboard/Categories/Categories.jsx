import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { FaRegEdit } from "react-icons/fa";
import { AiFillDelete } from "react-icons/ai";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSerial, setEditSerial] = useState(0);
  const [editIsActive, setEditIsActive] = useState(true);
  const [updating, setUpdating] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  // Load categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await axiosPrivate.get("/category");
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Page appear from top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Add category
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCategoryTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    setAdding(true);
    try {
      const { data } = await axiosPrivate.post("/category", {
        title: newCategoryTitle.trim(),
      });
      if (data?.insertedId) {
        toast.success("Category added!");
        setNewCategoryTitle("");
        fetchCategories();
      } else {
        toast.error("Failed to add category");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add category");
    } finally {
      setAdding(false);
    }
  };

  // Start edit
  const handleStartEdit = (category) => {
    setEditId(category._id);
    setEditTitle(category.title);
    setEditSerial(category.serial || 0);
    setEditIsActive(category.isActive !== false);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditId(null);
    setEditTitle("");
    setEditSerial(0);
    setEditIsActive(true);
  };

  // Update category
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    setUpdating(true);
    try {
      const { data } = await axiosPrivate.patch("/category", {
        id: editId,
        title: editTitle.trim(),
        serial: editSerial,
        isActive: editIsActive,
      });
      if (data?.acknowledged) {
        toast.success("Category updated!");
        setEditId(null);
        setEditTitle("");
        fetchCategories();
      } else {
        toast.error("Failed to update category");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update category");
    } finally {
      setUpdating(false);
    }
  };

  // Delete category
  const handleDelete = (category) => {
    Swal.fire({
      title: "Delete Category?",
      text: `This will permanently delete "${category.title}" and ALL its subcategories. This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { data } = await axiosPrivate.delete(
            `/category?id=${category._id}`
          );
          if (data?.success) {
            toast.success(
              `Deleted category and ${data.subcategoriesDeleted} subcategories`
            );
            fetchCategories();
          } else {
            toast.error("Failed to delete category");
          }
        } catch (err) {
          console.error(err);
          toast.error("Failed to delete category");
        }
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h2 className="title !mx-0">Manage Categories</h2>

      {/* Add new category form */}
      <form
        onSubmit={handleAdd}
        className="flex items-center gap-3 my-6"
      >
        <input
          type="text"
          value={newCategoryTitle}
          onChange={(e) => setNewCategoryTitle(e.target.value)}
          placeholder="New category name"
          className="input flex-1"
          required
        />
        <button
          type="submit"
          className="button bg-gradient whitespace-nowrap"
          disabled={adding}
        >
          {adding ? "Adding..." : "Add Category"}
        </button>
      </form>

      {/* Categories list */}
      {loading ? (
        <div className="font-bold text-center py-10">Loading...</div>
      ) : categories.length === 0 ? (
        <div className="font-bold text-center py-10 text-gray-500">
          No categories found. Add one above.
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category._id}
              className="flex items-center gap-3 border border-gray-300 rounded-md p-4"
            >
              {editId === category._id ? (
                <form
                  onSubmit={handleUpdate}
                  className="flex flex-col items-start md:items-center gap-3 flex-1"
                >
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="input flex-1"
                    placeholder="Title"
                    required
                  />
                  <div className="flex flex-col md:flex-row w-full gap-5">
                    <input
                      type="number"
                      value={editSerial}
                      onChange={(e) => setEditSerial(parseInt(e.target.value) || 0)}
                      className="input w-20"
                      placeholder="Serial"
                      min="0"
                    />
                    <label className="flex items-center gap-1.5 text-sm whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={editIsActive}
                        onChange={(e) => setEditIsActive(e.target.checked)}
                        className="toggle toggle-sm"
                      />
                      Active
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="button bg-gradient text-sm"
                        disabled={updating}
                      >
                        {updating ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="button bg-gray-400 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <>
                  <span className="flex-1 font-semibold md:text-lg">
                    {category.title}
                  </span>
                  <span className="text-sm text-gray-500">
                    #{category.serial}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      category.isActive !== false
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {category.isActive !== false ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => handleStartEdit(category)}
                    className="text-blue-600 text-xl"
                  >
                    <FaRegEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="text-red-600 text-2xl"
                  >
                    <AiFillDelete />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;