import unipin from "../../assets/images/unipin.jpg";
import idcode from "../../assets/images/idcode.png";
import weekly from "../../assets/images/weekly.png";
import shell from "../../assets/images/shell.jpg";
import specialOffer from "../../assets/images/special_offer.jpeg";
import ServiceCard from "../../pages/Home/Services/ServiceCard";

const UpdateOptions = () => {
  return (
    <div className="-mt-5">
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5 py-4">
        Select to Update
      </h1>
      <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-5 my-5">
        <div className="flex-1">
          <ServiceCard
            path="./unipin"
            image={unipin}
            title="Unipin Voucher(BDT)"
          />
        </div>
        <div className="flex-1">
          <ServiceCard
            path="/dashboard/updateSpecialOption"
            image={specialOffer}
            title="All Special Offer"
          />
        </div>
        <div className="flex-1">
          <ServiceCard
            path="./idcode"
            image={idcode}
            title="IDCODE Topup [BD SERVER]"
          />
        </div>
        <div className="flex-1">
          <ServiceCard
            path="./weekly-monthly"
            image={weekly}
            title="Weekly & Monthly [ Offer ]"
          />
        </div>
        <div className="flex-1">
          <ServiceCard
            path="./shell"
            image={shell}
            title="Garena Shell Code (MY)"
          />
        </div>
      </div>
    </div>
  );
};

export default UpdateOptions;
