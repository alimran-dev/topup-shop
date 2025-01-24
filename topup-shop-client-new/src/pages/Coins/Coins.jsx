

const Coins = () => {
    return (
        <div>
            <h2 className="title">Your Coins</h2>
            <div className="md:max-w-lg md:mx-auto flex justify-between items-center gap-2 border bg-slate-100 px-5 py-2 rounded-full capitalize">
            <p>Total Coin Balance</p>
            <p className="text-primary font-semibold">500</p>
            </div>
        </div>
    );
};

export default Coins;