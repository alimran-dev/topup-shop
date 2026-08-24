import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import bkashLogo from "../../assets/images/bkash.png";

const PaymentsCard = ({ method, methods, setMethods }) => {
  const axiosPrivate = useAxiosPrivate();
  const { _id, provider, category, bonus, special_bonus, fee, number, status, type, minLimit, maxLimit, balanceVerify, isDirect } =
    method || {};
  const [allowedRoles, setAllowedRoles] = useState(method?.allowedRoles || []);
  const [subTypes, setSubTypes] = useState([]);

  // subscription types for the allowed-purchasers checkbox group
  useEffect(() => {
    axiosPrivate
      .get("/subscription/admin/types")
      .then((res) => setSubTypes(res.data || []))
      .catch(() => {});
  }, [axiosPrivate]);

  // reset the receiving-limit counter — method recovers instantly
  const handleResetLimit = () => {
    axiosPrivate
      .patch(`/payment/method/admin/limit/reset?id=${_id}`)
      .then((res) => {
        // acknowledged is true even for a no-op (stale id) — only a real
        // modifiedCount means the baseline actually moved.
        if (res.data.modifiedCount > 0) {
          Swal.fire({
            toast: true,
            title: "Receiving limit reset!",
            icon: "success",
            position: "top",
            showConfirmButton: false,
            timer: 3000,
          });
          axiosPrivate.get("/payment/methods").then((res) => setMethods(res.data));
        } else {
          toast.error("Failed to reset limit!");
        }
      });
  };

  const handleUpdateMethod = (e) => {
    e.preventDefault();
    const form = e.target;
    const bonus = parseFloat(form.bonus.value);
    const specialBonus = parseFloat(form.specialBonus.value);
    const fee = parseFloat(form.fee.value);
    const status = form.status.value;
    const minLimit = parseInt(form.minLimit.value);
    const maxLimit = parseInt(form.maxLimit.value);
    const isDirect = form.isDirect.checked;

    const method = { bonus, fee, special_bonus: specialBonus, status, minLimit, maxLimit, isDirect };
    if (type !== "auto") {
      method.number = form.number.value;
      method.balanceVerify = form.balanceVerify.value;
    }
    // Optional gates — empty array = everyone; blank = unlimited / always
    method.allowedRoles = allowedRoles;
    method.receivingLimit = form.receivingLimit?.value || "";
    method.activeStartHour = form.activeStartHour?.value || "";
    method.activeEndHour = form.activeEndHour?.value || "";

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
      confirmButtonColor: "rgb(var(--theme-secondary))",
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
                <option value="merchant">Merchant</option>
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
            <div className="flex items-center">
                <label htmlFor="isDirect" className="font-semibold mr-2">
                  Direct Pay:{" "}
                </label>
                <input
                  name="isDirect"
                  type="checkbox"
                  className="toggle"
                  defaultChecked={isDirect}
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
              {method?.receivingLimit != null && (
                <p className="font-semibold">
                  Received: <span className="text-gray-600">{method?.received || 0}</span> /{" "}
                  <span className="text-gray-600">{method?.receivingLimit} BDT</span>
                </p>
              )}
              {method?.limitHit && (
                <p className="font-semibold text-red-600">
                  ⛔ Limit hit — hidden from users until reset
                </p>
              )}
            </div>
            <div>
              <label htmlFor="receivingLimit" className="font-semibold mr-2">
                Receiving Limit (৳):{" "}
                <span className="text-xs text-gray-400">(blank = unlimited)</span>
              </label>
              <input
                defaultValue={method?.receivingLimit ?? ""}
                name="receivingLimit"
                type="number"
                step={0.01}
                className="border px-3 py-1 rounded w-full md:w-fit"
                placeholder="e.g. 50000"
              />
            </div>
            <div>
              <label htmlFor="activeStartHour" className="font-semibold mr-2">
                Active From Hour (0-23):{" "}
                <span className="text-xs text-gray-400">(blank = always)</span>
              </label>
              <input
                defaultValue={method?.activeStartHour ?? ""}
                name="activeStartHour"
                type="number"
                min={0}
                max={23}
                step={1}
                className="border px-3 py-1 rounded w-full md:w-fit"
                placeholder="e.g. 9"
              />
            </div>
            <div>
              <label htmlFor="activeEndHour" className="font-semibold mr-2">
                Active To Hour (0-23):{" "}
                <span className="text-xs text-gray-400">(blank = always)</span>
              </label>
              <input
                defaultValue={method?.activeEndHour ?? ""}
                name="activeEndHour"
                type="number"
                min={0}
                max={23}
                step={1}
                className="border px-3 py-1 rounded w-full md:w-fit"
                placeholder="e.g. 21"
              />
            </div>

          </div>
        </div>
        <div className="my-3">
          <label className="font-semibold mr-2">
            Allowed Purchasers{" "}
            <span className="text-xs text-gray-400">
              (none selected = everyone)
            </span>
          </label>
          <div className="flex flex-wrap gap-4 mt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowedRoles.includes("normal")}
                onChange={(e) =>
                  setAllowedRoles((prev) =>
                    e.target.checked
                      ? [...prev, "normal"]
                      : prev.filter((r) => r !== "normal")
                  )
                }
              />
              Normal user
            </label>
            {subTypes.map((t) => (
              <label key={t._id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowedRoles.includes(t._id)}
                  onChange={(e) =>
                    setAllowedRoles((prev) =>
                      e.target.checked
                        ? [...prev, t._id]
                        : prev.filter((r) => r !== t._id)
                    )
                  }
                />
                {t.name}
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-2">
          <button
            type="submit"
            className="bg-gradient-to-r from-primary to-secondary px-5 py-1 text-lg font-semibold text-white rounded"
          >
            Update
          </button>
          <button
            type="button"
            onClick={handleResetLimit}
            className="px-5 py-1 text-lg font-semibold bg-amber-500 text-white rounded"
          >
            Reset Limit
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
