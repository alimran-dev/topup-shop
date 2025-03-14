import { useLocation } from "react-router-dom";
import CompanyCard from "../SimCompanies/CompanyCard";
import airdrop from "../../assets/images/airdrop.jpeg";
import rechargeImg from "../../assets/images/recharge-card.jpeg";


const CardCategory = () => {
  const location = useLocation();
  console.log(location.state);
  return (
    <div>
      <h2 className="text-center text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text py-3 -mt-5 w-fit mx-auto">
        Choose a Category
      </h2>
      <div className="grid grid-cols-3 md:flex md:flex-wrap justify-center items-stretch gap-2 md:gap-5 my-5">
        <div className="flex-1">
          <CompanyCard
            image={location.state?.docName == "mbMinCombo" ? rechargeImg : airdrop}
            title={"MB"}
            path="./../options"
            state={{ id: location.state?.id, docName: location.state?.docName ? location.state.docName : "mbCard" }}
          />
        </div>
        <div className="flex-1">
          <CompanyCard
            image={location.state?.docName == "mbMinCombo" ? rechargeImg : airdrop}
            title={"Minutes"}
            path="./../options"
            state={{ id: location.state?.id, docName: location.state?.docName ? location.state.docName : "mbCard" }}
          />
        </div>
        <div className="flex-1">
          <CompanyCard
            image={location.state?.docName == "mbMinCombo" ? rechargeImg : airdrop}
            title={location.state?.docName == "mbMinCombo" ? "MB + Minutes" : "Balance"}
            path="./../options"
            state={{ id: location.state?.id, docName: location.state?.docName ? location.state.docName : "mbCard" }}
          />
        </div>
      </div>
    </div>
  );
};

export default CardCategory;
