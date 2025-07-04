import { useEffect, useState } from "react";
import TopupAndUnipinForm from "./forms/TopupAndUnipinForm";
import RechargeAndOffersForm from "./forms/RechargeAndOffersForm";
import TelegramPackagesForm from "./forms/TelegramPackagesForm";
import LikeFollowSubscribeForm from "./forms/LikeFollowSubscribeForm";
import SubscriptionForm from "./forms/SubscriptionForm";
import { allCategories } from "../../utils/categories";

const AddServices = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = allCategories()

  const handleCategoryClick = (id) => {
    setSelectedCategory(id);
  };

  // page apear from top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center py-4">
          Add Services
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {categories.map((item) => (
            <button
              key={item.id}
              onClick={() => handleCategoryClick(item.id)}
              className={`p-4 rounded-md font-medium text-lg ${
                selectedCategory === item.id
                  ? "bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {item.category}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        {selectedCategory === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#fa6023]">
              Recharge & Offers
            </h2>

            <RechargeAndOffersForm category={"Recharge & Offers"} />
          </div>
        )}
        {selectedCategory === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#fa6023]">
              FF Topup & Unipin
            </h2>
            <TopupAndUnipinForm category={"FF Topup & Unipin"} />
          </div>
        )}
        {selectedCategory === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#fa6023]">
              Telegram Packages
            </h2>
            <TelegramPackagesForm category={"Telegram Packages"} />
          </div>
        )}
        {selectedCategory === 4 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#fa6023]">
              Like - Follow - Subscribe
            </h2>
            <LikeFollowSubscribeForm category={"Like - Follow - Subscribe"} />
          </div>
        )}
        {selectedCategory === 5 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#fa6023]">
              Subscription
            </h2>
            <SubscriptionForm category={"Subscription"} />
          </div>
        )}
        {!selectedCategory && (
          <p className="text-center text-gray-500">
            Please select a category to add a service.
          </p>
        )}
      </div>
    </div>
  );
};

export default AddServices;
