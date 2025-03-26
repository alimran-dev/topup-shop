import ServiceCard from "./ServiceCard";
import unipin from "../../../assets/images/unipin.jpg";
import shell from "../../../assets/images/shell.jpg";
import rechargeCard from "../../../assets/images/recharge-card.jpeg";
import rechargeOffer from "../../../assets/images/recharge-offer.jpeg";
import { useEffect, useState } from "react";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import { useNavigate } from "react-router-dom";

const Services = () => {
  const [ffData, setFfData] = useState([]);
  const [telegramData, setTelegramData] = useState([]);
  const [likeFollowData, setLikeFollowData] = useState([]);
  const [subscriptionData, setSubsscriptionData] = useState([]);
  const [othersData, setOthersData] = useState([]);
  const axiosPublic = useAxiosPublic();
  const navigate  = useNavigate();

  useEffect(() => {
    axiosPublic.get("/services").then((res) => {
      const ffallData = res?.data?.filter(data => data?.category == 'FF Topup & Unipin');
      const telegramAllData = res?.data?.filter(data => data?.category == 'Telegram Packages');
      const likeFollowAllData = res?.data?.filter(data => data?.category == 'Like - Follow - Subscribe');
      const subscriptionallData = res?.data?.filter(data => data?.category == 'Subscription');
      const othersAllData = res?.data?.filter(data => data?.category == 'Others');
      setFfData(ffallData);
      setTelegramData(telegramAllData);
      setLikeFollowData(likeFollowAllData);
      setSubsscriptionData(subscriptionallData);
      setOthersData(othersAllData);
    });
  }, [axiosPublic]);


  return (
    <div className="md:py-8 space-y-5 md:space-y-10">

      {/* -------- recharge and offers services --------- */}
      <div>
        <div className="flex items-center justify-center">
          <span className="block border-t-2 border-[#FA6023] flex-1 translate-y-1/2"></span>
          <h1 className="title px-4">
            Recharge and Offers
          </h1>
          <span className="block border-t-2 border-[#FA6023] flex-1"></span>
        </div>
        <div className="grid grid-cols-3 md:flex md:flex-wrap justify-center items-stretch gap-2 md:gap-5 my-5">
          <div className="flex-1">
            <ServiceCard
              image={rechargeCard}
              path="/cards/companies"
              title="Recharge Card [All sim]"
            />
          </div>
          {/* new mb min combo card */}
          <div onClick={() => navigate("/cards/companies", {state: "mbMinCombo"})} className="flex-1">
            <ServiceCard
              image={rechargeOffer}
              path="/cards/companies"
              title="Minutes & MB offer"
            />
          </div>
          {/* new manual recharge card */}
          <div className="flex-1">
            <ServiceCard
              image={rechargeOffer}
              path="/mobile-recharge"
              title="Balance Recharge"
            />
          </div>
        </div>
      </div>

      {/* -------- ff services --------- */}
      {
        ffData?.length > 0 && (
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
                      image={data?.image}
                      path={`/subCategory/${data?._id}`}
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
        )
      }

      {/* -------- telegram services --------- */}
      {
        telegramData?.length > 0 && (
          <div>
            <div className="flex items-center justify-center">
              <span className="block border-t-2 border-[#FA6023] flex-1 translate-y-1/2"></span>
              <h1 className="title px-4">
                Telegram Packages
              </h1>
              <span className="block border-t-2 border-[#FA6023] flex-1"></span>
            </div>
            <div className="grid grid-cols-3 md:flex md:flex-wrap justify-center items-stretch gap-2 md:gap-5 my-5">
              {
                telegramData?.map(data =>
                  <div className="flex-1" key={data?._id}>
                    <ServiceCard
                      image={data?.image}
                      path={`/subCategory/${data?._id}`}
                      title={data?.title}
                    />
                  </div>
                )
              }
            </div>
          </div>
        )
      }

      {/* -------- like follow services --------- */}
      {
        likeFollowData?.length > 0 && (
          <div>
            <div className="flex items-center justify-center">
              <span className="block border-t-2 border-[#FA6023] flex-1 translate-y-1/2"></span>
              <h1 className="title px-4">
                Like - Follow - Subscribe
              </h1>
              <span className="block border-t-2 border-[#FA6023] flex-1"></span>
            </div>
            <div className="grid grid-cols-3 md:flex md:flex-wrap justify-center items-stretch gap-2 md:gap-5 my-5">
              {
                likeFollowData?.map(data =>
                  <div className="flex-1" key={data?._id}>
                    <ServiceCard
                      image={data?.image}
                      path={`/subCategory/${data?._id}`}
                      title={data?.title}
                    />
                  </div>
                )
              }
            </div>
          </div>
        )
      }

      {/* -------- subscription services --------- */}
      {
        subscriptionData?.length > 0 && (
          <div>
            <div className="flex items-center justify-center">
              <span className="block border-t-2 border-[#FA6023] flex-1 translate-y-1/2"></span>
              <h1 className="title px-4">
                Subscription
              </h1>
              <span className="block border-t-2 border-[#FA6023] flex-1"></span>
            </div>
            <div className="grid grid-cols-3 md:flex md:flex-wrap justify-center items-stretch gap-2 md:gap-5 my-5">
              {
                subscriptionData?.map(data =>
                  <div className="flex-1" key={data?._id}>
                    <ServiceCard
                      image={data?.image}
                      path={`/subCategory/${data?._id}`}
                      title={data?.title}
                    />
                  </div>
                )
              }
            </div>
          </div>
        )
      }

      {/* -------- others services --------- */}
      {
        othersData?.length > 0 && (
          <div>
            <div className="flex items-center justify-center">
              <span className="block border-t-2 border-[#FA6023] flex-1 translate-y-1/2"></span>
              <h1 className="title px-4">
                Others
              </h1>
              <span className="block border-t-2 border-[#FA6023] flex-1"></span>
            </div>
            <div className="grid grid-cols-3 md:flex md:flex-wrap justify-center items-stretch gap-2 md:gap-5 my-5">
              {
                othersData?.map(data =>
                  <div className="flex-1" key={data?._id}>
                    <ServiceCard
                      image={data?.image}
                      path={`/subCategory/${data?._id}`}
                      title={data?.title}
                    />
                  </div>
                )
              }
            </div>
          </div>
        )
      }

    </div>
  );
};

export default Services;
