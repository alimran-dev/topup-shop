import ServiceCard from "./ServiceCard";
import shell from "../../../assets/images/shell.jpg";
import rechargeCard from "../../../assets/images/recharge-card.jpeg";
import rechargeOffer from "../../../assets/images/recharge-offer.jpeg";
import rechargeBalance from "../../../assets/images/recharge-balance.jpeg";
import { useEffect, useState } from "react";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import { useNavigate } from "react-router-dom";

const Services = () => {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch categories
    axiosPublic
      .get("/category")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Failed to load categories:", err));

    // Fetch only active services
    axiosPublic
      .get("/services?activeOnly=true")
      .then((res) => setServices(res.data))
      .catch((err) => console.error("Failed to load services:", err));
  }, [axiosPublic]);

  return (
    <div className="md:py-8 space-y-5 md:space-y-10">
      {/* -------- recharge and offers services (hardcoded) --------- */}
      <div>
        <div className="flex items-center justify-center">
          <span className="block border-t-2 border-[#FA6023] flex-1 translate-y-1/2"></span>
          <h1 className="title px-4">Recharge and Offers</h1>
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
          <div
            onClick={() =>
              navigate("/cards/companies", { state: "mbMinOffer" })
            }
            className="flex-1"
          >
            <ServiceCard
              image={rechargeOffer}
              path="/cards/companies"
              title="Minutes & MB offer"
            />
          </div>
          {/* new manual recharge card */}
          <div className="flex-1">
            <ServiceCard
              image={rechargeBalance}
              path="/mobile-recharge"
              title="Balance Recharge"
            />
          </div>
        </div>
      </div>

      {/* -------- dynamic categories and subcategories --------- */}
      {categories.filter(c => c.isActive !== false).map((category) => {
        const categoryServices = services.filter(
          (s) => s.categoryId === category._id
        );

        // Skip "Recharge & Offers" category since it's hardcoded above
        if (category.title === "Recharge & Offers") return null;

        if (categoryServices.length === 0) return null;

        return (
          <div key={category._id}>
            <div className="flex items-center justify-center">
              <span className="block border-t-2 border-[#FA6023] flex-1 translate-y-1/2"></span>
              <h1 className="title px-4">{category.title}</h1>
              <span className="block border-t-2 border-[#FA6023] flex-1"></span>
            </div>
            <div className="grid grid-cols-3 md:flex md:flex-wrap justify-center items-stretch gap-2 md:gap-5 my-5">
              {categoryServices.map((data) => (
                <div className="flex-1" key={data?._id}>
                  <ServiceCard
                    image={data?.image}
                    path={`/subCategory/${data?._id}`}
                    title={data?.title}
                    onClick={() => {
                      if (data?.childCount > 0) {
                        navigate(`/nested-services/${data?._id}`);
                      } else {
                        navigate(`/subCategory/${data?._id}`);
                      }
                    }}
                  />
                </div>
              ))}
              {/* Add Shell card under FF Topup & Unipin */}
              {category.title === "FF Topup & Unipin" && (
                <div className="flex-1">
                  <ServiceCard
                    image={shell}
                    path="/shell"
                    title="Garena Shell Code (MY)"
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Services;