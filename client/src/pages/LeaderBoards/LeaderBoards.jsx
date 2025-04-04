import { useEffect, useState } from "react";
import CommonLeaderBoard from "./CommonLeadBoard/CommonLeaderBoard";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import toast from "react-hot-toast";


const LeaderBoards = () => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    // load data
    useEffect(() => {
        setLoading(true);

        const fetchData = async () => {
            try {
                const res = await axiosPrivate.get("/coins/leaderboard");
                console.log(res.data);
                
            }
            catch (err) {
                console.log("Error from leaderboard", err);
                toast.error("Failed to load!");
            }
            finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [axiosPrivate]);


    // page apear from top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);


    if(loading){
        return <div className="py-8 text-center">Loading...</div>
    }

    return (
        <div className="max-w-4xl mx-auto border border-slate-300 rounded-md">
            <CommonLeaderBoard />
        </div>
    );
};

export default LeaderBoards;