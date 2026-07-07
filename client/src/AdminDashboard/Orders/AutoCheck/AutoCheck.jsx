import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { MdContentCopy } from "react-icons/md";

const AutoCheck = () => {
  const [codes, setCodes] = useState([]);
  const [order, setOrder] = useState({});
  const location = useLocation();
  const codesRef = useRef(null);

  useEffect(()=>{
    setCodes(location.state?.codes);
    setOrder(location.state?.order)
  },[location.state])
  const handleCopy = async () => {
    if (codesRef.current) {
      try {
        const allCodes = codesRef.current.value.split("\n");
        // const firstCode = allCodes[0].substring(5);
        // if (category !== "card") {
        //   allCodes[0] = firstCode;
        // }
        const allCodesMod = allCodes.join("\n");
        await navigator.clipboard.writeText(allCodesMod);
        toast.success("Text Copied");
      } catch (err) {
        console.error(err);
        toast.error("Failed to Copy");
      }
    }
  };
  return (
    <div>
      <div>
        <button className="button block mx-auto" onClick={()=>{}}>Pending Again</button>
        <h2 className="text-xl font-semibold">Unipin Codes:</h2>
        <textarea
          disabled
          value={codes?.join("\n")}
          name=""
          ref={codesRef}
          className="border-2 h-24 w-full rounded px-2 py-0.5"
        ></textarea>
        <button
          onClick={handleCopy}
          className="border-2 border-gray-400 bg-gray-200 px-3 py-1 font-semibold rounded block mx-auto"
        >
          <MdContentCopy className="inline-block" /> Copy All
        </button>
        <h2 className="text-xl font-semibold">Order Info:</h2>
        <pre className="overflow-x-scroll">{JSON.stringify(order,null, 2)}</pre>
      </div>
    </div>
  );
};

export default AutoCheck;