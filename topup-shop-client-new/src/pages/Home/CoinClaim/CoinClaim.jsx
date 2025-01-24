

const CoinClaim = () => {

    // coin claim fn
    const handleClaimCoin = () => {
        console.log('hitted cliam btn');
    }

    return (
        <div className="flex justify-between items-center gap-3 bg-slate-100 border rounded-full p-2">
            <p className="ml-3">
                <span>Collect Coins</span>
                <span className="ml-2 text-primary text-xs">+100</span>
            </p>
            <button onClick={handleClaimCoin} className="button !rounded-full">Claim</button>
        </div>
    );
};

export default CoinClaim;