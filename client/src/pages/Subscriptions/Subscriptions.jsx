import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useAuth from "../../hooks/useAuth";
import Loader from "../../components/Loader";

const formatDuration = (pkg) => {
  const n = pkg.duration;
  const unit = pkg.durationUnit === "months" ? "Month" : "Day";
  return `${n} ${unit}${n === 1 ? "" : "s"}`;
};

const Subscriptions = () => {
  const [types, setTypes] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const dialogRef = useRef(null);
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    axiosPublic
      .get("/subscription/catalog")
      .then((res) => {
        setTypes(res.data?.types || []);
        setPackages(res.data?.packages || []);
      })
      .catch(() => toast.error("Failed to load subscriptions!"))
      .finally(() => setLoading(false));
  }, [axiosPublic]);

  const openTerms = (pkg) => {
    setSelectedPackage(pkg);
    setAgreed(false);
    dialogRef.current?.showModal();
  };

  const handleBuy = (pkg, typeName) => {
    if (!user) {
      toast.error("Please Login First!");
      navigate("/login", { state: location.pathname });
      return;
    }
    if (user?.balance < pkg.price) {
      const restAmount = Math.ceil(pkg.price - user?.balance);
      navigate("/addBalance/method", {
        state: { amount: restAmount, from: "confirmPurchase" },
      });
      return;
    }
    navigate("/subscription/confirm", { state: { package: pkg, typeName } });
  };

  if (loading) {
    return <Loader isLoading={true} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-xl md:text-3xl uppercase bg-gradient-to-r from-[#FA6023] to-[#E61C55] bg-clip-text text-transparent font-bold text-center">
        Subscription Packages
      </h2>

      {types.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          No subscription packages available right now.
        </p>
      )}

      {types.map((type) => {
        const typePackages = packages.filter((p) => p.typeId === type._id);
        if (typePackages.length === 0) return null;
        return (
          <div key={type._id} className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg md:text-xl font-bold">{type.name}</h3>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-[#FA6023] to-[#E61C55]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {typePackages.map((pkg) => (
                <div
                  key={pkg._id}
                  className="border-2 border-slate-200 border-b-4 border-b-[#FA6023] rounded-xl p-5 flex flex-col"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#E61C55]">
                    {pkg.typeName}
                  </span>
                  <h4 className="text-lg font-bold mt-1">{pkg.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDuration(pkg)}
                  </p>
                  <p className="text-2xl font-bold text-[#E61C55] my-3">
                    ৳{pkg.price}
                  </p>
                  <div className="mt-auto flex flex-col gap-2">
                    <button
                      className="border-2 border-[#FA6023] text-[#FA6023] font-semibold rounded-md py-1.5 hover:bg-[#FA6023] hover:text-white transition-colors"
                      onClick={() => openTerms(pkg)}
                    >
                      View Terms &amp; Conditions
                    </button>
                    <button
                      className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-white font-semibold rounded-md py-1.5"
                      onClick={() => handleBuy(pkg, type.name)}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Terms & Conditions dialog with agree checkbox */}
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box bg-white max-w-2xl">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">
            {selectedPackage?.name} — Terms &amp; Conditions
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            Please read the terms carefully. You must agree to purchase.
          </p>
          <div
            className="rich-text-output max-h-[45vh] overflow-y-auto border border-slate-200 rounded-md p-3 mb-4"
            dangerouslySetInnerHTML={{
              __html: selectedPackage?.termsAndConditions || "",
            }}
          />
          <label className="flex items-start gap-2 cursor-pointer mb-4">
            <input
              type="checkbox"
              className="checkbox checkbox-sm checkbox-primary mt-0.5"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span className="text-sm">
              I agree to the terms and conditions
            </span>
          </label>
          <button
            className="w-full bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-white font-semibold rounded-md py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!agreed}
            onClick={() => {
              dialogRef.current?.close();
              handleBuy(selectedPackage, selectedPackage?.typeName);
            }}
          >
            Buy Now — ৳{selectedPackage?.price}
          </button>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default Subscriptions;
