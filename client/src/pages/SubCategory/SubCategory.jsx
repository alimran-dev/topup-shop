import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { TbCurrencyTaka, TbSquareRoundedNumber1Filled, TbSquareRoundedNumber2Filled } from "react-icons/tb";
import { IoInformationCircleOutline } from "react-icons/io5";
import Loader from "../../components/Loader";
import { MdArrowOutward } from "react-icons/md";
import OptionCard from "./OptionCard";
import toast from "react-hot-toast";
import bkashLogo from '../../assets/images/bkash.png';
import nagadLogo from '../../assets/images/nagad.png';


const SubCategory = () => {

    const { id } = useParams();

    const [allData, setAllData] = useState([]);
    const [selected, setSelected] = useState({ _id: "", price: 0 });
    const [options, setOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [price, setPrice] = useState(0);
    const [inputValues, setInputValues] = useState({});
    const axiosPublic = useAxiosPublic();
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const purchaseRef = useRef(null);


    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);


    useEffect(() => {
        axiosPublic.get(`/services/get?id=${id}`).then((res) => {
            setAllData(res?.data)
            setOptions(res.data.options);
            setIsLoading(false);

            // Initialize inputValues
            const initialInputs = {};
            res.data.inputs.forEach(input => {
                initialInputs[input] = '';
            });
            setInputValues(initialInputs);
        });
        setPrice(selected.price);
    }, [axiosPublic, id, selected?.price]);


    // Handle input change
    const handleInputChange = (e, label) => {
        setInputValues(prevValues => ({
            ...prevValues,
            [label]: e.target.value
        }));
    };


    // handle purchase
    const handleProceedToConfirmation = () => {
        if (!selected.idx || !selected.name || !selected.price) {
            toast.error("Please select an option");
            return;
        }

        const emptyFields = Object.entries(inputValues).filter(([key, value]) => !value.trim());
        if (emptyFields.length > 0) {
            toast.error("Please fill all input fields");
            return;
        }

        if (!user) {
            toast.error("Please Login First!");
            navigate('/login');
            return;
        }

        if (user?.balance < selected?.price) {
            const restAmount = Math.ceil(selected?.price - user?.balance);
            navigate('/addBalance/method', { state: restAmount });
        }

        else {
            navigate('/confirmPurchase', { state: { selected, inputValues, allData } });
        }
    };


    return (
        <div className="flex flex-col gap-5">
            <Loader isLoading={isLoading} />
            <div className="flex items-center gap-3 border-2 py-4 px-6 rounded">
                <img
                    src={allData?.image}
                    alt=""
                    className="w-24 h-20 md:w-28 md:h-24 rounded-[30px]"
                />
                <div>
                    <p className="text-xl md:text-2xl font-semibold capitalize">
                        {allData?.title}
                    </p>
                    <p className="md:text-lg font-medium text-gray-500">{allData?.category}</p>
                </div>
            </div>
            <div className="grid md:grid-cols-3 gap-5">

                <div className="border-2 rounded p-3 md:hidden">
                    <Link
                        to={allData?.tutorialURL}
                        target="_blank"
                        className="text-blue-700 font-semibold flex items-center justify-center gap-1 capitalize"
                    >
                        {allData?.tutorialText} <MdArrowOutward />
                    </Link>
                </div>

                <div className="md:col-span-2 border-2 rounded">
                    <h1 className="text-xl font-semibold py-2 px-5 border-b-2 flex items-center gap-2">
                        <TbSquareRoundedNumber1Filled className="text-red-500" /> Select
                        Option
                    </h1>
                    <div className="col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 px-3 md:px-5 py-5">
                        {options?.map((option, idx) => (
                            <OptionCard key={idx} idx={idx + 1} option={option} selected={selected} setSelected={setSelected} purchaseRef={purchaseRef} />
                        ))}
                    </div>
                </div>
                <div>
                    <div className="border-2 rounded p-3 mb-3 hidden md:block">
                        <Link
                            to={allData?.tutorialURL}
                            target="_blank"
                            className="clr-text font-semibold flex items-center justify-center gap-1 capitalize"
                        >
                            {allData?.tutorialText} <MdArrowOutward className="" />{" "}
                        </Link>
                    </div>

                    {
                        allData?.inputs?.length > 0 && (
                            <div ref={purchaseRef}  className="text-xl font-semibold border-2 rounded w-full">
                                <h2 className="flex-1 flex items-center gap-2 border-b-2 px-5 py-3">
                                    <TbSquareRoundedNumber2Filled className="text-red-500" />
                                    Additional Information
                                </h2>
                                <div className="py-3 space-y-3">
                                    {
                                        allData?.inputs?.map((label, idx) =>
                                            <div key={idx} className="px-5 capitalize">
                                                <label htmlFor={label} className="block text-base mb-1">
                                                    {label}
                                                </label>
                                                <input
                                                    type="text"
                                                    name={label}
                                                    placeholder={label}
                                                    className="text-base px-3 py-1 border border-gray-400 rounded w-full capitalize"
                                                    value={inputValues[label] || ''}
                                                    onChange={(e) => handleInputChange(e, label)}
                                                />
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        )
                    }


                    <div className="border-2 rounded my-3">
                        <h2 className="text-xl text-center font-semibold border-b-2 py-2">
                            Summary
                        </h2>
                        <div className="px-5 py-4 space-y-3">
                            {user && (
                                <>
                                    <p className="text-sm flex gap-1">
                                        <IoInformationCircleOutline className="text-lg" />
                                        আপনার ব্যালেন্সঃ{" "}
                                        <span className="flex items-center font-semibold text-red-600">
                                            <TbCurrencyTaka />
                                            {(user?.balance)?.toFixed(2)}
                                        </span>
                                    </p>
                                </>
                            )}
                            <p className="text-sm flex gap-1">
                                <IoInformationCircleOutline className="text-lg" />
                                প্রোডাক্টের মোট মূল্যঃ
                                <span className="flex items-center font-semibold text-red-600">
                                    <TbCurrencyTaka />
                                    {price}
                                </span>
                            </p>
                            {user && (
                                <>
                                    <p className="text-sm flex gap-1">
                                        <IoInformationCircleOutline className="text-lg" />
                                        আপনার অবশিষ্ট ব্যালেন্সঃ{" "}
                                        <span className="flex items-center font-semibold text-red-600">
                                            <TbCurrencyTaka />
                                            {(user?.balance - price)?.toFixed(2)}
                                        </span>
                                    </p>
                                </>
                            )}
                            {user ? (
                                <div className="space-y-3">

                                    <button
                                        onClick={handleProceedToConfirmation}
                                        className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-full py-1.5 px-5 rounded-md font-semibold text-white"
                                    >
                                        Purchase
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to={"/login"}
                                    state={location.pathname}
                                    className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] block text-center w-full py-1.5 px-5 rounded-md font-semibold text-white"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* add balance */}
                    {
                        user &&
                        <Link to={"/addBalance"} className="block p-3 rounded border-2">
                            <button
                                className="border-2 border-[#FA6023] px-4 py-0.5 rounded font-bold bg-gradient-to-r from-[#FA6023] to-[#E61C55] bg-clip-text text-transparent block mx-auto w-fit mt-2"
                            >
                                Add Balance
                            </button>
                            <div className="flex justify-center items-center py-3">
                                <div className="w-20 h-fit">
                                    <img src={bkashLogo} className="w-full h-full object-contain" alt="Bkash Logo" />
                                </div>
                                <div className="w-20 h-fit">
                                    <img src={nagadLogo} className="w-full h-full object-contain" alt="Nagad Logo" />
                                </div>
                            </div>
                        </Link>
                    }
                </div>
            </div>
            <div className="border rounded-md p-3 md:p-6">
                <div
                    dangerouslySetInnerHTML={{ __html: allData?.rules }}
                    className="rich-text-output"
                />
            </div>
        </div>
    );
};

export default SubCategory;