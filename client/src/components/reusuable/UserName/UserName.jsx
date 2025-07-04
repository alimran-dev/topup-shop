import PropTypes from 'prop-types';
import verifiedIcon from '../../../assets/icons/verified-badge.webp';
import Tick from '../../Tick';


const UserName = ({ name, isVerified = false, nameClass="", iconClass="" }) => {
    return (
        <span className='flex items-center gap-1'>
            <span className={`${!nameClass} capitalize`}>{name}</span>
            {/* {isVerified &&
                <img src={verifiedIcon} className={`${iconClass} w-5 h-5 object-contain mt-1`} alt="verified badge" />
            } */}
            {
                isVerified && <Tick />
            }
        </span>
    );
};

UserName.propTypes = {
    name: PropTypes.string.isRequired,
    isVerified: PropTypes.bool,
    nameClass: PropTypes.string,
    iconClass: PropTypes.string,
};

export default UserName;
