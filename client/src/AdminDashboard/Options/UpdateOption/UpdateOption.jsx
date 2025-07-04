import { useState } from "react";
import toast from "react-hot-toast";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import PropTypes from "prop-types";


const UpdateOption = ({ idx, option, selectedSubCategoryId, setOptions, screen }) => {
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();

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
        const willHaveQuantity = form.willHaveQuantity.checked;

        const updatedOption = { index, name, price, id, stock, coin, serial, willHaveQuantity };

        // console.log(updatedOption);

        axiosPrivate.patch('/option/admin/update/dynamic', updatedOption).then((res) => {

            if (res.data.acknowledged) {
                toast.success("Option Updated Successfully!");
                setLoading(false);
                form.reset();
                setOptions(prevOptions =>
                    prevOptions.map((option, index) =>
                        index === idx ? { ...option, ...updatedOption } : option
                    )
                );
            } else {
                toast.error("Something Went Wrong!");
                setLoading(false);
            }
            if (screen == "mobile") {
                document.getElementById(`update_option_mobile_${idx}`).close();
            }
            else{
                document.getElementById(`update_option_desktop_${idx}`).close();
            }
        });
    };

    // console.log(idx);


    return (
        <div>
            <dialog id={screen == 'mobile' ? `update_option_mobile_${idx}` : `update_option_desktop_${idx}`} className="modal">
                <div className="modal-box bg-white text-black">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-xl uppercase border-b border-b-slate-400 pb-2">Update Option</h3>

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
                        <div className="space-y-2 flex items-center gap-2">
                            <label htmlFor="willHaveQuantity" className="input-label !my-0">Will Have Quantity: </label>
                            <input type="checkbox" name="willHaveQuantity" className="toggle !my-0" defaultChecked={option?.willHaveQuantity} />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 text-lg text-white font-semibold rounded block mx-auto"
                                disabled={loading}
                            >
                                {loading ? 'Please wait' : 'Update'}
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
    }),
    selectedSubCategoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    setOptions: PropTypes.func,
    screen: PropTypes.string,
};

export default UpdateOption;