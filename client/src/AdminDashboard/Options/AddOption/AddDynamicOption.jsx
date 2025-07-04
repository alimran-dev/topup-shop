import { useEffect, useState } from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import toast from "react-hot-toast";
import { allCategories } from "../../../utils/categories";
import { useNavigate } from "react-router-dom";
import ComboModal from "./ComboModal";

const AddDynamicOption = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAutoEnable, setIsAutoEnable] = useState(false);
  const [isOpenCombo, setIsOpenCombo] = useState(false);
  const [combo, setCombo] = useState([
    { name: "25 💎", original: "25 Diamond", value: 25, quantity: 0 },
    { name: "50 💎", original: "50 Diamond", value: 50, quantity: 0 },
    { name: "115 💎", original: "115 Diamond", value: 115, quantity: 0 },
    { name: "240 💎", original: "240 Diamond", value: 240, quantity: 0 },
    { name: "610 💎", original: "610 Diamond", value: 610, quantity: 0 },
    { name: "1240 💎", original: "1240 Diamond", value: 1240, quantity: 0 },
    { name: "2530 💎", original: "2530 Diamond", value: 2530, quantity: 0 },
    { name: "Weekly", original: "Weekly Membership", value: 0, quantity: 0 },
    { name: "Monthly", original: "Monthly Membership", value: 0, quantity: 0 },
  ]);
  const [comboSummary, setComboSummary] = useState({
    diamond: 0,
    weekly: 0,
    monthly: 0,
  });
  const axiosPrivate = useAxiosPrivate();
  const categories = allCategories();
  const navigate = useNavigate(null);

  // get subcategories
  useEffect(() => {
    axiosPrivate
      .get("/services")
      .then((res) => {
        const data = res?.data || [];
        setSubCategories(
          data.map((item) => ({
            id: item._id,
            title: item.title,
            category: item.category,
          }))
        );
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to load categories");
      });
  }, [axiosPrivate]);

  // make new combo summary
  useEffect(() => {
    const totalDiamond = combo.reduce(
      (sum, curr) => sum + curr.value * curr.quantity,
      0
    );
    const totalWeekly = combo[7].quantity;
    const totalMonthly = combo[8].quantity;
    // console.log("totalDiamond: ",totalDiamond, "totalWeekly: ", totalWeekly, "totalMonthly: ",totalMonthly);
    setComboSummary({
      diamond: totalDiamond,
      weekly: totalWeekly,
      monthly: totalMonthly,
    });
  }, [combo]);

  // filter subCategory with selected category
  const handleSelectCategory = (e) => {
    const selectedCategory = e.target.value;
    const matchedSubCategories = subCategories.filter(
      (sub) => sub.category === selectedCategory
    );
    setFilteredSubCategories(matchedSubCategories);
  };

  // add new option fn
  const handleAdd = (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;
    const name = form.name.value;
    const price = parseInt(form.price.value) || 0;
    const id = form.subCategory.value;
    const coin = form.coin.value;
    const stock = form.stock.value;
    const isAuto = isAutoEnable;
    const willHaveQuantity= form.willHaveQuantity.checked;
    const newOption = { name, price, id, coin, stock, isAuto, willHaveQuantity };

    if(isAuto){
        const newCombo = combo.map(pack=>{return {name: pack?.original, quantity: pack?.quantity}});
        newOption.combo=newCombo;
    }

    // console.log(newOption);
    // setLoading(false);

    axiosPrivate.post("/option/admin/dynamic/add", newOption).then((res) => {
      if (res.data.acknowledged) {
        toast.success("Option Added Successfully!");
        setLoading(false);
        form.reset();
        navigate("/dashboard/options");
      } else {
        toast.error(res.data?.message || "Something Went Wrong!");
        setLoading(false);
      }
    });
  };

  return (
    <div>
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5 py-3">
        Add Dynamic Option
      </h1>
      <ComboModal
        combo={combo}
        setCombo={setCombo}
        isOpenCombo={isOpenCombo}
        setIsOpenCombo={setIsOpenCombo}
      />
      <form onSubmit={handleAdd} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5 md:w-2/3 mx-auto items-center justify-center">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-xl font-medium text-gray-700"
            >
              Option Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
              placeholder="Example: 20 UC"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="price"
              className="block text-xl font-medium text-gray-700"
            >
              Option Price
            </label>
            <input
              type="number"
              name="price"
              required
              className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
              placeholder="Example: 50"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="uc"
              className="block text-xl font-medium text-gray-700"
            >
              Select Category
            </label>
            <select
              name="category"
              className="py-1.5 px-3 w-full border-2 border-gray-600 rounded-md block font-medium cursor-pointer"
              defaultValue={""}
              required
              onChange={(e) => handleSelectCategory(e)}
            >
              <option
                value=""
                className="bg-white hover:bg-red-500 focus:bg-red-500"
                disabled
              >
                Choose One
              </option>
              {categories?.map((category) => (
                <option
                  key={category?.id}
                  value={category?.title}
                  className="bg-white hover:bg-red-500 focus:bg-red-500"
                >
                  {category?.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="category"
              className="block text-xl font-medium text-gray-700"
            >
              Choose Sub-Category
            </label>
            <select
              name="subCategory"
              className="py-1.5 px-3 w-full border-2 border-gray-600 rounded-md block font-medium cursor-pointer"
              required
              defaultValue={""}
            >
              <option
                value=""
                className="bg-white hover:bg-red-500 focus:bg-red-500"
                disabled
              >
                Choose One
              </option>
              {filteredSubCategories?.map((subCategory) => (
                <option
                  key={subCategory?.id}
                  value={subCategory?.id}
                  className="bg-white hover:bg-red-500 focus:bg-red-500"
                >
                  {subCategory?.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="coin"
              className="block text-xl font-medium text-gray-700"
            >
              Bonus Coin Amount
            </label>
            <input
              type="number"
              name="coin"
              required
              className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
              placeholder="Example: 100"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="coin"
              className="block text-xl font-medium text-gray-700"
            >
              Stock
            </label>
            <input
              type="number"
              name="stock"
              required
              className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
              placeholder="Example: 25"
            />
          </div>
          <div className="space-y-2 flex items-center gap-2">
            <label htmlFor="isAuto" className="input-label !m-0">
              Is this option for Auto Topup:{" "}
            </label>
            <input
              type="checkbox"
              name="isAuto"
              className="toggle !m-0"
              onChange={(e) => setIsAutoEnable(e.target.checked)}
            />
          </div>
          <div className="space-y-2 flex items-center gap-2">
            <label htmlFor="willHaveQuantity" className="input-label !m-0">
              Will have Quantity:{" "}
            </label>
            <input
              type="checkbox"
              name="willHaveQuantity"
              className="toggle !m-0"
            />
          </div>
          {isAutoEnable && (
            <div className="space-y-2">
              <label
                htmlFor="combo"
                className="block text-xl font-medium text-gray-700"
              >
                Total Diamond:
              </label>
              <div className="flex">
                <input
                  type="text"
                  name="combo"
                  required
                  disabled
                  className="block w-full py-1.5 !px-0.5 md:!px-2.5 font-medium border-2 border-gray-600 rounded-md !rounded-r-none"
                  placeholder="Example: 115"
                  value={`D-[${comboSummary?.diamond}] W-[${comboSummary?.weekly}] M-[${comboSummary?.monthly}]`}
                />
                <button
                  className="button !rounded-l-none"
                  type="button"
                  onClick={() => {
                    setIsOpenCombo(!isOpenCombo);
                  }}
                >
                  Combo
                </button>
              </div>
            </div>
          )}
        </div>
        <div>
          <button
            type="submit"
            className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 text-lg text-white font-semibold rounded block mx-auto"
            disabled={loading}
          >
            {loading ? "Please wait" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDynamicOption;
