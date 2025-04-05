import { useEffect, useState } from "react";
import crownImg from '../../assets/images/crown.png';
import { FaMedal } from "react-icons/fa";
import { RiCoinFill } from "react-icons/ri";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import toast from "react-hot-toast";
import UserName from "../../components/reusuable/UserName/UserName";
import avatar from "../../assets/images/avater.png";


const LeaderBoard = () => {

    const [data, setData] = useState([]);
    const [firstOne, setFirstOne] = useState({});
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    // load data
    useEffect(() => {
        setLoading(true);

        const fetchData = async () => {
            try {
                const res = await axiosPrivate.get("/coins/leaderboard");
                // console.log(res.data);
                setData(res.data);
                setFirstOne(res.data[0]);
            }
            catch (err) {
                // console.log("Error from leaderboard", err);
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


    if (loading) {
        return <div className="py-8 text-center">Loading...</div>
    }

    return (
        <div className="max-w-4xl mx-auto border border-slate-300 rounded-md">
            <div>

                {/* 1st place */}
                <div className="pt-10 pb-4 md:pb-8 flex flex-col items-center bg-primary rounded-t-md text-white">
                    <div className='w-fit relative'>
                        <img src={firstOne?.image ? firstOne?.image : avatar} className="w-16 object-cover rounded-full" alt="user image" />
                        <img src={crownImg} className='w-20 absolute -top-8 left-1/2 -translate-x-1/2' alt="crown icon" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold py-2">
                        <UserName name={firstOne?.name} isVerified={firstOne?.isVerified} />
                    </h3>
                    <p className='flex items-center gap-1 '>
                        <FaMedal className='text-yellow-500' />
                        {firstOne?.coins} Earned Coins
                    </p>
                </div>

                {/* rest data */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-2 px-2 py-4'>
                    {
                        data?.map((user, idx) =>
                            <div key={idx} className='w-full flex items-center gap-4 bg-slate-200 px-2 py-1 rounded-md'>
                                <p className="w-5">{idx + 2}</p>
                                <div className='flex-1 flex items-center gap-1'>
                                    <img src={user?.image ? user?.image : avatar} className="w-8 object-cover rounded-full" alt="user image" />
                                    <UserName name={user?.name} isVerified={user?.isVerified} iconClass="w-4 h-4" />
                                </div>
                                <p className='flex items-center gap-1'>
                                    <RiCoinFill className='text-yellow-500 space-y-1' />{user?.coins}
                                </p>
                            </div>
                        )
                    }
                </div>

            </div>
        </div>
    );
};

export default LeaderBoard;