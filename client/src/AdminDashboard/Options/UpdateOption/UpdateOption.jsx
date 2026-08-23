import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const CENTRAL_SERVERS = ["unipin", "my", "sg", "indo"];

const UpdateOption = ({
  idx,
  option,
  selectedSubCategoryId,
  selectedServer,
  setOptions,
  screen,
}) => {
  const [loading, setLoading] = useState(false);
  const [subTypes, setSubTypes] = useState([]);
  const [subPrices, setSubPrices] = useState({}); // [typeId] = "" | value-string
  const axiosPrivate = useAxiosPrivate();

  // subscription types for the per-type subscriber price inputs
  useEffect(() => {
    axiosPrivate
      .get("/subscription/admin/types")
      .then((res) => setSubTypes(res.data || []))
      .catch(() => {});
  }, [axiosPrivate]);

  // prefill subscriber prices from the option (reset when option changes)
  useEffect(() => {
    setSubPrices(
      Object.fromEntries(
        Object.entries(option?.subscriberPrices || {}).map(([k, v]) => [
          k,
          String(v),
        ])
      )
    );
  }, [option?.subscriberPrices]);

  // update option fn
  const handleUpdate = (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;

    const index = idx;
    const name = form.name.value;
    const price = parseInt(form.price.value) || 0;
    const id = selectedSubCategoryId;
    const stock = parseInt(form.stock.value);
    const coin = parseInt(form.coin.value);
    const serial = parseInt(form.serial.value);
    const willHaveQuantity =
      selectedServer === "like" ? false : !!form.willHaveQuantity?.checked;

    // Per-type subscriber prices (empty map -> server removes the field)
    const subscriberPrices = {};
    for (const t of subTypes) {
      const val = subPrices[t._id];
      if (val !== undefined && val !== "") {
        subscriberPrices[t._id] = Number(val);
      }
    }

    const updatedOption = {
      index,
      name,
      price,
      id,
      stock,
      coin,
      serial,
      willHaveQuantity,
      subscriberPrices,
    };

    // console.log(updatedOption);

    axiosPrivate
      .patch("/option/admin/update/dynamic", updatedOption)
      .then((res) => {
        if (res.data.acknowledged) {
          toast.success("Option Updated Successfully!");
          setLoading(false);
          form.reset();
          setOptions((prevOptions) =>
            prevOptions.map((option, index) =>
              index === idx ? { ...option, ...updatedOption } : option,
            ),
          );
        } else {
          toast.error("Something Went Wrong!");
          setLoading(false);
        }
        if (screen == "mobile") {
          document.getElementById(`update_option_mobile_${idx}`).close();
        } else {
          document.getElementById(`update_option_desktop_${idx}`).close();
        }
      });
  };

  // console.log(idx);

  return (
    <div>
      <dialog
        id={
          screen == "mobile"
            ? `update_option_mobile_${idx}`
            : `update_option_desktop_${idx}`
        }
        className="modal"
      >
        <div className="modal-box bg-white text-black">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-xl uppercase border-b border-b-slate-400 pb-2">
            Update Option
          </h3>

          {/* update form */}
          <form onSubmit={handleUpdate} className="space-y-4 text-left py-5">
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
                defaultValue={option?.name}
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
                type="number"
                name="price"
                defaultValue={option?.price}
                required
                className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
                placeholder="Example: 50"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="price"
                className="block text-xl font-medium text-gray-700"
              >
                Stock
              </label>
              <input
                type="number"
                name="stock"
                defaultValue={option?.stock}
                required
                className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
                placeholder="Example: 40"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="price"
                className="block text-xl font-medium text-gray-700"
              >
                Coin
              </label>
              <input
                type="number"
                name="coin"
                defaultValue={option?.coin}
                required
                className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
                placeholder="Example: 40"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="serial"
                className="block text-xl font-medium text-gray-700"
              >
                Serial
              </label>
              <input
                type="number"
                name="serial"
                defaultValue={option?.serial}
                required
                className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
                placeholder="Example: 40"
              />
            </div>
            {selectedServer !== "like" && (
              <div className="space-y-2 flex items-center gap-2">
                <label htmlFor="willHaveQuantity" className="input-label !my-0">
                  Will Have Quantity:{" "}
                </label>
                <input
                  type="checkbox"
                  name="willHaveQuantity"
                  className="toggle !my-0"
                  defaultChecked={option?.willHaveQuantity}
                />
              </div>
            )}
            {CENTRAL_SERVERS.includes(selectedServer) ? (
              <p className="text-sm font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                Subscriber prices for this server are managed centrally on the{" "}
                <Link
                  to="/dashboard/subscriber-pricing"
                  className="underline font-semibold"
                >
                  Subscriber Pricing
                </Link>{" "}
                page — this option's subscriber price is calculated from the
                per-unit prices automatically.
              </p>
            ) : (
              subTypes.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xl font-medium text-gray-700">
                    Subscriber Prices (৳){" "}
                    <span className="text-sm font-normal text-gray-500">
                      — blank = normal price
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {subTypes.map((t) => (
                      <div key={t._id} className="space-y-1">
                        <label className="block text-sm font-medium text-gray-600">
                          {t.name}
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="block w-40 py-1.5 px-3 font-medium border-2 border-gray-600 rounded-md"
                          placeholder="Normal price"
                          value={subPrices[t._id] ?? ""}
                          onChange={(e) =>
                            setSubPrices((prev) => ({
                              ...prev,
                              [t._id]: e.target.value,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
            <div>
              <button
                type="submit"
                className="bg-gradient-to-r from-primary to-secondary py-1.5 px-5 text-lg text-white font-semibold rounded block mx-auto"
                disabled={loading}
              >
                {loading ? "Please wait" : "Update"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};

UpdateOption.propTypes = {
  idx: PropTypes.number,
  option: PropTypes.shape({
    name: PropTypes.string,
    price: PropTypes.number,
    stock: PropTypes.number,
    coin: PropTypes.number,
    serial: PropTypes.number,
    willHaveQuantity: PropTypes.bool,
    subscriberPrices: PropTypes.object,
  }),
  selectedSubCategoryId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  selectedServer: PropTypes.string,
  setOptions: PropTypes.func,
  screen: PropTypes.string,
};

export default UpdateOption;
