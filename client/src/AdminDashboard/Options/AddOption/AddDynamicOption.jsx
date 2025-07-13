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
  const [selectedServer, setSelectedServer] = useState("");

  // Define combo configurations for different servers
  const comboConfigs = {
    unipin: [
      { name: "25 💎", original: "25 Diamond", value: 25, quantity: 0 },
      { name: "50 💎", original: "50 Diamond", value: 50, quantity: 0 },
      { name: "115 💎", original: "115 Diamond", value: 115, quantity: 0 },
      { name: "240 💎", original: "240 Diamond", value: 240, quantity: 0 },
      { name: "610 💎", original: "610 Diamond", value: 610, quantity: 0 },
      { name: "1240 💎", original: "1240 Diamond", value: 1240, quantity: 0 },
      { name: "2530 💎", original: "2530 Diamond", value: 2530, quantity: 0 },
      { name: "Weekly", original: "Weekly Membership", value: 0, quantity: 0 },
      {
        name: "Monthly",
        original: "Monthly Membership",
        value: 0,
        quantity: 0,
      },
    ],
    my: [
      {
        name: "LU Pass - 6",
        original: "Level Up Package - Level 6",
        quantity: 0,
      },
      {
        name: "LU Pass - 10",
        original: "Level Up Package - Level 10",
        quantity: 0,
      },
      {
        name: "LU Pass - 15",
        original: "Level Up Package - Level 15",
        quantity: 0,
      },
      {
        name: "LU Pass - 20",
        original: "Level Up Package - Level 20",
        quantity: 0,
      },
      {
        name: "LU Pass - 25",
        original: "Level Up Package - Level 25",
        quantity: 0,
      },
      {
        name: "LU Pass - 30",
        original: "Level Up Package - Level 30",
        quantity: 0,
      },
      { name: "Evo 3D", original: "Evo Access 3D", quantity: 0 },
      { name: "Evo 7D", original: "Evo Access 7D", quantity: 0 },
      { name: "Evo 30D", original: "Evo Access 30D", quantity: 0 },
      { name: "Weekly", original: "Weekly Lite", quantity: 0 },
    ],
    indo: [
      { name: "5 💎", original: "5", quantity: 0 },
      { name: "50 💎", original: "50", quantity: 0 },
      { name: "70 💎", original: "70", quantity: 0 },
      { name: "140 💎", original: "140", quantity: 0 },
      { name: "350 💎", original: "350", quantity: 0 },
      { name: "720 💎", original: "720", quantity: 0 },
      { name: "7290 💎", original: "7.290", quantity: 0 },
      { name: "36500 💎", original: "36.500", quantity: 0 },
      { name: "73100 💎", original: "73.100", quantity: 0 },
      { name: "BP Card", original: "BP Card", quantity: 0 },
      { name: "Monthly", original: "Member Bulanan", quantity: 0 },
      { name: "Weekly", original: "Member Mingguan", quantity: 0 },
      { name: "LU Pass - 6", original: "Level Up Pass - Level 6", quantity: 0 },
      {
        name: "LU Pass - 10",
        original: "Level Up Pass - Level 10",
        quantity: 0,
      },
      {
        name: "LU Pass - 15",
        original: "Level Up Pass - Level 15",
        quantity: 0,
      },
      {
        name: "LU Pass - 20",
        original: "Level Up Pass - Level 20",
        quantity: 0,
      },
      {
        name: "LU Pass - 25",
        original: "Level Up Pass - Level 25",
        quantity: 0,
      },
      {
        name: "LU Pass - 30",
        original: "Level Up Pass - Level 30",
        quantity: 0,
      },
    ],
    sg: [
      { name: "Airdrop 1$", original: "Airdrop 1$", dollar: 1, quantity: 0 },
      { name: "Airdrop 2$", original: "Airdrop 2$", dollar: 2, quantity: 0 },
      { name: "Airdrop 3$", original: "Airdrop 3$", dollar: 3, quantity: 0 },
      { name: "Airdrop 4$", original: "Airdrop 4$", dollar: 4, quantity: 0 },
    ],
  };

  const [combo, setCombo] = useState(comboConfigs.unipin);
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
        console.log(data);
        setSubCategories(
          data.map((item) => ({
            id: item._id,
            title: item.title,
            category: item.category,
            isAuto: item.isAuto,
            server: item.server,
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
    if (selectedServer === "unipin") {
      const totalDiamond = combo.reduce(
        (sum, curr) => sum + (curr.value || 0) * curr.quantity,
        0
      );
      const totalWeekly =
        combo.find((item) => item.name === "Weekly")?.quantity || 0;
      const totalMonthly =
        combo.find((item) => item.name === "Monthly")?.quantity || 0;
      setComboSummary({
        diamond: totalDiamond,
        weekly: totalWeekly,
        monthly: totalMonthly,
      });
    } else if (selectedServer === "sg") {
      // For SG server, only one item can be selected with quantity 1
      const selectedItem = combo.find((item) => item.quantity > 0);
      const totalDollars = selectedItem ? selectedItem.dollar || 0 : 0;
      setComboSummary({
        diamond: totalDollars,
        weekly: 0,
        monthly: 0,
      });
    } else {
      // For other servers, just count total items
      const totalItems = combo.reduce((sum, curr) => sum + curr.quantity, 0);
      setComboSummary({
        diamond: totalItems,
        weekly: 0,
        monthly: 0,
      });
    }
  }, [combo, selectedServer]);

  // filter subCategory with selected category
  const handleSelectCategory = (e) => {
    const selectedCategory = e.target.value;
    const matchedSubCategories = subCategories.filter(
      (sub) => sub.category === selectedCategory
    );
    setFilteredSubCategories(matchedSubCategories);
  };

  // handle subcategory selection and update combo based on server
  const handleSelectSubCategory = (e) => {
    const selectedSubCategoryId = e.target.value;
    const selectedSubCategory = subCategories.find(
      (sub) => sub.id === selectedSubCategoryId
    );

    if (selectedSubCategory && selectedSubCategory.isAuto) {
      setIsAutoEnable(true);
      const server = selectedSubCategory.server;
      setSelectedServer(server);

      // Update combo based on server
      if (comboConfigs[server]) {
        setCombo([...comboConfigs[server]]);
      } else {
        // Default to unipin if server not found
        setCombo([...comboConfigs.unipin]);
      }
    } else {
      setIsAutoEnable(false);
      setSelectedServer("");
    }
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
    const willHaveQuantity = form.willHaveQuantity.checked;
    const newOption = {
      name,
      price,
      id,
      coin,
      stock,
      isAuto,
      willHaveQuantity,
    };

    if (isAuto) {
      const newCombo = combo.map((pack) => {
        if (selectedServer === "indo") {
          return {
            name: pack?.original || pack?.name,
            label: pack?.name,
            quantity: pack?.quantity,
          };
        } else if (selectedServer === "sg") {
          return {
            name: pack?.original || pack?.name,
            dollar: pack?.dollar,
            quantity: pack?.quantity,
          };
        } else {
          return {
            name: pack?.original || pack?.name,
            quantity: pack?.quantity,
          };
        }
      });
      newOption.combo = newCombo;
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
        selectedServer={selectedServer}
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
              onChange={handleSelectSubCategory}
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
              checked={isAutoEnable}
              disabled
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
                {selectedServer === "unipin"
                  ? "Total Diamond:"
                  : selectedServer === "sg"
                  ? "Selected Airdrop:"
                  : "Combo Items:"}
              </label>
              <div className="flex">
                <input
                  type="text"
                  name="combo"
                  required
                  disabled
                  className="block w-full py-1.5 !px-0.5 md:!px-2.5 font-medium border-2 border-gray-600 rounded-md !rounded-r-none"
                  placeholder={
                    selectedServer === "unipin"
                      ? "Example: 115"
                      : selectedServer === "sg"
                      ? "Select airdrop"
                      : "Selected items"
                  }
                  value={
                    selectedServer === "unipin"
                      ? `D-[${comboSummary?.diamond}] W-[${comboSummary?.weekly}] M-[${comboSummary?.monthly}]`
                      : selectedServer === "sg"
                      ? `$${comboSummary?.diamond}`
                      : `Items-[${comboSummary?.diamond}]`
                  }
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
