import { Link } from "react-router-dom";

const MiniNavigation = () => {
  const items=[
    {text: "রেফার করে পয়েন্ট জিতুন", url: "/coinsAndReferral"},
    {text: "সেরা ১০ জন রেফার", url: "/leaderboard"},
    {text: "পয়েন্ট দিয়ে ফ্রী প্রোডাক্ট", url: "/store"},
    {text: "রিডিম কোড", url: "/redeem-code"},
  ]
  return (
    <div className="grid  grid-cols-2 md:grid-cols-4 items-stretch justify-around gap-2">
      {
        items?.map((item,idx)=><Link to={item.url} key={idx} className="bg-gradient-to-r from-primary to-secondary text-transparent text-white font-semibold py-1.5 px-3 rounded-md inline-flex items-center justify-center text-center text-sm shadow-md hover:scale-95 ">{item.text}</Link>)
      }
    </div>
  );
};

export default MiniNavigation;