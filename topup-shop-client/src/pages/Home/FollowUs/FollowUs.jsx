import { FaFacebook, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";

const FollowUs = () => {
  return (
    <div className="lg:w-2/3 mx-auto border rounded-lg p-8">
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5 pb-5">
        Follow Us
      </h1>
      <div className="grid md:grid-cols-2 justify-center gap-8">
        <Link to={"https://www.facebook.com/profile.php?id=100091392112284&mibextid=ZbWKwL"} className="flex items-center gap-2 border bg-slate-50 py-6 px-4">
          <span>
            <FaFacebook className="text-4xl text-blue-700" />
          </span>
          <p className="font-medium">
            নতুন নতুন সব অফার পেতে আমাদের ফেইসবুক পেজ Folllow করুন।
          </p>
        </Link>
        <Link to={"https://youtube.com/@Mezbashop?si=exCN836nk1eFLDJk"} className="flex items-center gap-2 border bg-slate-50 py-6 px-4">
          <span>
            <FaYoutube className="text-4xl text-red-600" />
          </span>
          <p className="font-medium">
          ওয়েবসাইট এর বিস্তারিত সকল কিছু জানতে ভিডিও দেখুন ইউটিউব চ্যানেল এ।
          </p>
        </Link>
        <Link to={"https://chat.whatsapp.com/Gosn4jIHDrCDVbGK81VaHY"} className="flex items-center gap-2 border bg-slate-50 py-6 px-4">
          <span>
            <FaWhatsapp className="text-4xl text-green-600" />
          </span>
          <p className="font-medium">
          ওয়েবসাইট এর সকল আপডেট জানতে অবশ্যই জয়েন করুন হোয়াটসঅ্যাপ গ্রুপ এ।
          </p>
        </Link>
      </div>
    </div>
  );
};

export default FollowUs;
