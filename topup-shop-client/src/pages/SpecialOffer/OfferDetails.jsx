import PropTypes from "prop-types";
import specialOffer from "../../assets/images/special_offer.jpeg";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import OfferOption from "./OfferOption";
import { useEffect, useState } from "react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { HiOutlineInformationCircle } from "react-icons/hi";
const OfferDetails = ({ server }) => {
  const [selected, setSelected] = useState({ id: "", price: 0 });
  const [options, setOptions] = useState([]);
  const axiosPublic = useAxiosPublic();
  useEffect(() => {
    axiosPublic.get(`/offers/${server}`).then((res) => {
      setOptions(res.data);
    });
  }, [axiosPublic, server]);
  console.log(options);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 border-2 py-4 px-6 rounded">
        <img
          src={specialOffer}
          alt=""
          className="w-24 h-20 md:w-28 md:h-24 rounded-[30px]"
        />
        <div>
          <p className="text-xl md:text-2xl font-semibold">All Special Offer</p>
          <p className="md:text-lg font-medium text-gray-500">Game / Top-Up</p>
        </div>
      </div>
      <div className="border-2 py-3 px-6 rounded">
        <p className="text-sm text-center">
          এখানে দেওয়া অফার গুলো নিতে{" "}
          <span className="font-semibold">
            ফেসবুক আইডি হলে নাম্বার পাসওয়ার্ড
          </span>
          । আর{" "}
          <span className="font-semibold">
            জিমেইল আইডি হলে জিমেইল পাসওয়ার্ড
          </span>{" "}
          লাগবে। নিতে চাইলে হোয়াটসঅ্যাপে মেসেজ দিন। <br />{" "}
          <Link
            to={"https://wa.me/+8801643204362"}
            target="_blank"
            className="inline-flex items-center gap-1 text-lg font-semibold hover:underline hover:text-blue-400"
          >
            {" "}
            <FaWhatsapp className="text-green-500" /> 01643204362
          </Link>
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {options?.map((option) => (
          <OfferOption
            option={option}
            selected={selected}
            setSelected={setSelected}
            key={option._id}
          />
        ))}
      </div>
      <div className="border rounded-md">
        <h2 className="flex items-center gap-1 text-2xl font-semibold border rounded-md py-2 px-3">
          <HiOutlineInformationCircle className="mt-0.5" /> Rules & Conditions
        </h2>
        <div className="px-8 py-5 space-y-2">
          <p className="text-lg font-semibold">
            অর্ডার করার আগে ভালো ভাবে পড়ে নিন
          </p>
          <p>
            ⛔ উপরে দেওয়া সকল অফার গুলো নিতে ফেসবুক আইডি হলে নাম্বার পাসওয়ার্ড
            লাগবে।
          </p>
          <p>⛔ জিমেইল দিয়ে আইডি হলে জিমেইল পাসওয়ার্ড লাগবে।</p>
          <p>
            ⛔ প্রতিটি অর্ডার কমপ্লিট করতে ১৫ থেকে ৩০ মিনিট লাগে। তবে নেটওয়ার্ক
            বা সার্ভার সমস্যা হলে ৫ থেকে ১০ ঘন্টা পর্যন্ত সময় লাগতে পারে।
          </p>
          <p>
            ⛔ অর্ডার কমপ্লিট করে দেওয়ার পর। যখন Done লিখে দিব, নিজ দায়িত্বে
            নিজের পাসওয়ার্ড চেঞ্জ করে নিবেন।
          </p>
          <p>⛔ কেউ হোয়াটসঅ্যাপে কল দিবেন না শুধুমাত্র মেসেজ করবেন।</p>
        </div>
      </div>
    </div>
  );
};

export default OfferDetails;
OfferDetails.propTypes = {
  server: PropTypes.string.isRequired,
};
