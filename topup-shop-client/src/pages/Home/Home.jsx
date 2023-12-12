import Banner from "./Banner/Banner";
import FollowUs from "./FollowUs/FollowUs";
import Services from "./Services/Services";

const Home = () => {
    return (
        <div className="space-y-5">
            <Banner />
            <Services />
            <FollowUs />
        </div>
    );
};

export default Home;