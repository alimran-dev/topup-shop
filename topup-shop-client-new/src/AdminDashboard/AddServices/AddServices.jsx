import { useState } from "react";
import TopupAndUnipinForm from "./forms/TopupAndUnipinForm";

const AddServices = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [
    {
      id: 1,
      category: "Recharge & Offers",
    },
    {
      id: 2,
      category: "FF Topup & Unipin",
    },
    {
      id: 3,
      category: "Telegram packages",
    },
    {
      id: 4,
      category: "LIKE - FOLLOW - SUBSCRIBE",
    },
    {
      id: 5,
      category: "SUBSCRIPTION",
    },
  ];

  const handleCategoryClick = (id) => {
    setSelectedCategory(id);
  };

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
            <h2 className="text-2xl font-bold mb-4">Recharge & Offers</h2>

            <form>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="topupAmount"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Top-up Amount
                  </label>
                  <input
                    type="text"
                    id="topupAmount"
                    className="block w-full px-4 py-2 border rounded-md"
                    placeholder="Enter top-up amount"
                  />
                </div>
                <div>
                  <label
                    htmlFor="paymentMethod"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    className="block w-full px-4 py-2 border rounded-md"
                  >
                    <option value="creditCard">Credit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bankTransfer">Bank Transfer</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-white px-6 py-2 rounded-md font-medium"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        )}
        {selectedCategory === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">FF Topup & Unipin</h2>
            <TopupAndUnipinForm category={"FF Topup & Unipin"} />
          </div>
        )}
        {selectedCategory === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Telegram Packages</h2>
            {/* Add your form or content here */}
          </div>
        )}
        {selectedCategory === 4 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Like, Follow, Subscribe</h2>
            {/* Add your form or content here */}
          </div>
        )}
        {selectedCategory === 5 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Subscription</h2>
            {/* Add your form or content here */}
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
