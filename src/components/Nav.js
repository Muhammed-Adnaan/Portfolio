import { Link } from 'react-router-dom'; 

export default function Nav() {
  return (
    <div className="fixed top-0 left-0 w-full z-50 backdrop-blur-sm bg-white/5"> 
      <div className="flex mx-[50px] py-4 justify-between text-white">
        <div>
          <Link to="/" className="text-sky-700 hover:text-blue-500 transition-colors duration-200">Home</Link> 
        </div>
        <div>
          <Link to="/resume" className="text-sky-700 hover:text-blue-500 transition-colors duration-200">Resume</Link> 
        </div>
      </div>
    </div>
  );
}