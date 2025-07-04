import { useEffect, useState } from "react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { useNavigate, useParams } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Swal from "sweetalert2";
import Loader from "../../components/Loader";

const UpdateSpOptionItem = () => {
  const [option, setOption] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [inStock2, setInStock2] = useState(true);
  const axiosPublic = useAxiosPublic();
  const axiosPrivate = useAxiosPrivate();
  const { id } = useParams();
  const navigate = useNavigate();
  const { name, price, description, server } = option || {};
  useEffect(() => {
    axiosPublic.get(`/special/offer/${id}`).then((res) => {
      setOption(res.data);
      setInStock2(res.data?.inStock);
      setIsLoading(false);
    });
  }, []);
  const handleUpdate = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const form = e.target;
    const name = form.name.value;
    const price = form.price.value;
    const description = form.description.value;
    const option = { id, name, price, description };
    axiosPrivate.patch("/special/offer/update", option).then((res) => {
      setIsLoading(false);
      if (res.data?.modifiedCount > 0) {
        Swal.fire({
          title: "Option Updated",
          timer: 1500,
          position: "top",
          showConfirmButton: false,
          toast: true,
          icon: "success",
        });
      }
    });
  };
  const handleStock = () => {
    Swal.fire({
      title: `${inStock2 ? "Stock Out?" : "In Stock?"}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E61C55",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        axiosPrivate
          .patch("/special/offer/stock", { id, inStock: !inStock2 })
          .then((res) => {
            if (res.data?.modifiedCount > 0) {
              setIsLoading(false);
              setInStock2(!inStock2);
              Swal.fire({
                title: "Stock updated",
                position: "top",
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                icon: "success",
              });
            }
          });
      }
    });
  };
  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E61C55",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPrivate.delete(`/special/offer/delete?id=${id}`).then((res) => {
          // console.log(res.data);
          if (res.data?.deletedCount > 0) {
            navigate(-1);
            Swal.fire({
              title: "Deleted!",
              text: "This option has been deleted.",
              icon: "success",
            });
          }
        });
      }
    });
  };
  return (
    <div>
      <Loader isLoading={isLoading} />
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5 py-4">
        Update or Delete [{server}]
      </h1>
      <form onSubmit={handleUpdate} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5 md:w-2/3 mx-auto items-center justify-center">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-xl font-medium text-gray-700"
            >
              Option Name
            </label>
            <input
              type="text"
              name="name"
              defaultValue={name}
              required
              className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
              placeholder="Example: 20 UC"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="price"
              className="block text-xl font-medium text-gray-700"
            >
              Option Price
            </label>
            <input
              type="text"
              name="price"
              defaultValue={price}
              required
              className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
              placeholder="Example: 50"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-xl font-medium text-gray-700"
            >
              Description
            </label>
            <input
              type="text"
              name="description"
              defaultValue={description}
              required
              className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
              placeholder="Write description here.."
            />
          </div>
        </div>
        <div>
          <p className="text-center font-medium text-red-500 pb-2">{error}</p>
          <div className="flex flex-wrap items-center justify-center gap-5 w-fit mt-3 mx-auto">
            <button
              onClick={handleDelete}
              className="text-lg font-semibold bg-red-600 py-1.5 px-3 text-white rounded"
            >
              Delete
            </button>
            {inStock2 ? (
              <button
                onClick={handleStock}
                className="text-lg font-semibold bg-red-600 py-1.5 px-3 text-white rounded"
              >
                Stock Out
              </button>
            ) : (
              <button
                onClick={handleStock}
                className="text-lg font-semibold bg-green-600 py-1.5 px-3 text-white rounded"
              >
                In Stock
              </button>
            )}
            <button
              type="submit"
              className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 text-lg text-white font-semibold rounded"
            >
              Update
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UpdateSpOptionItem;
