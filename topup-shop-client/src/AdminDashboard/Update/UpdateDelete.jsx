import { useEffect, useRef, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/Loader";
import Swal from "sweetalert2";

const UpdateDelete = () => {
  const [option, setOption] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [stock, setStock] = useState(null);
  const axiosPrivate = useAxiosPrivate();
  const { category, id } = useParams();
  const navigate = useNavigate();
  const nameRef = useRef(null);
  const priceRef = useRef(null);
  const handleUpdate = () => {
    if (nameRef.current && priceRef.current) {
      setIsLoading(true);
      const name = nameRef.current?.value;
      const price = priceRef.current?.value;
      const updatedOption = { id, category, name, price };
      // console.log(updatedOption);
      axiosPrivate.patch("/admin/update/option", updatedOption).then((res) => {
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
    }
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
        axiosPrivate
          .delete(`/admin/delete/option?id=${id}&category=${category}`)
          .then((res) => {
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
  const handleStock = () => {
    Swal.fire({
      title: `${stock?"Stock Out?":"In Stock?"}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E61C55",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        axiosPrivate.patch("/admin/option/stock",{id,category,stock: !stock})
          .then(res => {
            if (res.data?.modifiedCount > 0) {
              setStock(!stock);
              setIsLoading(false);
              Swal.fire({
                title: "Stock updated",
                position: "top",
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                icon: "success",
            })
          }
        })
      }
    });
  }
  useEffect(() => {
    axiosPrivate.get(`/option?category=${category}&id=${id}`).then((res) => {
      setIsLoading(false);
      setOption(res.data);
      setStock(res.data?.stock);
    });
  }, [axiosPrivate, category, id]);
  // console.log(stock);
  return (
    <div className="-mt-5">
      <Loader isLoading={isLoading} />
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5 py-4">
        Update or Delete [{category}]
      </h1>
      <div className="flex flex-col md:flex-row w-2/3 mx-auto justify-center items-center gap-5 mt-5">
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
            ref={nameRef}
            className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
            placeholder="Example: 20 UC"
            defaultValue={option?.name}
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
            ref={priceRef}
            className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
            placeholder="Example: 50"
            defaultValue={option?.price}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-5 w-fit mt-3 mx-auto">
        <button
          onClick={handleDelete}
          className="text-lg font-semibold bg-red-600 py-1.5 px-3 text-white rounded"
        >
          Delete
        </button>
        {category === "idcode" || category === "weekly-monthly" ? (
          <>{stock ? <button onClick={handleStock} className="text-lg font-semibold bg-red-600 py-1.5 px-3 text-white rounded">Stock Out</button> : <button onClick={handleStock} className="text-lg font-semibold bg-green-600 py-1.5 px-3 text-white rounded">In Stock</button>}</>
        ) : (
          <></>
        )}
        <button
          onClick={handleUpdate}
          className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 text-lg text-white font-semibold rounded"
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default UpdateDelete;
