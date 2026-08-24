import { useEffect, useState } from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import ComboModal from "./ComboModal";
import comboConfigs, { comboRows } from "./comboConfigs";

const AddDynamicOption = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAutoEnable, setIsAutoEnable] = useState(false);
  const [isOpenCombo, setIsOpenCombo] = useState(false);
  const [selectedServer, setSelectedServer] = useState("");
  const [subTypes, setSubTypes] = useState([]);
  const axiosPublic = useAxiosPublic();

  const CENTRAL_SERVERS = ["unipin", "my", "sg", "indo"];

  // Load categories
  useEffect(() => {
    axiosPublic
      .get("/category")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Failed to load categories:", err));
  }, [axiosPublic]);

  const [combo, setCombo] = useState(() => comboRows("unipin"));
  const [comboSummary, setComboSummary] = useState({
    diamond: 0,
    weekly: 0,
    monthly: 0,
  });
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate(null);

  // subscription types for the per-type subscriber price inputs
  useEffect(() => {
    axiosPrivate
      .get("/subscription/admin/types")
      .then((res) => setSubTypes(res.data || []))
      .catch(() => {});
  }, [axiosPrivate]);

  // get subcategories
  useEffect(() => {
    axiosPrivate
      .get("/services")
      .then((res) => {
        const data = res?.data || [];
        // console.log(data);
        setSubCategories(
          data.map((item) => ({
            id: item._id,
            title: item.title,
            categoryId: item.categoryId,
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
    if (selectedServer === "unipin" || selectedServer ==="unipinNormal") {
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
      setComboSummary({
        package: selectedItem?.package,
        quantity: selectedItem?.quantity
      });
    } else if(selectedServer === "like"){
      const selectedItem = combo.find((item)=>item?.day>0);
      setComboSummary({
        package: selectedItem?.package || "",
        day: selectedItem?.day || 0,
        total: parseInt(selectedItem?.package) * selectedItem?.day || 0,
      })
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
      (sub) => sub.categoryId === selectedCategory
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

      // Update combo based on server (deep copy — see comboRows)
      if (comboConfigs[server]) {
        setCombo(comboRows(server));
      } else {
        // Default to unipin if server not found
        setCombo(comboRows("unipin"));
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
            package: pack?.package,
            quantity: pack?.quantity,
          };
        } else if (selectedServer === "sg") {
          return {
            name: pack?.name,
            package: pack?.package,
            quantity: pack?.quantity,
          };
        } else if(selectedServer === "unipin" || selectedServer === "unipinNormal") {
          return {
            name: pack?.original || pack?.name,
            uc: pack?.uc,
            quantity: pack?.quantity,
          };
        } else if(selectedServer === "my"){
          return {
            name: pack?.original || pack?.name,
            package: pack?.package,
            quantity: pack?.quantity,
          }
        }else if(selectedServer === "like"){
            return {
              name: pack?.name || "",
              package: pack?.package,
              day: pack?.day || 0,
            }
          }
      });
      newOption.combo = newCombo;
    }

    // Per-type subscriber prices (hidden for centrally priced servers)
    const subscriberPrices = {};
    for (const t of subTypes) {
      const val = form[`subscriberPrice_${t._id}`]?.value;
      if (val !== undefined && val !== "") {
        subscriberPrices[t._id] = parseInt(val) || 0;
      }
    }
    if (Object.keys(subscriberPrices).length) {
      newOption.subscriberPrices = subscriberPrices;
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
      <h1 className="bg-gradient-to-r from-primary to-secondary w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5 py-3">
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
                  key={category?._id}
                  value={category?._id}
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
          <div className={`space-y-2 flex items-center gap-2 ${selectedServer === "like" ? "invisible": ""}`}>
            <label htmlFor="willHaveQuantity" className="input-label !m-0">
              Will have Quantity:{" "}
            </label>
            <input
              key={selectedServer}
              type="checkbox"
              name="willHaveQuantity"
              className="toggle !m-0"
              defaultChecked={selectedServer==="unipinNormal"}
              disabled={selectedServer==="unipinNormal"}
            />
          </div>
          {isAutoEnable && CENTRAL_SERVERS.includes(selectedServer) ? (
            <div className="md:col-span-2 space-y-1">
              <p className="text-sm font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                Subscriber prices for this server are managed centrally on the{" "}
                <Link
                  to="/dashboard/subscriber-pricing"
                  className="underline font-semibold"
                >
                  Subscriber Pricing
                </Link>{" "}
                page — every combo's subscriber price is calculated from the
                per-unit prices automatically.
              </p>
            </div>
          ) : (
            subTypes.length > 0 && (
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xl font-medium text-gray-700">
                  Subscriber Prices (৳){" "}
                  <span className="text-sm font-normal text-gray-500">
                    — blank = normal price
                  </span>
                </label>
                <div className="flex flex-wrap gap-4">
                  {subTypes.map((t) => (
                    <div key={t._id} className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">
                        {t.name}
                      </label>
                      <input
                        type="number"
                        min="0"
                        name={`subscriberPrice_${t._id}`}
                        className="block w-40 py-1.5 px-3 font-medium border-2 border-gray-600 rounded-md"
                        placeholder="Normal price"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
          {isAutoEnable && (
            <div className="space-y-2">
              <label
                htmlFor="combo"
                className="block text-xl font-medium text-gray-700"
              >
                {selectedServer === "unipin"
                  ? "Total Diamond:"
                  : selectedServer === "like"
                  ? "Like Package:"
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
                      : "Selected items"
                  }
                  value={
                    (selectedServer === "unipin" || selectedServer === "unipinNormal")
                      ? `D-[${comboSummary?.diamond}] W-[${comboSummary?.weekly}] M-[${comboSummary?.monthly}]`
                      : selectedServer === "sg"
                      ? `Lite-${comboSummary?.quantity || 0}`
                      : selectedServer === "like"? `P-[${comboSummary?.package || ""}] D-[${comboSummary?.day || 0}] Total-[${comboSummary?.total || 0}]`: `Items-[${comboSummary?.diamond}]`
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
            className="bg-gradient-to-r from-primary to-secondary py-1.5 px-5 text-lg text-white font-semibold rounded block mx-auto"
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
