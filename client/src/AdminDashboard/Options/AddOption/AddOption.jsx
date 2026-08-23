import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import AddDynamicOption from "./AddDynamicOption";

const AddOption = () => {
  const [error, setError] = useState("");
  const [error2, setError2] = useState("");
  const [rechargeCategory, setRechargeCategory] = useState("card");
  const [subTypes, setSubTypes] = useState([]);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    axiosPrivate
      .get("/subscription/admin/types")
      .then((res) => setSubTypes(res.data || []))
      .catch(() => {});
  }, [axiosPrivate]);


  const handleAdd = (e) => {
    e.preventDefault();
    setError("");
    const form = e.target;
    const name = form.name.value;
    const price = parseInt(form.price.value) || 0;
    const uc = parseInt(form.uc.value) || 0;
    const category = form.category.value;
    const coin = form.coin.value;
    const option = { name, price, category, uc, coin };
    // console.log(option);
    axiosPrivate.post(`/option/admin/add/${category}`, option).then((res) => {
      if (res.data.insertedId) {
        Swal.fire({
          position: "top",
          icon: "success",
          title: `${category} option added.`,
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
        form.reset();
      } else {
        setError(res.data.message);
      }
    });
  };

  // const handleAddOffer = (e) => {
  //   e.preventDefault();
  //   setError2("");
  //   const form = e.target;
  //   const name = form.name.value;
  //   const price = parseInt(form.price.value);
  //   const description = form.description.value;
  //   const server = form.server.value;
  //   const option = { name, price, description, server };
  //   axiosPrivate.post("/special/offer/new", option).then((res) => {
  //     if (res.data.insertedId) {
  //       Swal.fire({
  //         position: "top",
  //         icon: "success",
  //         title: `${server} option added.`,
  //         showConfirmButton: false,
  //         timer: 2000,
  //         toast: true,
  //       });
  //       form.reset();
  //     } else {
  //       setError2(res.data.message);
  //     }
  //   });
  // };

  const handleAddRecharge = (e) => {
    // console.log("hitted");

    e.preventDefault();
    setError2("");
    const form = e.target;
    const name = form.name.value;
    const price = parseInt(form.price.value) || 0;
    const description = form.description.value;
    const operator = form.operator.value;
    const category = form.category.value;
    const type = form.types.value;
    const stock = form?.stock?.value;
    const coin = form.coin.value;
    const option = {
      name, price, description, operator, category, docName: type, coin
    };
    const subscriberPrices = {};
    for (const t of subTypes) {
      const val = form[`subscriberPrice_${t._id}`]?.value;
      if (val !== undefined && val !== "") subscriberPrices[t._id] = parseInt(val) || 0;
    }
    if (Object.keys(subscriberPrices).length) option.subscriberPrices = subscriberPrices;

    if(category == "offer"){
      option.stock = stock;
    }

    // console.log(option);

    axiosPrivate.post(`/option/admin/add/recharge`, option).then((res) => {
      if (res.data.insertedId) {
        Swal.fire({
          position: "top",
          icon: "success",
          title: `${category} option added.`,
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
        form.reset();
        setRechargeCategory("card");
      } else {
        setError(res.data.message);
      }
    });
  }
  const handleRechargeOptionType = (e) => {
    setRechargeCategory(e.target.value);
  };


  return (
    <div className="-mt-5 space-y-5">
      <AddDynamicOption />
      <h1 className="bg-gradient-to-r from-primary to-secondary w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5 py-3">
        Add Option
      </h1>
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
              UC
            </label>
            <input
              type="text"
              name="uc"
              required
              className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
              placeholder="UC"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="category"
              className="block text-xl font-medium text-gray-700"
            >
              Choose Category
            </label>
            <select
              name="category"
              id=""
              className="py-1.5 px-3 w-full border-2 border-gray-600 rounded-md block font-medium"
            >
              <option
                value="unipin"
                className="bg-white hover:bg-red-500 focus:bg-red-500"
              >
                Unipin
              </option>
              <option
                value="idcode"
                className="bg-white hover:bg-red-500 focus:bg-red-500"
              >
                IdCode
              </option>
              <option
                value="weekly"
                className="bg-white hover:bg-red-500 focus:bg-red-500"
              >
                Weekly
              </option>
              <option
                value="shell"
                className="bg-white hover:bg-red-500 focus:bg-red-500"
              >
                Shell
              </option>
              <option
                value="airdrop"
                className="bg-white hover:bg-red-500 focus:bg-red-500"
              >
                Airdrop
              </option>
              <option
                value="lessIsMore"
                className="bg-white hover:bg-red-500 focus:bg-red-500"
              >
                Less Is More
              </option>
            </select>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="uc"
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
        </div>
        <div>
          <p className="text-center font-medium text-red-500 pb-2">{error}</p>
          <button
            type="submit"
            className="bg-gradient-to-r from-primary to-secondary py-1.5 px-5 text-lg text-white font-semibold rounded block mx-auto"
          >
            Add
          </button>
        </div>
      </form>
      <h1 className="bg-gradient-to-r from-primary to-secondary w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5 py-3">
        Recharge Option
      </h1>
      <form onSubmit={handleAddRecharge} className="space-y-5">
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
              placeholder="Example: 20 MB"
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
              htmlFor="description"
              className="block text-xl font-medium text-gray-700"
            >
              Description
            </label>
            <input
              type="text"
              name="description"
              required
              className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
              placeholder="Write description here.."
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="operator"
              className="block text-xl font-medium text-gray-700"
            >
              Choose Operator
            </label>
            <select
              name="operator"
              id=""
              className="py-1.5 px-3 w-full border-2 border-gray-600 rounded-md block font-medium"
            >
              <option
                value="GrameenPhone"
                className="bg-white hover:bg-red-500 focus:bg-red-500"
              >
                GrameenPhone
              </option>
              <option
                value="Skitto"
                className="bg-white hover:bg-red-500 focus:bg-red-500"
              >
                Skitto
              </option>
              <option
                value="Robi"
                className="bg-white hover:bg-red-500 focus:bg-red-500"
              >
                Robi
              </option>
              <option
                value="Airtel"
                className="bg-white hover:bg-red-500 focus:bg-red-500"
              >
                Airtel
              </option>
              <option
                value="Banglalink"
                className="bg-white hover:bg-red-500 focus:bg-red-500"
              >
                Banglalink
              </option>
              <option
                value="Teletalk"
                className="bg-white hover:bg-red-500 focus:bg-red-500"
              >
                Teletalk
              </option>
            </select>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="category"
              className="block text-xl font-medium text-gray-700"
            >
              Choose Category
            </label>
            <select
              name="category"
              id=""
              onChange={handleRechargeOptionType}
              className="py-1.5 px-3 w-full border-2 border-gray-600 rounded-md block font-medium"
            >
              <option
                value="card"
                className="bg-white hover:bg-red-500 focus:bg-red-500"
              >
                Card
              </option>
              <option
                value="offer"
                className="bg-white hover:bg-red-500 focus:bg-red-500"
              >
                Offer
              </option>
            </select>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="types"
              className="block text-xl font-medium text-gray-700"
            >
              Choose Types
            </label>
            <select
              name="types"
              id=""
              className="py-1.5 px-3 w-full border-2 border-gray-600 rounded-md block font-medium"
            >
              {rechargeCategory === "card" ? (
                <>
                  <option
                    value="mbCard"
                    className="bg-white hover:bg-red-500 focus:bg-red-500"
                  >
                    MB Card
                  </option>
                  <option
                    value="minCard"
                    className="bg-white hover:bg-red-500 focus:bg-red-500"
                  >
                    Minute Card
                  </option>
                  <option
                    value="balanceCard"
                    className="bg-white hover:bg-red-500 focus:bg-red-500"
                  >
                    Balance Card
                  </option>
                </>
              ) : rechargeCategory === "offer" ? (
                <>
                  <option
                    value="mbOffer"
                    className="bg-white hover:bg-red-500 focus:bg-red-500"
                  >
                    MB Offer
                  </option>
                  <option
                    value="minOffer"
                    className="bg-white hover:bg-red-500 focus:bg-red-500"
                  >
                    Minute Offer
                  </option>
                  <option
                    value="mbAndMinOffer"
                    className="bg-white hover:bg-red-500 focus:bg-red-500"
                  >
                    MB+Min Offer
                  </option>
                </>
              ) : (
                <></>
              )}
            </select>
          </div>
          {
            rechargeCategory == "offer" &&
            <div className="space-y-2">
              <label
                htmlFor="stock"
                className="block text-xl font-medium text-gray-700"
              >
                Stock
              </label>
              <input
                type="number"
                name="stock"
                required
                className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
                placeholder="Example: 10"
              />
            </div>
          }
          <div className="space-y-2">
            <label
              htmlFor="price"
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
          {subTypes.length > 0 && (
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
          )}
        </div>
        <div>
          <p className="text-center font-medium text-red-500 pb-2">{error2}</p>
          <button
            type="submit"
            className="bg-gradient-to-r from-primary to-secondary py-1.5 px-5 text-lg text-white font-semibold rounded block mx-auto"
          >
            Add Offer
          </button>
        </div>
      </form>
      {/* <h1 className="bg-gradient-to-r from-primary to-secondary w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5 py-3">
        Special Offer Option
      </h1>
      <form onSubmit={handleAddOffer} className="space-y-5">
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
              type="text"
              name="price"
              required
              className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
              placeholder="Example: 50"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-xl font-medium text-gray-700"
            >
              Description
            </label>
            <input
              type="text"
              name="description"
              required
              className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
              placeholder="Write description here.."
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="server"
              className="block text-xl font-medium text-gray-700"
            >
              Choose Server
            </label>
            <select
              name="server"
              id=""
              className="py-1.5 px-3 w-full border-2 border-gray-600 rounded-md block font-medium"
            >
              <option
                value="indonesia"
                className="bg-white hover:bg-red-500 focus:bg-red-500"
              >
                Indonesia
              </option>
              <option
                value="all"
                className="bg-white hover:bg-red-500 focus:bg-red-500"
              >
                BD and All other
              </option>
            </select>
          </div>
        </div>
        <div>
          <p className="text-center font-medium text-red-500 pb-2">{error2}</p>
          <button
            type="submit"
            className="bg-gradient-to-r from-primary to-secondary py-1.5 px-5 text-lg text-white font-semibold rounded block mx-auto"
          >
            Add Offer
          </button>
        </div>
      </form> */}
    </div>
  );
};

export default AddOption;
