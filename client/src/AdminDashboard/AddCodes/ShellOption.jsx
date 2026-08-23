import PropTypes from "prop-types";  

const ShellOption = ({ option, selected, setSelected }) => {
    const {_id, name} = option || {};
    const handleSelect = () => {
        setSelected(option);
    }
    return (
        <div onClick={handleSelect} className={`flex items-center gap-1.5 py-1.5 px-3 rounded border-2 cursor-pointer ${selected._id===_id?"border-primary":"border-gray-400"}`}>
            <span className={`border-[5px] rounded-full ${selected._id === _id ? "border-primary" : ""}`}></span>
            <p className={`text-sm font-semibold ${selected._id===_id?"text-primary":"text-gray-600"}`}>{ name }</p>
        </div>
    );
};

export default ShellOption;
ShellOption.propTypes = {
    option: PropTypes.object.isRequired,
    selected: PropTypes.object.isRequired,
    setSelected: PropTypes.func.isRequired,
}