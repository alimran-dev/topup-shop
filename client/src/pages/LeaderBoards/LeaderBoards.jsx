import { useEffect } from "react";
import CommonLeaderBoard from "./CommonLeadBoard/CommonLeaderBoard";


const LeaderBoards = () => {

    // page apear from top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="max-w-4xl mx-auto border border-slate-300 rounded-md">
            <CommonLeaderBoard />
        </div>
    );
};

export default LeaderBoards;