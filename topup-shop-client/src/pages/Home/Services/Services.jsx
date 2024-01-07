import ServiceCard from "./ServiceCard";
import unipin from "../../../assets/images/unipin.jpg";
import idcode from "../../../assets/images/idcode.png";
import weekly from "../../../assets/images/weekly.png";
import shell from "../../../assets/images/shell.jpg";
import offer1 from "../../../assets/images/banner4.jpeg";
import offer2 from "../../../assets/images/banner5.jpeg";
import { useNavigate } from "react-router-dom";

const Services = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="flex items-center justify-center">
        <span className="block border-t-2 border-[#FA6023] flex-1 translate-y-1/2"></span>
        <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5">
          Our Services
        </h1>
        <span className="block border-t-2 border-[#FA6023] flex-1"></span>
      </div>
      <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-5 my-5">
        <div onClick={()=>navigate('/unipin')} className="flex-1">
          <ServiceCard image={unipin} title="Unipin Voucher(BDT)" />
        </div>
        <div onClick={()=>navigate('/idcode')} className="flex-1">
          <ServiceCard image={idcode} title="IDCODE Topup [BD SERVER]" />
        </div>
        <div onClick={()=>navigate('/weekly-monthly')} className="flex-1">
          <ServiceCard image={weekly} title="Weekly & Monthly [Offer]" />
        </div>
        <div onClick={()=> navigate('/shell')} className="flex-1">
          <ServiceCard image={shell} title="Garena Shell Code (MY)" />
        </div>
        <div className="flex-1">
          <ServiceCard image={offer1} title="Recharge Card [All sim]" />
        </div>
        <div className="flex-1">
          <ServiceCard image={offer2} title="Minutes & MB offer [All sim]" />
        </div>
      </div>
    </>
  );
};

export default Services;
