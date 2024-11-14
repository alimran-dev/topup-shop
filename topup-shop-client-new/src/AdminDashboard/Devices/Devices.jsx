import { useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import DevicesCard from "./DevicesCard";
import Swal from "sweetalert2";
import Loader from "../../components/Loader";

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();
  const handleAddDevice = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const form = e.target;
    const name = form.name.value;
    const deviceID = form.id.value;
    const device = { name, deviceID };
    // console.log(device);
    axiosPrivate.post("/device/admin/add", device).then((res) => {
      setIsLoading(false);
      if (res.data?.insertedId) {
        Swal.fire({
          toast: true,
          title: "Device added",
          showConfirmButton: false,
          position: "top",
          icon: "success",
          timer: 3000,
        });
        form.reset();
      }
    });
  };
  useState(() => {
    axiosPrivate.get("/device/admin/all").then((res) => {
      setDevices(res.data);
      setIsLoading(false);
    });
  }, []);
  return (
    <div>
      <Loader isLoading={isLoading} />
      <h2 className="text-center text-2xl md:text-5xl font-bold px-4 bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text pb-3">
        Device Management
      </h2>
      <form
        onSubmit={handleAddDevice}
        className="flex flex-col w-fit mx-auto items-center justify-center gap-2"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="font-medium">
            Device Name
          </label>
          <input
            name="name"
            type="text"
            required
            className="border-2 border-gray-400 focus:outline-[#E61C55] px-3 py-1.5 rounded-md"
            placeholder="Enter Device Name"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="id" className="font-medium">
            Device ID
          </label>
          <input
            name="id"
            type="text"
            required
            className="border-2 border-gray-400 focus:outline-[#E61C55] px-3 py-1.5 rounded-md"
            placeholder="Enter device ID"
          />
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] font-semibold text-white px-3 py-1.5 rounded-md"
        >
          Add Device
        </button>
      </form>
      <h2 className="text-center text-2xl md:text-4xl font-bold px-4 bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text py-3">
        All added devices
      </h2>
      <div className="flex flex-wrap items-stretch justify-center gap-3">
        {devices?.map((device) => (
          <DevicesCard
            device={device}
            devices={devices}
            setDevices={setDevices}
            setIsLoading={setIsLoading}
            key={device?._id}
          />
        ))}
      </div>
      {devices.length > 0 || (
        <div className="h-full w-full flex flex-col items-center justify-center gap-2">
          <span className="text-3xl font-medium">No Device</span>
          <button
            onClick={() => window.location.reload()}
            className="border-2 border-[#FA6023] px-4 py-0.5 rounded font-bold bg-gradient-to-r from-[#FA6023] to-[#E61C55] bg-clip-text text-transparent"
          >
            Reload
          </button>
        </div>
      )}
    </div>
  );
};

export default Devices;
