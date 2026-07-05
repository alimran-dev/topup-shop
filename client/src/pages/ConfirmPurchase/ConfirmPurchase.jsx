import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import { useEffect, useState } from "react";

const ConfirmPurchase = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { user, setUser } = useAuth();
  const { name, category, selected, inputValues, orderData, quantity, payMethod } =
    location.state;

  // console.log(orderData);

  const handlePurchase = () => {
    setLoading(true);

    if (name == "dynamic") {
      const data = {
        id: orderData._id,
        email: user?.email,
        index: selected.idx - 1,
        name: selected.name,
        price: selected.price,
        info: inputValues,
        isAuto: orderData?.isAuto,
        willHaveQuantity: selected?.willHaveQuantity,
        quantity: quantity,
      };

      if(payMethod==="direct"){
        navigate("/addBalance/method", {state: {amount: selected?.price *quantity, from: "direct", orderData: data}})
        return;
      }

      axiosPrivate
        .post("/order/new/dynamic", data)
        .then((res) => {
          if (res.data.success) {
            toast.success("Order Placed Successfully!");
            setUser({
              ...user,
              balance: user?.balance - res.data.price,
              orders: user?.orders + 1,
              spent: user?.spent + selected.price * quantity,
            });
            setLoading(false);
            navigate("/myOrders");
          } else {
            setLoading(false);
            toast.error(res.data.message || "Order Place Failed!");
          }
        })
        .catch((err) => {
          setLoading(false);
          toast.error(err.response.data.error || "Failed to purchase!");
        });
    }

    if (name == "unipin") {
      axiosPrivate
        .post("/order/new/auto/unipin", orderData)
        .then((res) => {
          // console.log(res.data);
          toast.success("Order Placed Successfully!");
          setLoading(false);
          setUser({
            ...user,
            balance: user?.balance - res.data?.price,
            orders: user?.orders + 1,
            spent: user?.spent + selected?.price,
          });
          navigate("/myOrders");
        })
        .catch((err) => {
          toast.error(err.response.data.error || "Failed to purchase!");
          setLoading(false);
        });
    }

    if (name == "shell") {
      axiosPrivate
        .post("/order/new/auto/shell", orderData)
        .then((res) => {
          // console.log(res.data);
          toast.success("Order Placed Successfully!");
          setLoading(false);
          setUser({
            ...user,
            balance: user?.balance - res.data?.price,
            orders: user?.orders + 1,
            spent: user?.spent + selected?.price,
          });
          navigate("/myOrders");
        })
        .catch((err) => {
          toast.error(err.response.data.error || "Failed to purchase!");
          setLoading(false);
        });
    }

    if (name == "balanceRecharge") {
      if (user?.balance < inputValues?.amount) {
        const restAmount = Math.ceil(inputValues?.amount - user?.balance);
        navigate("/addBalance/method", { state: {amount: restAmount, from: "confirmPurchase"} });
        return;
      }

      const data = {
        email: user?.email,
        price: orderData?.amount,
        phone: orderData?.number,
        company: orderData?.companyName,
        type: orderData?.type,
      };

      axiosPrivate
        .post("/order/recharge/balance", data)
        .then((res) => {
          // console.log(res.data, "-------recharge order");
          toast.success("Order Placed Successfully!");
          setLoading(false);
          setUser({
            ...user,
            balance: user?.balance - res.data?.price,
            orders: user?.orders + 1,
            spent: user?.spent + selected?.price,
          });
          navigate("/myOrders");
        })
        .catch((err) => {
          toast.error(err.response.data.error || "Failed to purchase!");
          setLoading(false);
        });
    }

    if (name == "recharge") {
      if (category == "rechargeCard") {
        axiosPrivate
          .post("/order/new/auto/card", orderData)
          .then((res) => {
            // console.log(res.data);
            setLoading(false);
            setUser({
              ...user,
              balance: user?.balance - res.data?.price,
              orders: user?.orders + 1,
              // spent: user?.spent + price,
            });
            toast.success("Purchase Successfully!");
            navigate("/myOrders");
          })
          .catch((err) => {
            toast.error(err.response.data.error || "Something went wrong!");
            setLoading(false);
          });
      }
      if (category == "offerCard") {
        axiosPrivate
          .post("/order/recharge/offer", orderData)
          .then((res) => {
            console.log(res.data);
            setLoading(false);
            setUser({
              ...user,
              balance: user?.balance - res.data?.price,
              orders: user?.orders + 1,
              // spent: user?.spent + price,
            });
            toast.success("Purchase Successfully!");
            navigate("/myOrders");
          })
          .catch((err) => {
            toast.error(err.response.data.error || "Something went wrong!");
            setLoading(false);
          });
      }
    }
  };

  // load page from the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="md:py-5">
      <h1 className="title">Confirm Purchase</h1>
      <div className="max-w-xl mx-auto border-2 border-slate-300 rounded pb-5">
        <h2 className="font-bold text-lg py-2 mb-2 text-center bg-slate-100">
          Order Sumarry
        </h2>

        {/* for recharge */}
        {name == "recharge" && (
          <div className="px-4 py-2">
            <p className="flex items-center gap-2 border-b border-b-slate-300 pb-1 mb-1">
              <span className="w-24 font-semibold">Package</span>
              <span>:</span>
              <span className="capitalize">{location.state?.option?.name}</span>
            </p>
            <p className="flex items-center gap-2 border-b border-b-slate-300 pb-1 mb-1">
              <span className="w-24 font-semibold">Price</span>
              <span>:</span>
              <span>৳{location.state?.option?.price}</span>
            </p>
            {category == "rechargeCard" && (
              <>
                <p className="flex items-center gap-2 border-b border-b-slate-300 pb-1 mb-1">
                  <span className="w-24 font-semibold">Quantity</span>
                  <span>:</span>
                  <span className="capitalize">
                    {location.state?.orderData?.quantity}
                  </span>
                </p>
              </>
            )}
            {category == "offerCard" && (
              <>
                <p className="flex items-center gap-2 border-b border-b-slate-300 pb-1 mb-1">
                  <span className="w-24 font-semibold">Type</span>
                  <span>:</span>
                  <span className="capitalize">
                    {location.state?.orderData?.type}
                  </span>
                </p>
                <p className="flex items-center gap-2 border-b border-b-slate-300 pb-1 mb-1">
                  <span className="w-24 font-semibold">Mobile</span>
                  <span>:</span>
                  <span>{location.state?.orderData?.phone}</span>
                </p>
              </>
            )}
            <p className="flex items-center gap-2 border-b border-b-slate-300 pb-1 mb-1">
              <span className="w-24 font-semibold">Company</span>
              <span>:</span>
              <span>{location.state?.company}</span>
            </p>
          </div>
        )}

        {/* for balance recharge */}
        {name == "balanceRecharge" && (
          <div className="px-4 py-2">
            <p className="flex items-center gap-2 border-b border-b-slate-300 pb-1 mb-1">
              <span className="w-24 font-semibold">Number</span>
              <span>:</span>
              <span>{orderData?.number}</span>
            </p>
            <p className="flex items-center gap-2 border-b border-b-slate-300 pb-1 mb-1">
              <span className="w-24 font-semibold">Amount</span>
              <span>:</span>
              <span>৳{orderData?.amount}</span>
            </p>
            <p className="flex items-center gap-2 border-b border-b-slate-300 pb-1 mb-1">
              <span className="w-24 font-semibold">Operator</span>
              <span>:</span>
              <span>{orderData?.companyName}</span>
            </p>
            <p className="flex items-center gap-2 border-b border-b-slate-300 pb-1 mb-1">
              <span className="w-24 font-semibold">Type</span>
              <span>:</span>
              <span>{orderData?.type}</span>
            </p>
          </div>
        )}

        {/* for unipin, dynamic or shell */}
        {(name == "unipin" || name == "shell" || name == "dynamic") && (
          <div className="px-4 py-2">
            <p className="flex items-center gap-2 border-b border-b-slate-300 pb-1 mb-1">
              <span className="w-24 font-semibold">Option</span>
              <span>:</span>
              <span>{selected?.name}</span>
            </p>
            {(selected?.willHaveQuantity) && (
              <p className="flex items-center gap-2 border-b border-b-slate-300 pb-1 mb-1">
                <span className="w-24 font-semibold normal-case">Quantity</span>
                <span>:</span>
                <span>
                  {selected?.willHaveQuantity ? quantity : orderData?.quantity}
                </span>
              </p>
            )}

            <p className="flex items-center gap-2 border-b border-b-slate-300 pb-1 mb-1">
              <span className="w-24 font-semibold">Price</span>
              <span>:</span>
              <span>
                ৳
                {selected?.willHaveQuantity
                  ? selected?.price * quantity
                  : selected?.price}
              </span>
            </p>
            {name == "dynamic" && (
              <>
                {Object?.entries(inputValues)?.map(([key, value]) => (
                  <p
                    key={key}
                    className="flex items-center gap-2 border-b border-b-slate-300 pb-1 mb-1 capitalize"
                  >
                    <span className="w-24 font-semibold">{key}</span>
                    <span>:</span>
                    <span>{value}</span>
                  </p>
                ))}
              </>
            )}
            <p className="flex items-center gap-2 border-b border-b-slate-300 pb-1 mb-1">
              <span className="w-24 font-semibold">Payment Method</span>
              <span>:</span>
              <span className="capitalize"> {payMethod} </span>
            </p>
          </div>
        )}
        <div className="flex justify-center mt-4">
          <button
            onClick={handlePurchase}
            className="button"
            disabled={loading}
          >
            {loading ? "Please Wait" : "Confirm Purchase"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPurchase;
