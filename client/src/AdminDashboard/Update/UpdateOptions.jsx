import unipin from "../../assets/images/unipin.jpg";
import shell from "../../assets/images/shell.jpg";
import ServiceCard from "../../pages/Home/Services/ServiceCard";
import rechargeCard from "../../assets/images/recharge-card.jpeg";
import rechargeOffer from "../../assets/images/recharge-offer.jpeg";

const UpdateOptions = () => {
  return (
    <div className="-mt-5">
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5 py-4">
        Select to Update
      </h1>
      <div className="grid grid-cols-3 md:flex md:flex-wrap justify-center gap-2 md:gap-5 my-5">
        <div className="flex-1">
          <ServiceCard
            path="./unipin"
            image={unipin}
            title="Unipin Voucher(BDT)"
          />
        </div>
        <div className="flex-1">
          <ServiceCard
            path="./shell"
            image={shell}
            title="Garena Shell Code (MY)"
          />
        </div>
        <div className="flex-1">
          <ServiceCard
            path="./cards"
            image={rechargeCard}
            title="Recharge Card [All Sim]"
          />
        </div>
        <div className="flex-1">
          <ServiceCard
            path="./"
            image={rechargeOffer}
            title="Minutes & MB offer [All Sim]"
          />
        </div>
      </div>
    </div>
  );
};

export default UpdateOptions;
