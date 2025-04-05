import PropTypes from 'prop-types';
import verifiedIcon from '../../../assets/icons/verified-badge.webp';


const UserName = ({ name, isVerified = false, nameClass="", iconClass="" }) => {
    return (
        <div className='flex items-center gap-1'>
            <h3 className={`${!nameClass} capitalize`}>{name}</h3>
            {isVerified &&
                <img src={verifiedIcon} className={`${iconClass} w-5 h-5 object-contain mt-1`} alt="verified badge" />
            }
        </div>
    );
};

UserName.propTypes = {
    name: PropTypes.string.isRequired,
    isVerified: PropTypes.bool,
    nameClass: PropTypes.string,
    iconClass: PropTypes.string,
};

export default UserName;
