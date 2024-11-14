import ServiceCard from "./ServiceCard";
import unipin from "../../../assets/images/unipin.jpg";
import idcode from "../../../assets/images/idcode.png";
import weekly from "../../../assets/images/weekly.png";
import shell from "../../../assets/images/shell.jpg";
import rechargeCard from "../../../assets/images/recharge-card.jpeg";
import rechargeOffer from "../../../assets/images/recharge-offer.jpeg";
import specialOffer from "../../../assets/images/special_offer.jpeg";
import airdrop from "../../../assets/images/airdrop.jpeg";
import lessIsMore from "../../../assets/images/lessIsMore.jpeg";

const Services = () => {
  return (
    <>
      <div className="flex items-center justify-center">
        <span className="block border-t-2 border-[#FA6023] flex-1 translate-y-1/2"></span>
        <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5">
          Our Services
        </h1>
        <span className="block border-t-2 border-[#FA6023] flex-1"></span>
      </div>
      <div className="grid grid-cols-3 md:flex md:flex-wrap justify-center items-stretch gap-2 md:gap-5 my-5">
        <div className="flex-1">
          <ServiceCard image={unipin} path="/unipin" title="Unipin Voucher (BDT)" />
        </div>
        <div className="flex-1">
          <ServiceCard image={airdrop} path="/uid-airdrop" title="Free Fire  UID [ Airdrop ]" />
        </div>
        
        <div className="flex-1">
          <ServiceCard image={idcode} path="/idcode" title="IDCODE Topup [BD SERVER]" />
        </div>
        <div className="flex-1">
          <ServiceCard image={weekly} path="/weekly-monthly" title="Weekly & Monthly [Offer]" />
        </div>
        <div className="flex-1">
          <ServiceCard image={lessIsMore} path="/less-is-more" title="Less Is More UID" />
        </div>
        <div className="flex-1">
          <ServiceCard image={shell} path="/shell" title="Garena Shell Code (MY)" />
        </div>
        <div className="flex-1">
          <ServiceCard image={specialOffer} path="/special-offer" title="All Special Offer" />
        </div>
        <div className="flex-1">
          <ServiceCard image={rechargeCard} path="#" title="Recharge Card [All sim]" />
        </div>
        <div className="flex-1">
          <ServiceCard image={rechargeOffer} path="#" title="Minutes & MB offer [All sim]" />
        </div>
      </div>
    </>
  );
};

export default Services;
