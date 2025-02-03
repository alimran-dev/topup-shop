

const RedeemCode = () => {

    
    // add redeem code
    const handleAddRedeemCode = async (e) => {
        e.preventDefault();

        const values = {
            redeemCode: e.target.redeemCode.value,
            limit: e.target.limit.value,
            value: e.target.value.value,
        }

        console.log('redeem added values:', values);
        
    };

    return (
        <div className="flex flex-col items-center">
            <h2 className="title">Redeem Code</h2>
            <form onSubmit={handleAddRedeemCode}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="input-label">Redeem Code</label>
                        <input type="text" name="redeemCode" className="input" placeholder="Type redeem code" required />
                    </div>
                    <div>
                        <label className="input-label">Limit</label>
                        <input type="number" name="limit" className="input" placeholder="Type limit" required />
                    </div>
                    <div>
                        <label className="input-label">Value</label>
                        <input type="number" name="value" className="input" placeholder="Type value" required />
                    </div>
                </div>
                <button type="submit" className="button block mx-auto bg-gradient mt-5">Add</button>
            </form>
            <button type="submit" className="button bg-gradient mt-5">Remove</button>
        </div>
    );
};

export default RedeemCode;