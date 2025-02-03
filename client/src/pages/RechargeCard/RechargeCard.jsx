import { useParams } from "react-router-dom";
import SimCompanies from "../SimCompanies/SimCompanies";
import CardsOptions from "./CardsOptions";
import CardCategory from "./CardCategory";

const RechargeCard = () => {
    const { next } = useParams();
    if (next === "companies") {
        return <SimCompanies />;
    } else if (next === "category") {
        return <CardCategory />;
    } else if(next==="options") {
        return <CardsOptions />;
    } else {
        return <div>
            
        </div>
    }
};

export default RechargeCard;