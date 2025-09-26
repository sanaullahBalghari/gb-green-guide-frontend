import { Bouncy } from 'ldrs/react'
import 'ldrs/react/Bouncy.css'
// import 'ldrs/bouncy';


const Loader = ({ size = 45, speed = 1.75, color = 'black', message = '' }) => {
    return (
        <div className="flex flex-col items-center justify-center py-10 mx-auto">
            <Bouncy size={size} speed={speed} color={color} />
            {message && <p className="mt-4 text-gray-600 text-sm">{message}</p>}
        </div>
    );
};

export default Loader;



