import { useEffect } from "react";
import Banner from "./Banner/Banner";
import FollowUs from "./FollowUs/FollowUs";
import Notice from "./Notice/Notice";
import Services from "./Services/Services";
import AdModal from "./AdModal/AdModal";
import DailyCoinClaim from "./DailyCoinClaim/DailyCoinClaim";
import LastOrders from "./LastOrders/LastOrders";
import SpecialOffers from "./SpecialOffers/SpecialOffers";
// import ClaimRedeemCode from "./ClaimRedeemCode/ClaimRedeemCode";
import { useLocation } from "react-router-dom";
import MiniNavigation from "./MiniNavigation/MiniNavigation";

const Home = () => {
  const location=useLocation();


  // page apear from top
  useEffect(() => {
    window.history.scrollRestoration="manual";
    window.scrollTo(0, 0);
  }, [location]);


  return (
    <div className="space-y-5">
      <AdModal />
      <DailyCoinClaim />
      <Notice />
      <Banner />
      <MiniNavigation />
      {/* <ClaimRedeemCode /> */}
        <SpecialOffers />
      <Services />
      <LastOrders />
      <FollowUs />
    </div>
  );
};

export default Home;
