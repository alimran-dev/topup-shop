import { useLocation } from "react-router-dom";
import CompanyCard from "./CompanyCard";
import airdrop from "../../../assets/images/airdrop.jpeg";
import mbMinOffer from "../../../assets/images/recharge-offer.jpeg";

const CardCategory = () => {
  const location = useLocation();
  return (
    <div>
      <h2 className="text-center text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text py-3 -mt-5 w-fit mx-auto">
        Choose a Category
      </h2>
      <div className="grid grid-cols-3 md:flex md:flex-wrap justify-center items-stretch gap-2 md:gap-5 my-5">
        <div className="flex-1">
          <CompanyCard
            image={location?.state?.cardType == "offerCard" ? mbMinOffer : airdrop}
            title={location?.state?.cardType == "offerCard" ? "MB Offer" : "MB"}
            path="#"
            state={ location?.state?.cardType == "offerCard" ? 
              { id: location.state?.id, docName: "mbOffer", type: "category" } :
              { id: location.state?.id, docName: "mbCard", type: "category" }
            }
          />
        </div>
        <div className="flex-1">
          <CompanyCard
            image={location?.state?.cardType == "offerCard" ? mbMinOffer : airdrop}
            title={location?.state?.cardType == "offerCard" ? "Minute Offer" : "Minutes"}
            path="#"
            state={ location?.state?.cardType == "offerCard" ? 
              { id: location.state?.id, docName: "minOffer", type: "category" } :
              { id: location.state?.id, docName: "minCard", type: "category" }
            }
          />
        </div>
        <div className="flex-1">
          <CompanyCard
            image={location?.state?.cardType == "offerCard" ? mbMinOffer : airdrop}
            title={location?.state?.cardType == "offerCard" ? "MB & Minute Offer" : "Balance"}
            path="#"
            state={ location?.state?.cardType == "offerCard" ? 
              { id: location.state?.id, docName: "mbAndMinOffer", type: "category" } :
              { id: location.state?.id, docName: "balanceCard", type: "category" }
            }
          />
        </div>
      </div>
    </div>
  );
};

export default CardCategory;
