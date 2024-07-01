import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import useAxiosPublic from "../../../hooks/useAxiosPublic";

const Notice = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [notice, setNotice] = useState({ notice: "" });
  const axiosPublic = useAxiosPublic();
  useEffect(() => {
    axiosPublic.get("/notice").then((res) => {
      setNotice(res.data[0]);
    });
  }, [axiosPublic]);
  return (
    <div
      className={`border-2 border-[#FA6023] rounded-md relative ${
        notice.notice.length > 0 ? (isOpen ? "" : "hidden") : "hidden"
      }`}
    >
      <IoClose
        onClick={() => setIsOpen(!isOpen)}
        className="absolute text-xl font-bold top-1 right-1 cursor-pointer"
      />
      <h2 className="text-center border-b-2 border-[#FA6023] py-1.5 text-lg font-bold">
        Notice
      </h2>
      <div className="px-3 py-3 text-sm">
        <p>{notice?.notice || ""}</p>
      </div>
    </div>
  );
};

export default Notice;
