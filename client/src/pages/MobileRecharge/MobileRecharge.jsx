import { useEffect, useState } from "react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";


const MobileRecharge = () => {

    const [companies, setCompanies] = useState([]);
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();

    // load sim companies
    useEffect(() => {
        axiosPublic.get("/recharge/companies").then((res) => {
            setCompanies(res?.data || []);
        });
    }, [axiosPublic]);


    // submit fn
    const handleSubmit = (e) => {
        e.preventDefault();

        // get form data
        const formData = new FormData(e.target);
        const inputValues = {
            number: formData.get("number"),
            amount: formData.get("amount"),
            operator: formData.get("operator"),
            type: formData.get("type"),
        };

        // validate bangladeshi mobile number
        const bdNumberRegex = /^(?:\+8801|8801|01)[3-9]\d{8}$/;
        if (!bdNumberRegex.test(inputValues.number)) {
            toast.error("Invalid Mobile Number!");
            return;
        }

        // check the amount upper 20
        if (e.target.amount.value < 20) {
            toast.error("Amount Must Upper Than 20");
            return;
        }

        const selectedCompany = companies.find(company => company?._id == formData.get("operator"));

        const rechargeData = { ...inputValues, companyName: selectedCompany?.name };
        // console.log(rechargeData);

        navigate('/confirmPurchase', { state: { name: "balanceRecharge", orderData: rechargeData } });
    };


    return (
        <div>
            <h2 className="title">Mobile Recharge</h2>

            {/* recharge form */}
            <form onSubmit={handleSubmit} className="py-4 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="input-label">Mobile Number</label>
                        <input type="number" name="number" className="input" placeholder="Mobile number" required />
                    </div>
                    <div>
                        <label className="input-label">Amount</label>
                        <input type="number" name="amount" className="input" placeholder="Amount" required />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:pt-3">
                    <div>
                        <label className="input-label">Select Operator</label>
                        <select name="operator" className="input" defaultValue={""} required>
                            <option value="" disabled>Choose One</option>
                            {
                                companies?.map(company =>
                                    <option value={company?._id} key={company?._id}>{company?.name}</option>
                                )
                            }
                        </select>
                    </div>
                    <div>
                        <label className="input-label">Select Type</label>
                        <select name="type" className="input" defaultValue={"prepaid"} required>
                            <option value="" disabled>Choose One</option>
                            <option value="prepaid">Prepaid</option>
                            <option value="postpaid">Postpaid</option>
                        </select>
                    </div>
                </div>
                <button type="submit" className="button flex mx-auto w-fit mt-5">
                    Submit
                </button>
            </form>
        </div>
    );
};

export default MobileRecharge;