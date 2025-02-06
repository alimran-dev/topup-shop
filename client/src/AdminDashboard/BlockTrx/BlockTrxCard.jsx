import PropTypes from "prop-types";
import Swal from "sweetalert2";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const BlockTrxCard = ({ trx, blockTrxs, setBlockTrxs, setIsLoading }) => {
  const axiosPrivate = useAxiosPrivate();
  const { _id, provider, category, trxID } = trx || {};
  const handleUnblock = () => {
    Swal.fire({
      title: "Are you sure?",
      text: `Unblock ${trxID}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E61C55",
      cancelButtonColor: "#d33",
      confirmButtonText: "Unblock",
    }).then((result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        axiosPrivate
          .delete(`/transaction/block/admin/delete?id=${_id}`)
          .then((res) => {
            setIsLoading(false);
            if (res.data?.deletedCount > 0) {
              Swal.fire({
                toast: true,
                title: "Unblocked successfully",
                showConfirmButton: false,
                icon: "success",
                position: "top",
                timer: 3000,
              });
              const newBlocks = blockTrxs.filter((trx) => trx?._id !== _id);
              setBlockTrxs(newBlocks);
            }
          });
      }
    });
  };
  return (
    <div className="flex flex-col border-2 border-[#E61C55] w-fit p-4 rounded-md space-y-1.5">
      <p className="capitalize">
        <span className="font-semibold">Provider: </span> {provider}
      </p>
      <p className="capitalize">
        <span className="font-semibold">Category: </span> {category}
      </p>
      <p>
        <span className="font-semibold">TrxID: </span> {trxID}
      </p>
      <button
        onClick={handleUnblock}
        type="submit"
        className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-white font-semibold px-3 py-1 rounded-md"
      >
        Unblock
      </button>
    </div>
  );
};

export default BlockTrxCard;

BlockTrxCard.propTypes = {
  trx: PropTypes.object.isRequired,
  blockTrxs: PropTypes.array.isRequired,
  setBlockTrxs: PropTypes.func.isRequired,
  setIsLoading: PropTypes.func.isRequired,
};
