import CopyToClipboard from "react-copy-to-clipboard";
import whatsappIcon from '../../../assets/images/socialIcons/whatsApp-icon.webp';
import fbIcon from '../../../assets/images/socialIcons/facebook-icon.png';
import messengerIcon from '../../../assets/images/socialIcons/messenger-icon.webp';
import emailIcon from '../../../assets/images/socialIcons/gmail-icon.webp';
import imoIcon from '../../../assets/images/socialIcons/imo-icon.webp';
import { MdContentCopy } from "react-icons/md";
import toast from 'react-hot-toast';
import useAuth from "../../../hooks/useAuth";
import { useEffect, useState } from "react";

const ReferralLinks = () => {

    const { user } = useAuth();
    const [referralUrl, setReferralUrl] = useState(null);

    useEffect(() => {
        const domain = window.location.origin;
        setReferralUrl(`${domain}/signup?ref=${user?.referID}`)
    }, [user?.referID]);

    const socialIcons = [
        {
            icon: whatsappIcon,
            url: `https://wa.me/?text=${encodeURIComponent(referralUrl)}`
        },
        {
            icon: fbIcon,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`
        },
        {
            icon: messengerIcon,
            url: `fb-messenger://share/?link=${encodeURIComponent(referralUrl)}`
        },
        {
            icon: emailIcon,
            url: `mailto:?subject=Check this out&body=${encodeURIComponent(referralUrl)}`
        },
        {
            icon: imoIcon,
            url: `https://imo.im/share?text=${encodeURIComponent(referralUrl)}`
        }
    ];

    return (
        <div className="py-4 md:py-8 border-2 border-slate-300 rounded-md text-center">
            <h3 className="font-bold">Refer Your Friend & Get Coins </h3>
            <div className="mx-2 md:mx-4 py-2 my-3 border border-dashed border-primary rounded-md space-x-3">
                <span>{referralUrl}</span>
                <CopyToClipboard text={referralUrl}>
                    <button onClick={() => toast.success("Copied!")} className="translate-y-[2px]">
                        <MdContentCopy />
                    </button>
                </CopyToClipboard>
            </div>
            OR
            <div className="flex justify-center items-center gap-4 mt-3">
                {socialIcons.map((social, idx) => (
                    <a href={social?.url} key={idx} target="_blank" rel="noopener noreferrer" className="flex items-center" >
                        <img src={social?.icon} className="w-6 object-contain" alt="social icon" />
                    </a>
                ))}
            </div>
        </div>
    );
};

export default ReferralLinks;