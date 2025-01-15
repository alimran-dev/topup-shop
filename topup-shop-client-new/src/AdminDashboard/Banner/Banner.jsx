import AddNewBanner from "./AddNewBanner/AddNewBanner";


const Banner = () => {
    return (
        <div>
            <AddNewBanner />

            <h1 className="title mt-3 md:mt-8">Banners</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                existing banner will be here
            </div>
        </div>
    );
};

export default Banner;