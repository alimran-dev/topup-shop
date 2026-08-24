import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import toast from "react-hot-toast";

const SiteSettings = () => {
    const [formData, setFormData] = useState({
        lastOrderShowPrice: true,
    });

    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    // get initial data
    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const { data } = await axiosPrivate.get("/site-settings");
                if (data) {
                    setFormData({
                        lastOrderShowPrice: data.lastOrderShowPrice !== false,
                    });
                } else {
                    toast.error("Failed To Load");
                }
            } catch (error) {
                toast.error("Something Went Wrong!");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [axiosPrivate]);

    // update fn
    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const res = await axiosPrivate.patch("/site-settings", {
                lastOrderShowPrice: formData.lastOrderShowPrice,
            });

            if (res.data.acknowledged) {
                toast.success("Updated Successfully!");
            } else {
                toast.error("Failed To Update!");
            }
        } catch (error) {
            toast.error("Something Went Wrong!");
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
            <h2 className="title !mx-0">Site Settings</h2>

            {loading ? (
                <p className="text-center text-gray-500 py-5">Loading...</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <h3 className="font-bold md:text-2xl mt-4 mb-2 bg-slate-200 p-2">Home Page</h3>
                    <div className="grid gap-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="lastOrderShowPrice"
                                className="toggle"
                                checked={formData.lastOrderShowPrice}
                                onChange={(e) =>
                                    setFormData({ ...formData, lastOrderShowPrice: e.target.checked })
                                }
                            />
                            <div>
                                <label htmlFor="lastOrderShowPrice" className="input-label !mb-0 cursor-pointer">
                                    Show Price on Last Orders
                                </label>
                                <p className="text-xs text-gray-500">
                                    When off, the price on the home page Last Orders tile is masked as *****.
                                </p>
                            </div>
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

export default SiteSettings;
