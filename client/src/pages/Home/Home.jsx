import { useEffect } from "react";
import Banner from "./Banner/Banner";
import FollowUs from "./FollowUs/FollowUs";
import Notice from "./Notice/Notice";
import Services from "./Services/Services";
import AdModal from "./AdModal/AdModal";
import DailyCoinClaim from "./DailyCoinClaim/DailyCoinClaim";
import LastOrders from "./LastOrders/LastOrders";
import SpecialOffers from "./SpecialOffers/SpecialOffers";
import ClaimRedeemCode from "./ClaimRedeemCode/ClaimRedeemCode";

const Home = () => {


  // page apear from top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  return (
    <div className="space-y-5">
      <AdModal />
      <DailyCoinClaim />
      <Notice />
      <Banner />
      <ClaimRedeemCode />
        <SpecialOffers />
      <Services />
      <LastOrders />
      <FollowUs />
    </div>
  );
};

export default Home;
