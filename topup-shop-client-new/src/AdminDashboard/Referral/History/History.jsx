import { useState } from "react";


const History = () => {

    const [userEmail, setUserEmail] = useState('');

    console.log(userEmail);
    

    return (
        <div>
            <h2 className="title">Referral History</h2>

            {/* user email for filter */}
            <div className="max-w-xl mx-auto">
                <label className="input-label">User{"'"}s Email</label>
                <input type="email" className="input" onChange={(e) => setUserEmail(e.target.value)} placeholder="User's Email" />
            </div>

            {/* all history */}
            <div className="py-4">
                history here
            </div>

        </div>
    );
};

export default History;