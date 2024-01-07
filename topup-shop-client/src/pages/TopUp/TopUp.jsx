import { useEffect } from "react";
import Services from "../Home/Services/Services";

const TopUp = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    },[])
    return (
        <div>
            <Services />
        </div>
    );
};

export default TopUp;