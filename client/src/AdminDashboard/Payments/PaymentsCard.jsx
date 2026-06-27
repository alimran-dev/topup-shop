import PropTypes from "prop-types";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Swal from "sweetalert2";
import bkashLogo from "../../assets/images/bkash.png";

const PaymentsCard = ({ method, methods, setMethods }) => {
  const axiosPrivate = useAxiosPrivate();
  const { _id, provider, category, bonus, special_bonus, fee, number, status, type, minLimit, maxLimit, balanceVerify } =
    method || {};

  const handleUpdateMethod = (e) => {
    e.preventDefault();
    const form = e.target;
    const bonus = parseFloat(form.bonus.value);
    const specialBonus = parseFloat(form.specialBonus.value);
    const fee = parseFloat(form.fee.value);
    const status = form.status.value;
    const minLimit = parseInt(form.minLimit.value);
    const maxLimit = parseInt(form.maxLimit.value);

    const method = { bonus, fee, special_bonus: specialBonus, status, minLimit, maxLimit };
    if (type !== "auto") {
      method.number = form.number.value;
      method.balanceVerify = form.balanceVerify.value;
    }

    axiosPrivate
      .patch(`/payment/method/admin/update?id=${_id}`, method)
      .then((res) => {
        if (res.data.modifiedCount > 0) {
          Swal.fire({
            toast: true,
            title: "Updated successfully!",
            icon: "success",
            position: "top",
            showConfirmButton: false,
            timer: 3000,
          });
        } else {
          Swal.fire({
            toast: true,
            title: "Failed To Update!",
            icon: "error",
            position: "top",
            showConfirmButton: false,
            timer: 3000,
          });
        }
      });
  };
  const handleDeleteMethod = () => {
    console.log("hitted");
    Swal.fire({
      title: `Delete ${number}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E61C55",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPrivate
          .delete(`/payment/method/admin/delete?id=${_id}`)
          .then((res) => {
            if (res.data.deletedCount > 0) {
              Swal.fire({
                toast: true,
                title: "Deleted Successfully",
                icon: "success",
                showConfirmButton: false,
                timer: 3000,
              });
              setMethods(methods.filter((method) => method._id !== _id));
            }
          });
      }
    });
  };
  return (
    <div>
      <form
        onSubmit={handleUpdateMethod}
        className="px-3 py-5 border rounded-md"
      >
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 space-y-2">
            <div>
              <label htmlFor="provider" className="font-semibold mr-2">
                Provider:{" "}
              </label>
              {type == "auto" ? (
                <img
                  src={bkashLogo}
                  className="w-20 object-contain inline"
                  alt="bkash logo"
                />
              ) : (
                <select
                  name="provider"
                  id=""
                  className="px-3 py-1 rounded"
                  defaultValue={provider}
                  disabled
                >
                  <option value="bkash">Bkash</option>
                  <option value="nagad">Nagad</option>
                </select>
              )}
            </div>
            <div className={`${type == "auto" && "hidden"}`}>
              <label htmlFor="category" className="font-semibold mr-2">
                Type:{" "}
              </label>
              <select
                name="category"
                id=""
                className="px-3 py-1 rounded"
                defaultValue={category}
                disabled
              >
                <option value="personal">Personal</option>
                <option value="agent">Agent</option>
              </select>
            </div>
            <div>
              <label htmlFor="bonus" className="font-semibold mr-2">
                Bonus:{" "}
              </label>
              <input
                defaultValue={bonus}
                name="bonus"
                type="number"
                step={0.01}
                className="border px-3 py-1 rounded w-full md:w-fit"
                placeholder="percent"
                required
              />
            </div>
            <div>
              <label htmlFor="bonus" className="font-semibold mr-2">
                Special Bonus:{" "}
              </label>
              <input
                defaultValue={special_bonus}
                name="specialBonus"
                type="number"
                step={0.01}
                className="border px-3 py-1 rounded w-full md:w-fit"
                placeholder="percent"
                required
              />
            </div>
            <div>
                <label htmlFor="minLimit" className="font-semibold mr-2">
                  Min Limit:{" "}
                </label>
                <input
                  name="minLimit"
                  type="number"
                  step={1}
                  className="border px-3 py-1 rounded w-full md:w-fit"
                  placeholder="100"
                  defaultValue={minLimit}
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
                defaultValue={fee}
                name="fee"
                type="number"
                step={0.01}
                className="border px-3 py-1 rounded w-full md:w-fit"
                placeholder="percent"
                required
              />
            </div>
            {type != "auto" && (
              <div>
                <label htmlFor="number" className="font-semibold mr-2">
                  Number:{" "}
                </label>
                <input
                  defaultValue={number}
                  name="number"
                  type="text"
                  className="border px-3 py-1 rounded w-full md:w-fit"
                  placeholder="Phone Number"
                  required
                />
              </div>
            )}
            <div>
              <label htmlFor="status" className="font-semibold mr-2">
                Status:{" "}
              </label>
              <select
                name="status"
                id=""
                className={`px-3 py-1 rounded font-semibold ${
                  status === "active" ? "text-green-700" : "text-red-500"
                }`}
                defaultValue={status}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            {type !== "auto" && <div>
              <label htmlFor="balanceVerify" className="font-semibold mr-2">
                Balance Verify:{" "}
              </label>
              <select
                name="balanceVerify"
                id=""
                className={`px-3 py-1 rounded font-semibold ${
                  balanceVerify === "active" ? "text-green-700" : "text-red-500"
                }`}
                defaultValue={balanceVerify}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>}
            
            <div>
                <label htmlFor="maxLimit" className="font-semibold mr-2">
                  Max Limit:{" "}
                </label>
                <input
                  name="maxLimit"
                  type="number"
                  step={1}
                  className="border px-3 py-1 rounded w-full md:w-fit"
                  placeholder="1000"
                  defaultValue={maxLimit}
                  required
                />
              </div>
            <div className="">
              <p className="font-semibold">Total Amount: <span className="text-gray-600">{method?.totalAmount || 0} BDT</span></p>
            </div>
            
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-2">
          <button
            type="submit"
            className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] px-5 py-1 text-lg font-semibold text-white rounded"
          >
            Update
          </button>
          {type != "auto" && (
            <button
              type="button"
              onClick={handleDeleteMethod}
              className="px-5 py-1 text-lg font-semibold bg-red-500 text-white rounded"
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PaymentsCard;

PaymentsCard.propTypes = {
  method: PropTypes.object.isRequired,
  methods: PropTypes.array.isRequired,
  setMethods: PropTypes.func.isRequired,
};
