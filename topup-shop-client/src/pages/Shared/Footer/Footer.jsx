import { Link } from "react-router-dom";
import logo from "../../../assets/topup-logo-crop.png";
import { FaFacebook, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { IoCallSharp } from "react-icons/io5";
import { MdEmail } from "react-icons/md";

const Footer = () => {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10 px-16 py-10 border-t-2 bg-gray-100">
      <div className="flex-1">
        <img src={logo} alt="" className="w-72" />
      </div>

      <div className="flex-1 space-y-3">
        <h2 className="text-2xl font-bold opacity-90">Contact Us</h2>
        <div className="text-2xl flex gap-3">
          <Link>
            <FaFacebook />
          </Link>
          <Link>
            <FaYoutube />
          </Link>
          <Link>
            <IoCallSharp />
          </Link>
          <Link>
            <MdEmail />
          </Link>
        </div>
      </div>
      <div className="flex-1 space-y-3">
        <h2 className="text-2xl font-bold opacity-90">Support</h2>
        <Link
          to={"https://wa.me/+8801910841245"}
          className="flex items-center gap-5 border border-gray-400 py-2 px-5 font-semibold"
        >
          <div className="text-3xl">
            <FaWhatsapp />
          </div>
          <div className="border-l border-gray-400 pl-5">
            <p>9AM-12AM</p>
            <p>01910841245</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Footer;
