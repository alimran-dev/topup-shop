import { Link } from "react-router-dom";
import { FaHistory } from "react-icons/fa";


const Referral = () => {

    const handleSubmit = (e) => {
        e.preventDefault();

        // Example: Collecting the values manually during form submission
        const formValues = {
            referFrom: e.target.referFrom.value,
            referTo: e.target.referTo.value,
            upToMax: e.target.upToMax.value,
            percentageMax: e.target.percentageMax.value,
            upToMiddle: e.target.upToMiddle.value,
            percentageMiddle: e.target.percentageMiddle.value,
            upToMin: e.target.upToMin.value,
            percentageMin: e.target.percentageMin.value,
            dailyClaimCoin: e.target.dailyClaimCoin.value,
            videoReviewCoin: e.target.videoReviewCoin.value,
        };

        // Log all form values on submit
        console.log(formValues);
    };

    return (
        <div className="max-w-4xl mx-auto">

            <div className="flex justify-between items-center">
                <h2 className="title !mx-0">Referral</h2>
                <Link to="/dashboard/referral/history" className="text-blue-700 font-semibold flex items-center gap-1">
                    <FaHistory />
                    Referral History
                </Link>
            </div>

            {/* referral form */}
            <form onSubmit={handleSubmit}>

                {/* person coin */}
                <h3 className="font-bold md:text-2xl mt-4 mb-2 bg-slate-200 p-2">Initial Referral Coins</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="input-label">Refer From</label>
                        <input
                            type="number"
                            name="referFrom"
                            className="input"
                            placeholder="Refer coin"
                            required
                        />
                    </div>
                    <div>
                        <label className="input-label">Refer To</label>
                        <input
                            type="number"
                            name="referTo"
                            className="input"
                            placeholder="Refer coin"
                            required
                        />
                    </div>
                </div>

                {/* up to */}
                <h3 className="font-bold md:text-2xl mt-4 mb-2 bg-slate-200 p-2">Up To</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="input-label">Up To (Max)</label>
                        <input
                            type="number"
                            name="upToMax"
                            className="input"
                            placeholder="Up to"
                            required
                        />
                    </div>
                    <div>
                        <label className="input-label">Percentage</label>
                        <input
                            type="number"
                            name="percentageMax"
                            className="input"
                            placeholder="Percentage"
                            required
                        />
                    </div>
                    <div>
                        <label className="input-label">Up To (Middle)</label>
                        <input
                            type="number"
                            name="upToMiddle"
                            className="input"
                            placeholder="Up to"
                            required
                        />
                    </div>
                    <div>
                        <label className="input-label">Percentage</label>
                        <input
                            type="number"
                            name="percentageMiddle"
                            className="input"
                            placeholder="Percentage"
                            required
                        />
                    </div>
                    <div>
                        <label className="input-label">Up To (Min)</label>
                        <input
                            type="number"
                            name="upToMin"
                            className="input"
                            placeholder="Up to"
                            required
                        />
                    </div>
                    <div>
                        <label className="input-label">Percentage</label>
                        <input
                            type="number"
                            name="percentageMin"
                            className="input"
                            placeholder="Percentage"
                            required
                        />
                    </div>
                </div>

                {/* Others */}
                <h3 className="font-bold md:text-2xl mt-4 mb-2 bg-slate-200 p-2">Others</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="input-label">Daily Claim Coins</label>
                        <input
                            type="number"
                            name="dailyClaimCoin"
                            className="input"
                            placeholder="Daily claim coins"
                            required
                        />
                    </div>
                    <div>
                        <label className="input-label">Video Review Coins</label>
                        <input
                            type="number"
                            name="videoReviewCoin"
                            className="input"
                            placeholder="Video review coins"
                            required
                        />
                    </div>
                </div>

                <button className="button block mx-auto my-4">Submit</button>
            </form>


        </div>

    );
};

export default Referral;
