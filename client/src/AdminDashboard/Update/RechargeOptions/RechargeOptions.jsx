import { useLocation } from "react-router-dom";
import SimCompanies from "./SimCompanies";
import CardCategory from "./CardCategory";
import RechargeItems from "./RechargeItems";

const RechargeOptions = () => {
  const location = useLocation();

  if (location.state?.simCompany) {
    return <SimCompanies />;
  } else if(location.state?.type==="companies") {
      return <CardCategory />;
  } else if (location.state?.type === "category") {
      return <RechargeItems />;
  }
};

export default RechargeOptions;
