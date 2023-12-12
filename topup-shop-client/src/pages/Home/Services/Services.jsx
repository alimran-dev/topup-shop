import ServiceCard from "./ServiceCard";
import unipin from "../../../assets/images/unipin.jpg";
import idcode from "../../../assets/images/idcode.png";
import weekly from "../../../assets/images/weekly.png";
import shell from "../../../assets/images/shell.jpg";

const Services = () => {
  return (
    <div className="my-10">
      <div className="flex items-center justify-center">
        <span className="block border-t-2 border-[#FA6023] flex-1 translate-y-1/2"></span>
        <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5">
          Our Services
        </h1>
        <span className="block border-t-2 border-[#FA6023] flex-1"></span>
      </div>
      <div className="flex justify-around flex-wrap gap-5 my-5">
        <ServiceCard image={unipin} title="Unipin Voucher(BDT)" />
        <ServiceCard image={idcode} title="IDCODE Topup [BD SERVER]" />
        <ServiceCard image={weekly} title="Weekly & Monthly [ Offer ]" />
        <ServiceCard image={shell} title="Garena Shell Code (MY)" />
      </div>
    </div>
  );
};

export default Services;
