import DailyCoinClaim from "../Home/DailyCoinClaim/DailyCoinClaim";
import ReferralLinks from "./ReferralLinks/ReferralLinks";
import UploadVideo from "./UploadVideo/UploadVideo";
import ReferralEarnings from "./ReferralEarnings/ReferralEarnings";
import { useEffect } from "react";
import Coin from "../../components/reusuable/Coin/Coin";

const CoinAndReferral = () => {


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
                    <span>500</span>
                </p>
            </div>

            <DailyCoinClaim />
            <ReferralLinks />
            <UploadVideo />
            <ReferralEarnings />

        </div>
    );
};

export default CoinAndReferral;