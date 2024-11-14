import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AddBalance.css";
import { MdArrowOutward } from "react-icons/md";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Loader from "../../components/Loader";

const AddBalance = () => {
  const [err, setErr] = useState("");
  const [offer, setOffer] = useState({ offer: "" });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const handleAdd = (e) => {
    e.preventDefault();
    setErr("");
    const amount = parseInt(e.target.amount.value);
    if (isNaN(amount)) setErr("Check the Amount");
    else {
      navigate("./method", { state: amount });
    }
  };
  useEffect(() => {
    axiosPrivate.get("/balance/offer").then((res) => {
      setOffer(res.data[0]);
      setIsLoading(false);
    });
  }, [axiosPrivate]);
  return (
    <div className="space-y-5">
      <Loader isLoading={isLoading} />
      <div
        className={`border-2 border-[#FA6023] rounded-md relative ${
          offer.offer.length > 0 ? "" : "hidden"
        }`}
      >
        <h2 className="text-center border-b-2 border-[#FA6023] py-1.5 text-lg font-bold">
          Offer
        </h2>
        <div className="px-3 py-3 text-sm">
          <p>{offer?.offer || ""}</p>
        </div>
      </div>
      <div className="w-fit mx-auto bg-gradient-to-r from-[#FA6023] to-[#E61C55] p-0.5 rounded">
        <div className="bg-white rounded">
          <h2 className="text-center text-4xl md:text-5xl font-bold px-4 bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text py-1.5 border-b-2 border-[#FA6023]">
            Add Balance
          </h2>
          <form
            onSubmit={handleAdd}
            className="flex flex-col items-center justify-center gap-1.5 py-3"
          >
            <p className="text-xl font-medium">Enter the amount</p>
            <input
              type="text"
              name="amount"
              placeholder="Amount"
              className="border-2 border-gray-400 rounded px-2 py-1.5 font-medium w-56 text-center"
            />
            {err ? (
              <p className="text-sm md:text-base font-medium text-red-400">
                {err}
              </p>
            ) : (
              <></>
            )}
            <button
              type="submit"
              className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 text-lg text-white font-semibold rounded"
            >
              Click to add
            </button>
            <Link
              to={"https://youtu.be/n2vD7oK0pfo?si=KjNmVbyrh-XmNqMd"}
              target="_blank"
              className="clr-text font-semibold flex items-center gap-1"
            >
              কি ভাবে টাকা এড করবেন <MdArrowOutward className="" />{" "}
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBalance;
