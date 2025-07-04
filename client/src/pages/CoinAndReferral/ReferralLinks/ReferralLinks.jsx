import CopyToClipboard from "react-copy-to-clipboard";
import whatsappIcon from "../../../assets/images/socialIcons/whatsApp-icon.webp";
import fbIcon from "../../../assets/images/socialIcons/facebook-icon.png";
import messengerIcon from "../../../assets/images/socialIcons/messenger-icon.webp";
import emailIcon from "../../../assets/images/socialIcons/gmail-icon.webp";
import imoIcon from "../../../assets/images/socialIcons/imo-icon.webp";
import { MdContentCopy } from "react-icons/md";
import toast from "react-hot-toast";
import useAuth from "../../../hooks/useAuth";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { allLinks } from "../../../utils/constants";
import { AiFillYoutube } from "react-icons/ai";
import { FaRegDotCircle } from "react-icons/fa";

const ReferralLinks = () => {
  const { user } = useAuth();
  const [referralUrl, setReferralUrl] = useState(null);

  useEffect(() => {
    const domain = window.location.origin;
    setReferralUrl(`${domain}/signup?ref=${user?.referID}`);
  }, [user?.referID]);

  const socialIcons = [
    {
      icon: whatsappIcon,
      url: `https://wa.me/?text=${encodeURIComponent(referralUrl)}`,
    },
    {
      icon: fbIcon,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        referralUrl
      )}`,
    },
    {
      icon: messengerIcon,
      url: `https://www.messenger.com/share?link=${encodeURIComponent(
        referralUrl
      )}`,
    },
    {
      icon: emailIcon,
      url: `mailto:?subject=Check this out&body=${encodeURIComponent(
        referralUrl
      )}`,
    },
    {
      icon: imoIcon,
      url: `https://imo.im/share?text=${encodeURIComponent(referralUrl)}`,
    },
  ];

  const referRules=[
    {text: "আমাদের ওয়েবসাইটের রেফারেল লিংক কপি করুন।"},
    {text: "রেফার লিংক দিয়ে আপনাদের বন্ধুদের একাউন্ট খুলে দিন।"},
    {text: "আপনার বন্ধুরা আমাদের ওয়েবসাইট থেকে যে কোন কিছু  কিনেলেই সেখান থেকে আপনি পয়েন্ট পাবেন।"},
    {text: "রেফার করা কয়েন দিয়ে আপনি চাইলে ফ্রিতে ডায়মন্ড মোবাইল রিচার্জ সহ অনেক কিছু ফ্রী তে  নিতে পারবেন।"},
  ]

  return (
    <div className="py-4 md:py-8 border-2 border-slate-300 rounded-md text-center">
      <h3 className="font-bold">Refer Your Friend & Get Coins </h3>
      <div className="mx-2 md:mx-4 py-2 my-3 border border-dashed border-primary rounded-md space-x-3">
        <span>{referralUrl}</span>
        <CopyToClipboard text={referralUrl}>
          <button
            onClick={() => toast.success("Copied!")}
            className="translate-y-[2px]"
          >
            <MdContentCopy />
          </button>
        </CopyToClipboard>
      </div>
      OR
      <div className="flex justify-center items-center gap-4 mt-3">
        {socialIcons.map((social, idx) => (
          <a
            href={social?.url}
            key={idx}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <img
              src={social?.icon}
              className="w-6 object-contain"
              alt="social icon"
            />
          </a>
        ))}
      </div>
      {/* tutorial link */}
      <Link
        to={allLinks.referTutorial || "#"}
        target="_blank"
        className="flex items-center gap-2 justify-center text-blue-600 font-semibold text-sm py-2"
      >
        <AiFillYoutube className="text-red-700 text-2xl" /> যেভাবে রেফার করে পয়েন্ট পাবেন।
      </Link>
      <div className="text-start px-3">
        {
            referRules?.map((rule,idx)=><p key={idx} className="text-sm "><FaRegDotCircle className="inline mr-1" />{rule.text || ""}</p>)
        }
      </div>
    </div>
  );
};

export default ReferralLinks;
