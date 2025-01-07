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
      className={`relative w-full max-w-none mx-auto p-4 ${
        notice.notice.length > 0 ? (isOpen ? "" : "hidden") : "hidden"
      }`}
    >

      <div className="bg-gray-900 border-4 border-yellow-500 rounded-lg shadow-lg relative w-full">
        <IoClose
          onClick={() => setIsOpen(!isOpen)}
          className="absolute text-3xl font-bold top-3 right-3 cursor-pointer text-yellow-500 hover:text-red-600 active:text-gray-300"
        />

        <h2 className="text-center bg-yellow-500 text-black font-bold text-lg uppercase py-3 rounded-t-md shadow-md">
          Notice
        </h2>
        <div className="px-6 py-4 text-gray-200 text-sm leading-6">
          <p>{notice?.notice || "No notices available at the moment."}</p>
        </div>
      </div>
    </div>
  );
};

export default Notice;
