import PropTypes from "prop-types";

const ModalRow = ({ item }) => {
  return (
    <>
      <tr className="text-center">
        <td className="border-2 border-primary w-1/2 font-medium py-1.5 border-collapse">
          {item.uc} UC
        </td>
        <td className="border-2 border-primary w-1/2 font-medium py-1.5 border-collapse">
          {item.codes.length}
        </td>
      </tr>
    </>
  );
};

export default ModalRow;
ModalRow.propTypes = {
  item: PropTypes.object.isRequired,
};
