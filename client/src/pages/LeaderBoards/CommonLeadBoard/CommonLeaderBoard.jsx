import crownImg from '../../../assets/images/crown.png';
import { FaMedal } from "react-icons/fa";
import { RiCoinFill } from "react-icons/ri";


const CommonLeaderBoard = () => {
    return (
        <div>

            {/* 1st place */}
            <div className="pt-10 pb-4 md:pb-8 flex flex-col items-center bg-primary rounded-t-md text-white">
                <div className='w-fit relative'>
                    <img src="https://i.ibb.co.com/phNffNq/user.png" className="w-16 object-cover rounded-full" alt="user image" />
                    <img src={crownImg} className='w-20 absolute -top-8 left-1/2 -translate-x-1/2' alt="crown icon" />
                </div>
                <h3 className="text-lg md:text-xl font-bold py-2">Avi Debnath</h3>
                <p className='flex items-center gap-1 '>
                    <FaMedal className='text-yellow-500' />
                    500000 Earned Coins
                </p>
            </div>

            {/* rest data */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 px-2 py-4'>

                <div className='w-full flex items-center gap-4 bg-slate-200 px-2 py-1 rounded-md'>
                    <p>2</p>
                    <div className='flex-1 flex items-center gap-1'>
                        <img src="https://i.ibb.co.com/phNffNq/user.png" className="w-8 object-cover rounded-full" alt="user image" />
                        <h4>Avi Debnath</h4>
                    </div>
                    <p className='flex items-center gap-1'>
                        <RiCoinFill className='text-yellow-500 space-y-1' />2000
                    </p>
                </div>

            </div>

        </div>
    );
};

export default CommonLeaderBoard;