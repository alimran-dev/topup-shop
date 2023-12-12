import { FaFacebook, FaWhatsapp, FaYoutube } from "react-icons/fa";

const FollowUs = () => {
  return (
    <div className="lg:w-2/3 mx-auto border rounded-lg p-8">
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5 pb-5">
        Follow Us
      </h1>
      <div className="grid md:grid-cols-2 justify-center gap-8">
        <div className="flex items-center gap-2 border bg-slate-50 py-6 px-4">
          <span>
            <FaFacebook className="text-4xl text-blue-700" />
          </span>
          <p className="font-medium">
            নতুন নতুন সব অফার পেতে আমাদের ফেইসবুক পেজ Folllow করুন।
          </p>
        </div>
        <div className="flex items-center gap-2 border bg-slate-50 py-6 px-4">
          <span>
            <FaYoutube className="text-4xl text-red-600" />
          </span>
          <p className="font-medium">
            ফ্রি ডায়মন্ড জিতার অফারটিতে অংশ গ্রহন করতে আমাদের চ্যানেলটি
            সাবস্ক্রাইব করুন ।
          </p>
        </div>
        <div className="flex items-center gap-2 border bg-slate-50 py-6 px-4">
          <span>
            <FaWhatsapp className="text-4xl text-green-600" />
          </span>
          <p className="font-medium">
            যেকোনো সমস্যায় পড়লে আমাদের হোয়াটসঅ্যাপে লাইভ চ্যাট এ কথা বলুন।
          </p>
        </div>
      </div>
    </div>
  );
};

export default FollowUs;
