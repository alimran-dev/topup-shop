import { IoCall } from "react-icons/io5";
import { FaFacebookMessenger, FaWhatsapp } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useEffect } from "react";

const ContactUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  },[])
  return (
    <div className="lg:w-2/3 mx-auto border rounded-lg p-8">
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5 pb-5">
        Contact Us
      </h1>
      <div className="grid md:grid-cols-2 justify-center gap-8">
        <div className="flex items-center gap-2 border bg-slate-50 py-6 px-4">
          <span>
            <IoCall className="text-4xl text-blue-700" />
          </span>
          <p className="font-medium">
            আমাদের সাথে সরাসরি কথা বলতে এখানে ক্লিক করুন।
          </p>
        </div>
        <div className="flex items-center gap-2 border bg-slate-50 py-6 px-4">
          <span>
            <FaFacebookMessenger className="text-4xl text-red-600" />
          </span>
          <p className="font-medium">
            মেসেঞ্জারে লাইভ চ্যাটের জন্য এখানে ক্লিক করুন।
          </p>
        </div>
        <div className="flex items-center gap-2 border bg-slate-50 py-6 px-4">
          <span>
            <FaWhatsapp className="text-4xl text-green-600" />
          </span>
          <p className="font-medium">
            হোয়াটসঅ্যাপে লাইভ চ্যাটের জন্য এখানে ক্লিক করুন।
          </p>
        </div>
        <div className="flex items-center gap-2 border bg-slate-50 py-6 px-4">
          <span>
            <MdEmail className="text-4xl text-sky-900" />
          </span>
          <p className="font-medium">
          আমাদের সাপোর্টে ইমেইল করতে এখানে ক্লিক করুন।
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
