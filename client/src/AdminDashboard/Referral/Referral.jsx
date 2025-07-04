import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaHistory } from "react-icons/fa";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import toast from 'react-hot-toast';

const Referral = () => {
    const [formData, setFormData] = useState({
        referFrom: "",
        referTo: "",
        firstLevelCoin: "",
        firstLevelAmount: "",
        secondLevelCoin: "",
        secondLevelAmount: "",
        thirdLevelCoin: "",
        thirdLevelAmount: "",
        daily: "",
        perReview: "",
    });

    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    // get initial data
    useEffect(() => {
        const fetchReferralSettings = async () => {
            setLoading(true);
            try {
                const { data } = await axiosPrivate.get("/coins/settings");

                if (data) {
                    setFormData({
                        referFrom: data.referFrom || "",
                        referTo: data.referTo || "",
                        firstLevelCoin: data.firstLevelCoin || "",
                        firstLevelAmount: data.firstLevelAmount || "",
                        secondLevelCoin: data.secondLevelCoin || "",
                        secondLevelAmount: data.secondLevelAmount || "",
                        thirdLevelCoin: data.thirdLevelCoin || "",
                        thirdLevelAmount: data.secondLevelAmount ? `${data.secondLevelAmount}+` : "",
                        daily: data.daily || "",
                        perReview: data.perReview || "",
                    });
                } else {
                    toast.error('Failed To Load');
                }
            } catch (error) {
                toast.error('Something Went Wrong!');
            } finally {
                setLoading(false);
            }
        };

        fetchReferralSettings();
    }, [axiosPrivate]);

    // change input's value
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Ensure thirdLevelAmount reflects secondLevelAmount dynamically
        if (name === "secondLevelAmount") {
            setFormData((prev) => ({
                ...prev,
                thirdLevelAmount: `${value}+`,
            }));
        }
    };

    // update fn
    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const res = await axiosPrivate.patch("/coins/settings", {
                referFrom: Number(formData.referFrom),
                referTo: Number(formData.referTo),
                firstLevelCoin: Number(formData.firstLevelCoin),
                firstLevelAmount: Number(formData.firstLevelAmount),
                secondLevelCoin: Number(formData.secondLevelCoin),
                secondLevelAmount: Number(formData.secondLevelAmount),
                thirdLevelCoin: Number(formData.thirdLevelCoin),
                daily: Number(formData.daily),
                perReview: Number(formData.perReview),
            });

            if (res.data.acknowledged) {
                toast.success('Updated Successfully!');
            } else {
                toast.error('Failed To Update!');
            }
        } catch (error) {
            toast.error('Something Went Wrong!');
        } finally {
            setUpdating(false);
        }
    };

    // page apear from top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <h2 className="title !mx-0">Referral</h2>
                <Link to="/dashboard/referral/history" className="text-blue-700 font-semibold flex items-center gap-1">
                    <FaHistory />
                    Referral History
                </Link>
            </div>

            {loading ? (
                <p className="text-center text-gray-500 py-5">Loading...</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <h3 className="font-bold md:text-2xl mt-4 mb-2 bg-slate-200 p-2">Initial Referral Coins</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Refer From</label>
                            <input type="number" name="referFrom" className="input" placeholder="Refer coin"
                                value={formData.referFrom} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="input-label">Refer To</label>
                            <input type="number" name="referTo" className="input" placeholder="Refer coin"
                                value={formData.referTo} onChange={handleChange} required />
                        </div>
                    </div>

                    <h3 className="font-bold md:text-2xl mt-4 mb-2 bg-slate-200 p-2">Up To</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Up To (Min)</label>
                            <input type="number" name="firstLevelAmount" className="input" placeholder="Up to"
                                value={formData.firstLevelAmount} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="input-label">Coins(%)</label>
                            <input type="number" name="firstLevelCoin" className="input" placeholder="Coins"
                                value={formData.firstLevelCoin} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="input-label">Up To (Middle)</label>
                            <input type="number" name="secondLevelAmount" className="input" placeholder="Up to"
                                value={formData.secondLevelAmount} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="input-label">Coins(%)</label>
                            <input type="number" name="secondLevelCoin" className="input" placeholder="Coins"
                                value={formData.secondLevelCoin} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="input-label">Up To (Max)</label>
                            <input type="text" name="thirdLevelAmount" className="input bg-gray-200" placeholder="Up to"
                                value={formData.thirdLevelAmount} disabled />
                        </div>
                        <div>
                            <label className="input-label">Coins(%)</label>
                            <input type="number" name="thirdLevelCoin" className="input" placeholder="Coins"
                                value={formData.thirdLevelCoin} onChange={handleChange} required />
                        </div>
                    </div>

                    <h3 className="font-bold md:text-2xl mt-4 mb-2 bg-slate-200 p-2">Others</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Daily Claim Coins</label>
                            <input type="number" name="daily" className="input" placeholder="Daily claim coins"
                                value={formData.daily} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="input-label">Video Review Coins</label>
                            <input type="number" name="perReview" className="input" placeholder="Video review coins"
                                value={formData.perReview} onChange={handleChange} required />
                        </div>
                    </div>

                    <button className="button block mx-auto my-4" disabled={updating}>
                        {updating ? "Updating..." : "Submit"}
                    </button>
                </form>
            )}
        </div>
    );
};

export default Referral;
