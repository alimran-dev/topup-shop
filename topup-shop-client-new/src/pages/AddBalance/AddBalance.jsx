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
        className={`relative ${offer?.offer?.length > 0 ? "" : "hidden"
          }`}
      >
        <h2 className="text-center border-b-2 border-[#FA6023] py-1.5 text-lg font-bold">
          Offer
        </h2>
        <div className="px-3 py-3 text-sm">
          <p>{offer?.offer || ""}</p>
        </div>
      </div>
      <div className="w-fit mx-auto">
        <div className="bg-white rounded">
          <h2 className="title !mb-0">
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
              className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 text-lg text-white font-semibold rounded mt-2"
            >
              Click To Add
            </button>
            <Link
              to={"https://youtu.be/n2vD7oK0pfo?si=KjNmVbyrh-XmNqMd"}
              target="_blank"
              className="text-blue-700 font-semibold flex items-center gap-1 mt-5"
            >
              কি ভাবে টাকা এড করবেন <MdArrowOutward />
            </Link>


            {/* <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/n2vD7oK0pfo"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe> */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBalance;
