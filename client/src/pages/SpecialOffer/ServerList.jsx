import ServiceCard from "../Home/Services/ServiceCard";
import indoServer from "../../assets/images/indo_server.jpeg";
import bdServer from "../../assets/images/bd_server.jpeg";
const ServerList = () => {
  return (
    <div>
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5 py-3">
        Choose Server
      </h1>
      <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-5 my-5">
        <div className="flex-1">
          <ServiceCard
            image={indoServer}
            path="./indonesia"
            title="Only for Indonesia server"
          />
        </div>
        <div className="flex-1">
          <ServiceCard
            image={bdServer}
            path="./all"
            title="Bangladesh and all other server"
          />
        </div>
      </div>
    </div>
  );
};

export default ServerList;
