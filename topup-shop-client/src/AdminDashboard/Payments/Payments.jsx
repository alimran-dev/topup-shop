import Swal from "sweetalert2";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import PaymentsCard from "./PaymentsCard";

const Payments = () => {
  const [methods, setMethods] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  const handleAddMethod = (e) => {
    e.preventDefault();
    const form = e.target;
    const provider = form.provider.value;
    const category = form.category.value;
    const bonus = parseFloat(form.bonus.value);
    const fee = parseFloat(form.fee.value);
    const number = form.number.value;
    const status = form.status.value;
    const method = { provider, category, bonus, fee, number, status };
    axiosPrivate.post("/paymentMethods/add", method).then((res) => {
      if (res.data.insertedId) {
        Swal.fire({
          toast: true,
          title: "Payment method added",
          icon: "success",
          showConfirmButton: false,
          position: "top",
          timer: 3000,
        });
        form.reset();
      }
    });
  };
  useEffect(() => {
    axiosPrivate.get("/paymentMethods")
      .then(res => {
        setMethods(res.data);
    })
  },[axiosPrivate])
  return (
    <div>
      <h2 className="text-center text-2xl md:text-5xl font-bold px-4 bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text pb-3">
        Payment Management
      </h2>
      <div className="border rounded-md">
        <h2 className="border-b px-3 py-1.5 text-lg font-medium text-gray-800">
          Add Payment method
        </h2>
        <form onSubmit={handleAddMethod} className="px-3 py-5">
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 space-y-2">
              <div>
                <label htmlFor="provider" className="font-semibold mr-2">
                  Provider:{" "}
                </label>
                <select name="provider" id="" className="px-3 py-1 rounded">
                  <option value="bkash">Bkash</option>
                  <option value="nagad">Nagad</option>
                </select>
              </div>
              <div>
                <label htmlFor="type" className="font-semibold mr-2">
                  Type:{" "}
                </label>
                <select name="category" id="" className="px-3 py-1 rounded">
                  <option value="personal">Personal</option>
                  <option value="agent">Agent</option>
                </select>
              </div>
              <div>
                <label htmlFor="bonus" className="font-semibold mr-2">
                  Bonus:{" "}
                </label>
                <input
                  name="bonus"
                  type="number"
                  step={0.01}
                  className="border px-3 py-1 rounded w-full md:w-fit"
                  placeholder="percent"
                  required
                />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <label htmlFor="fee" className="font-semibold mr-2">
                  Fee:{" "}
                </label>
                <input
                  name="fee"
                  type="number"
                  step={0.01}
                  className="border px-3 py-1 rounded w-full md:w-fit"
                  placeholder="percent"
                  required
                />
              </div>
              <div>
                <label htmlFor="number" className="font-semibold mr-2">
                  Number:{" "}
                </label>
                <input
                  name="number"
                  type="text"
                  className="border px-3 py-1 rounded w-full md:w-fit"
                  placeholder="Phone Number"
                  required
                />
              </div>
              <div>
                <label htmlFor="status" className="font-semibold mr-2">
                  Status:{" "}
                </label>
                <select name="status" id="" className="px-3 py-1 rounded">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="block mx-auto bg-gradient-to-r from-[#FA6023] to-[#E61C55] px-5 py-1 mt-1.5 text-lg font-semibold text-white rounded"
          >
            Add
          </button>
        </form>
      </div>
      <h2 className="text-center text-2xl md:text-4xl font-bold px-4 bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text py-3">
        Update Payment Method
      </h2>
      <div>
        {methods.map((method) => (
          <PaymentsCard method={method} methods={methods} setMethods={setMethods} key={method._id} />
        ))}
      </div>
    </div>
  );
};

export default Payments;
