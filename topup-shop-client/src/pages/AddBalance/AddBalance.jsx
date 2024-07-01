import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AddBalance.css";

const AddBalance = () => {
    const [err, setErr] = useState("");
    const navigate = useNavigate();
  const handleAdd = (e) => {
      e.preventDefault();
      setErr("");
      const amount = parseInt(e.target.amount.value);
      if (isNaN(amount))
          setErr("Check the Amount");
      else {
          navigate('./method', { state: amount });
      }
  };
  return (
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
                  {err ? <p className="text-sm md:text-base font-medium text-red-400">{err}</p>:<></>}
          <button
            type="submit"
            className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 text-lg text-white font-semibold rounded"
          >
            Click to add
          </button>
          <Link to={"https://youtu.be/n2vD7oK0pfo?si=KjNmVbyrh-XmNqMd"} target="_blank" className="clr-text font-semibold">কি ভাবে টাকা এড করবেন </Link>
        </form>
      </div>
    </div>
  );
};

export default AddBalance;
