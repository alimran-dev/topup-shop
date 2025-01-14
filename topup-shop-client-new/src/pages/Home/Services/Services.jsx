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
import { useEffect, useState } from "react";
import useAxiosPublic from "../../../hooks/useAxiosPublic";

const Services = () => {

  const [data, setData] = useState([]);
  const [ffData, setFfData] = useState([]);

  const axiosPublic = useAxiosPublic();

  useEffect(() => {
    axiosPublic.get("/services").then((res) => {
      setData(res?.data);
      const ffallData = res?.data?.filter(data => data?.category == 'FF Topup & Unipin');
      setFfData(ffallData);

    });
  }, [axiosPublic, data]);

  return (
    <>
      <div>
        <div className="flex items-center justify-center">
          <span className="block border-t-2 border-[#FA6023] flex-1 translate-y-1/2"></span>
          <h1 className="title px-4">
            FF Topup & Unipin
          </h1>
          <span className="block border-t-2 border-[#FA6023] flex-1"></span>
        </div>
        <div className="grid grid-cols-3 md:flex md:flex-wrap justify-center items-stretch gap-2 md:gap-5 my-5">
          <div className="flex-1">
            <ServiceCard
              image={unipin}
              path="/unipin"
              title="Unipin Voucher (BDT)"
            />
          </div>
          {
            ffData?.map(data =>
              <div className="flex-1" key={data?._id}>
                <ServiceCard
                  image={unipin}
                  path="/unipin"
                  title={data?.title}
                />
              </div>
            )
          }
          <div className="flex-1">
            <ServiceCard
              image={shell}
              path="/shell"
              title="Garena Shell Code (MY)"
            />
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-center">
          <span className="block border-t-2 border-[#FA6023] flex-1 translate-y-1/2"></span>
          <h1 className="title px-4">
            Our Services
          </h1>
          <span className="block border-t-2 border-[#FA6023] flex-1"></span>
        </div>
        <div className="grid grid-cols-3 md:flex md:flex-wrap justify-center items-stretch gap-2 md:gap-5 my-5">
          <div className="flex-1">
            <ServiceCard
              image={airdrop}
              path="/uid-airdrop"
              title="Free Fire  UID [ Airdrop ]"
            />
          </div>

          <div className="flex-1">
            <ServiceCard
              image={idcode}
              path="/idcode"
              title="IDCODE Topup [BD SERVER]"
            />
          </div>
          <div className="flex-1">
            <ServiceCard
              image={weekly}
              path="/weekly-monthly"
              title="Weekly & Monthly [Offer]"
            />
          </div>
          <div className="flex-1">
            <ServiceCard
              image={lessIsMore}
              path="/less-is-more"
              title="Less Is More UID"
            />
          </div>
          <div className="flex-1">
            <ServiceCard
              image={specialOffer}
              path="/special-offer"
              title="All Special Offer"
            />
          </div>
          <div className="flex-1">
            <ServiceCard
              image={rechargeCard}
              path="/cards/companies"
              title="Recharge Card [All sim]"
            />
          </div>
          <div className="flex-1">
            <ServiceCard
              image={rechargeOffer}
              path="#"
              title="Minutes & MB offer [All sim]"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Services;
