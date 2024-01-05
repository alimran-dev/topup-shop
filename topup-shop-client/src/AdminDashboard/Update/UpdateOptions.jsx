import unipin from "../../assets/images/unipin.jpg";
import idcode from "../../assets/images/idcode.png";
import weekly from "../../assets/images/weekly.png";
import shell from "../../assets/images/shell.jpg";
import ServiceCard from "../../pages/Home/Services/ServiceCard";
import { useNavigate } from "react-router-dom";

const UpdateOptions = () => {
  const navigate = useNavigate();
  return (
    <div className="-mt-5">
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5 py-4">
        Select to Update
      </h1>
      <div className="flex flex-wrap justify-center gap-5 my-5">
        <div onClick={()=>navigate('./unipin')} className="flex-1">
          <ServiceCard image={unipin} title="Unipin Voucher(BDT)" />
        </div>
        <div onClick={()=>navigate('./idcode')} className="flex-1">
          <ServiceCard image={idcode} title="IDCODE Topup [BD SERVER]" />
        </div>
        <div onClick={()=>navigate('./weekly-monthly')} className="flex-1">
          <ServiceCard image={weekly} title="Weekly & Monthly [ Offer ]" />
        </div>
        <div onClick={()=> navigate('./shell')} className="flex-1">
          <ServiceCard image={shell} title="Garena Shell Code (MY)" />
        </div>
      </div>
    </div>
  );
};

export default UpdateOptions;
