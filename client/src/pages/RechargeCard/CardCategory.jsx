import { useLocation } from "react-router-dom";
import CompanyCard from "../SimCompanies/CompanyCard";
import airdrop from "../../assets/images/airdrop.jpeg";
import rechargeImg from "../../assets/images/recharge-card.jpeg";


const CardCategory = () => {
  const location = useLocation();
  // console.log(location.state, "---------card category");
  return (
    <div>
      <h2 className="text-center text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text py-3 -mt-5 w-fit mx-auto">
        Choose a Category
      </h2>
      <div className="grid grid-cols-3 md:flex md:flex-wrap justify-center items-stretch gap-2 md:gap-5 my-5">
        <div className="flex-1">
          <CompanyCard
            image={location.state?.docName == "mbMinOffer" ? rechargeImg : airdrop}
            title={"MB"}
            path="./../options"
            state={location.state?.docName === "mbMinOffer"
              ? { id: location.state?.id, companyName: location.state?.companyName, docName: "mbOffer", type: "offerCard", title: "MB Offer" }
              : { id: location.state?.id, companyName: location.state?.companyName, docName: "mbCard", title: "MB Card" }}
          />
        </div>
        <div className="flex-1">
          <CompanyCard
            image={location.state?.docName == "mbMinOffer" ? rechargeImg : airdrop}
            title={"Minutes"}
            path="./../options"
            state={location.state?.docName === "mbMinOffer"
              ? { id: location.state?.id, companyName: location.state?.companyName, docName: "minOffer", type: "offerCard", title: "Minute Offer" }
              : { id: location.state?.id, companyName: location.state?.companyName, docName: "minCard", title: "Minute Card" }}
          />
        </div>
        <div className="flex-1">
          <CompanyCard
            image={location.state?.docName == "mbMinOffer" ? rechargeImg : airdrop}
            title={location.state?.docName == "mbMinOffer" ? "MB + Minutes" : "Balance"}
            path="./../options"
            state={location.state?.docName === "mbMinOffer"
              ? { id: location.state?.id, companyName: location.state?.companyName, docName: "mbAndMinOffer", type: "offerCard", title: "MB & Minute Combo Offer" }
              : { id: location.state?.id, companyName: location.state?.companyName, docName: "balanceCard", title: "Balance Card" }}
          />
        </div>
      </div>
    </div>
  );
};

export default CardCategory;
