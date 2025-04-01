import Coin from "../../../components/reusuable/Coin/Coin";

const ReferralEarnings = () => {

    return (
        <div className="px-4 py-3 md:py-6 border border-slate-300 rounded-md">
            <h3 className="font-bold mb-4">Referral Earnings</h3>

            {/* referral data */}
            <div className="grid grid-cols-4 md:grid-cols-3 items-center text-xs md:text-sm">
                <div className="col-span-2 md:col-span-1 flex gap-2">
                    <img src="https://i.ibb.co.com/phNffNq/user.png" className="w-10 object-contain rounded-full" alt="user image" />
                    <p className="flex flex-col justify-between">
                        <span>Avi Debnath</span>
                        <span className="text-[10px] md:text-xs opacity-80">12/01/2024</span>
                    </p>
                </div>
                <div className="text-center">Daily Claim</div>
                <div className="flex justify-end items-center gap-1">
                    200
                    <Coin />
                </div>
            </div>
            
        </div>
    );
};

export default ReferralEarnings;