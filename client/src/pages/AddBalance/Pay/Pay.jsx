import { Navigate, useLocation } from "react-router-dom";
import PayNew from "./PayNew";

const Pay = () => {
  const location = useLocation();
  const { provider, category, id, amount, number, fee } = location.state || {};
  console.log(location.state);

  if (!location.state) {
    return <Navigate to={"/addBalance"} />;
  }
  return (
    <PayNew
      amount={amount}
      fee={fee}
      id={id}
      number={number}
      provider={provider}
      category={category}
    />
  );

  // if (provider === "bkash" && category === "personal") {
  //   return <BkashPersonal id={id} amount={amount} number={number} fee={fee} />;
  // } else if (provider === "bkash" && category === "agent") {
  //   return <BkashAgent id={id} amount={amount} number={number} fee={fee} />;
  // } else if (provider === "nagad" && category === "personal") {
  //   return <NagadPersonal id={id} amount={amount} number={number} fee={fee} />;
  // } else if (provider === "nagad" && category === "agent") {
  //   return <NagadAgent id={id} amount={amount} number={number} fee={fee} />;
  // } else {
  //   return <Navigate to={"/addBalance"} />;
  // }
};

export default Pay;
