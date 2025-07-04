import PropTypes from "prop-types";
import avatarImg from "../../../assets/images/avater.png";

const Avatar = ({ className = "" }) => {
    return (
        <img src={avatarImg} className={`w-10 h-10 rounded-full ${className}`} alt="avatar" />
    );
};

Avatar.propTypes = {
    className: PropTypes.string,
};

export default Avatar;
