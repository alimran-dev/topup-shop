import PropTypes from 'prop-types';
import { useState } from 'react';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import toast from 'react-hot-toast';


const RedeemCodeForm = ({ redeemCodeData = null, setRedeemCodes }) => {

    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();


    // add or update operation fn
    const handleRedeemCode = async (e) => {
        e.preventDefault();
        setLoading(true);

        const values = {
            code: e.target.redeemCode.value,
            quantity: e.target.quantity.value,
            value: e.target.value.value,
            type: e.target.type.value,
            expiredAt: e.target.expireDate.value,
        };

        // add api ---------------
        if (redeemCodeData === null) {
            // console.log('add api, values:', values);
            try {
                const res = await axiosPrivate.post('/redeem/add', values);
                // console.log(res?.data);
                if (res?.data) {
                    setRedeemCodes(prev => [...prev, res?.data]);
                    toast.success('Successfully Added!');
                }
            } catch (error) {
                // console.error("Error fetching redeem codes:", error);
                toast.error('Something went wrong!');
            } finally {
                document.getElementById('add_redeem_code').close();
                setLoading(false);
            }
        }

        // update api ---------------
        else {
            try {
                const isActive = e.target.isActive.value === "true";
                const updatedValues = { ...values, isActive };

                const res = await axiosPrivate.patch(`/redeem/update?id=${redeemCodeData?._id}`, updatedValues);
                // console.log(res?.data);

                // update the value 
                setRedeemCodes(prevCodes =>
                    prevCodes.map(code =>
                        code._id === redeemCodeData?._id
                            ? { ...code, ...updatedValues }  // Replace the old values with new ones
                            : code
                    )
                );

                toast.success('Updated Successfully!');
            } catch (error) {
                // console.error("Error fetching redeem codes:", error);
                toast.error('Something went wrong!')
            } finally {
                document.getElementById(`update_redeem_code${redeemCodeData?._id}`).close();
                setLoading(false);
            }
        }
    };


    return (
        <div className="flex flex-col items-center">
            <h2 className="text-lg md:text-2xl font-semibold pb-2 mb-3 border-b border-b-slate-400 w-full text-center text-black">
                {redeemCodeData ? 'Update Redeem Code' : 'Add Redeem Code'}
            </h2>
            <form onSubmit={handleRedeemCode}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-y-3">
                    <div>
                        <label className="input-label">Code</label>
                        <input
                            type="text"
                            name="redeemCode"
                            className="input"
                            placeholder="Enter redeem code"
                            required
                            defaultValue={redeemCodeData ? redeemCodeData.code : ""}
                        />
                    </div>
                    <div>
                        <label className="input-label">Value</label>
                        <input
                            type="number"
                            name="value"
                            className="input"
                            placeholder="Enter code value"
                            required
                            defaultValue={redeemCodeData ? redeemCodeData.value : ""}
                        />
                    </div>
                    <div>
                        <label className="input-label">Quantity</label>
                        <input
                            type="number"
                            name="quantity"
                            className="input"
                            placeholder="Enter quantity"
                            required
                            defaultValue={redeemCodeData ? redeemCodeData.quantity : ""}
                        />
                    </div>
                    <div>
                        <label className="input-label">Type</label>
                        <select
                            name="type"
                            className="input"
                            defaultValue={redeemCodeData ? redeemCodeData.type : ""}
                            required
                        >
                            <option value="" disabled>Choose One</option>
                            <option value="balance">Balance</option>
                            <option value="coin">Coin</option>
                        </select>
                    </div>
                    {redeemCodeData &&
                        <div>
                            <label className="input-label">Status</label>
                            <select
                                name="isActive"
                                className="input"
                                defaultValue={redeemCodeData ? redeemCodeData.isActive : ""}
                                required
                            >
                                <option value="" disabled>Choose One</option>
                                <option value={true}>True</option>
                                <option value={false}>False</option>
                            </select>
                        </div>
                    }
                    <div className={`${redeemCodeData ? "" : "col-span-2"}`}>
                        <label className="input-label">Expire At</label>
                        <input
                            type="date"
                            name="expireDate"
                            className="input"
                            required
                            defaultValue={redeemCodeData ? new Date(redeemCodeData.expiredAt).toISOString().split('T')[0] : ""}
                        />
                    </div>
                </div>
                <button type="submit" className="button block mx-auto bg-gradient mt-5" disabled={loading}>
                    {loading ? "Loading..." : (redeemCodeData ? 'Update' : 'Add')}
                </button>

            </form>
        </div>
    );
};

// Prop validation
RedeemCodeForm.propTypes = {
    redeemCodeData: PropTypes.shape({
        redeemCode: PropTypes.string,
        quantity: PropTypes.number,
        value: PropTypes.number,
        type: PropTypes.string,
        expireDate: PropTypes.string,
    }),
    setRedeemCodes: PropTypes.func.isRequired
};

export default RedeemCodeForm;
