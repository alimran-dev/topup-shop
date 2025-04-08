import DailyCoinClaim from "../Home/DailyCoinClaim/DailyCoinClaim";
import ReferralLinks from "./ReferralLinks/ReferralLinks";
import UploadVideo from "./UploadVideo/UploadVideo";
import { useEffect } from "react";
import Coin from "../../components/reusuable/Coin/Coin";
import useAuth from "../../hooks/useAuth";
import { FaHistory } from "react-icons/fa";
import { Link } from "react-router-dom";


const CoinAndReferral = () => {

    const { user } = useAuth();

    // page apear from top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="max-w-2xl mx-auto space-y-4">

            {/* coing balance */}
            <div className="bg-primary text-center py-5 md:py-10 rounded-md text-white font-semibold">
                <h2 className="text-xl md:text-2xl">Your Coin Balance</h2>
                <p className="flex justify-center items-center gap-1">
                    <Coin />
                    <span>{user?.coins}</span>
                </p>
            </div>

            <DailyCoinClaim />
            <ReferralLinks />
            <UploadVideo />

            <div className="flex justify-between items-center px-4">
                <Link to={"/coinsAndReferral/coinHistory"} className="flex  items-center gap-1 text-blue-600 font-semibold">
                    <FaHistory />
                    Coin History
                </Link>
                <Link to={"/coinsAndReferral/referralHistory"} className="flex  items-center gap-1 text-blue-600 font-semibold">
                    <FaHistory />
                    Referral History
                </Link>
            </div>

        </div>
    );
};

export default CoinAndReferral;