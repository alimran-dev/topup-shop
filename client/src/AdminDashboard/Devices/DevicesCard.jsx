import PropTypes from "prop-types";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Swal from "sweetalert2";

const DevicesCard = ({ device, devices, setDevices, setIsLoading }) => {
  const axiosPrivate = useAxiosPrivate();
  const { _id, name, deviceID } = device || {};
  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete ${name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E61C55",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        axiosPrivate.delete(`/device/admin/delete?id=${_id}`).then((res) => {
          setIsLoading(false);
          if (res.data?.deletedCount > 0) {
            Swal.fire({
              toast: true,
              title: "Deleted successfully",
              showConfirmButton: false,
              icon: "success",
              position: "top",
              timer: 3000,
            });
            const newDevices = devices.filter((device) => device?._id !== _id);
            setDevices(newDevices);
          }
        });
      }
    });
  };
  return (
    <div className="border-2 border-[#E61C55] w-fit px-5 py-3 space-y-2.5 rounded-md">
      <p>
        <span className="font-semibold">Device Name: </span> {name}
      </p>
      <p>
        <span className="font-semibold">Device ID: </span> {deviceID}
      </p>
      <button
        onClick={handleDelete}
        className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] px-3 py-1 font-medium text-white rounded-md block mx-auto"
      >
        Delete
      </button>
    </div>
  );
};

export default DevicesCard;

DevicesCard.propTypes = {
  device: PropTypes.object.isRequired,
  devices: PropTypes.array.isRequired,
  setDevices: PropTypes.func.isRequired,
  setIsLoading: PropTypes.func.isRequired,
};
