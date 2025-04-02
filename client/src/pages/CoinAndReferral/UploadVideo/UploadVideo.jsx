import { FaRegDotCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import toast from "react-hot-toast";
import Coin from "../../../components/reusuable/Coin/Coin";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";


const UploadVideo = () => {

    const [coinAmount, setCoinAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();


    // get coin amount for review
    useEffect(() => {
        setLoading(true);
        const fetchData = async () => {
            try {
                const res = await axiosPrivate.get("/coins/review");
                setCoinAmount(res.data?.perReview || 0);
            }
            catch (err) {
                toast.error("Something Went Wrong!")
            }
            finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [axiosPrivate]);

    // upload video fn
    const handleUploadVideo = async (e) => {
        e.preventDefault();
        setLoading(true);

        const videoUrl = e.target.link.value;

        // URL validation regex
        const urlPattern = /^(https?:\/\/)\S+$/;

        if (!urlPattern.test(videoUrl)) {
            toast.error("Please enter a valid URL!");
            setLoading(false);
            return;
        }

        const reviewData = {
            email: user?.email,
            url: user?.videoUrl,
        }

        try {
            const res = await axiosPrivate.post("/coins/review", reviewData);
            // console.log(res.data);
            if (res.data.success) {
                toast.success("Upload Successfully!");
                e.target.reset();
            }
            else {
                toast.error("Faild To Upload!")
            }
        }
        catch (err) {
            toast.error("Something Went Wrong!")
        }
        finally {
            setLoading(false);
        }
    };

    // steps data
    const steps = [
        {
            id: 1,
            text: "আমাদের ওয়েবসাইট নিয়ে ভালোভাবে একটি ভিডিও তৈরি করুন।"
        },
        {
            id: 2,
            text: "ভিডিওতে আমাদের ওয়েবসাইটের সকল কিছু ভালোভাবে বুঝিয়ে দিতে হবে।"
        },
        {
            id: 3,
            text: "অবশ্যই ভিডিওতে কথা বলতে হবে।"
        },
        {
            id: 4,
            text: "কিভাবে টপ আপ করে তা দেখিয়ে দিতে হবে।"
        },
        {
            id: 5,
            text: "আপনার রেফার লিংক আপনার ভিডিও কমেন্ট বক্সে দিবেন।"
        },
        {
            id: 6,
            text: "আর এখানে শুধু ভিডিওর লিংক দিবেন আপনার রেফার লিংক এই জায়গায় দিবেন না।"
        }
    ];

    if (!user) {
        toast.error("Please Login First!");
        navigate("/login")
    }

    return (
        <div className="px-4 py-3 md:py-6 border border-slate-300 rounded-md">
            <h3 className="font-bold">Upload Video Link</h3>
            <p className="flex gap-1">Get <span className="font-semibold flex items-center gap-1">+{coinAmount} Coins <Coin /></span></p>
            <form onSubmit={handleUploadVideo} className="mt-3 mb-5 flex gap-2">
                <input type="text" name="link" className="input flex-1" placeholder="Enter video link" />
                <button type="submit" className="button" disabled={loading}>
                    {loading ? 'Please Wait' : 'Upload'}
                </button>
            </form>
            {
                steps?.map(step =>
                    <p key={step?.id} className="flex gap-2 text-sm md:text-sm mb-1">
                        <FaRegDotCircle className="translate-y-1" />
                        {step?.text}
                    </p>
                )
            }
        </div>
    );
};

export default UploadVideo;