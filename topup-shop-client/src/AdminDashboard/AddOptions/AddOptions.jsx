import { useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Swal from "sweetalert2";

const AddOptions = () => {
  const [error, setError] = useState("");
  const axiosPrivate = useAxiosPrivate();
  const handleAdd = (e) => {
    e.preventDefault();
    setError("");
    const form = e.target;
    const name = form.name.value;
    const price = parseInt(form.price.value) || 0;
    const uc = parseInt(form.uc.value) || 0;
    const category = form.category.value;
    const option = { name, price, category, uc };
    // console.log(option);
    axiosPrivate.post(`/addOption/${category}`, option).then((res) => {
      if (res.data.insertedId) {
        Swal.fire({
          position: "top",
          icon: "success",
          title: `${category} option added.`,
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
        form.reset();
      } else {
        setError(res.data.message);
      }
    });
  };
  return (
    <div className="-mt-5 space-y-5">
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5 py-3">
        Add Options
      </h1>
      <form onSubmit={handleAdd} className="space-y-5">
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
              required
              className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
              placeholder="Example: 50"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="uc"
              className="block text-xl font-medium text-gray-700"
            >
              UC
            </label>
            <input
              type="text"
              name="uc"
              required
              className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
              placeholder="UC"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="category"
              className="block text-xl font-medium text-gray-700"
            >
              Choose Category
            </label>
            <select
              name="category"
              id=""
              className="py-1.5 px-3 w-full border-2 border-gray-600 rounded-md block font-medium"
            >
              <option
                value="unipin"
                className="bg-white hover:bg-red-500 focus:bg-red-500"
              >
                Unipin
              </option>
              <option
                value="idcode"
                className="bg-white hover:bg-red-500 focus:bg-red-500"
              >
                IdCode
              </option>
              <option
                value="weekly"
                className="bg-white hover:bg-red-500 focus:bg-red-500"
              >
                Weekly
              </option>
              <option
                value="shell"
                className="bg-white hover:bg-red-500 focus:bg-red-500"
              >
                Shell
              </option>
            </select>
          </div>
        </div>
        <div>
          <p className="text-center font-medium text-red-500 pb-2">{error}</p>
          <button
            type="submit"
            className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 text-lg text-white font-semibold rounded block mx-auto"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddOptions;
