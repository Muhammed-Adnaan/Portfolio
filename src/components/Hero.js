import backgroundImage from './assets/images/background.jpg'; // Import the image
// import arrowr from './assets/images/arrowr.png'; // Import the image
// import arrowl from './assets/images/arrowl.png'; // Import the image
import Education from './Education';
import Project from './Project';

export default function Hero() {
  return (
    <div className="bg-cover bg-center bg-no-repeat h-auto w-screen" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="fixed w-full  text-center text-white  text-5xl font-bold">
            <h1 className='absolute top-[300px] w-full'>MUHAMMED ADNAAN</h1>
            <p className='absolute top-[350px] w-full text-xl'>COMPUTER SCIENCE ENGINEER</p>
            <div className='bg-gray-50/10 h-[450px]'></div>
        </div>
            <div className='bg-white translate-y-[440px] '>
                <Education/>
            {/* <img src={arrowl} class='size-10 -translate-y-[70px] hover:opacity-10' alt="Arrow left" /> */}
            {/* <img src={arrowr} class='size-10 absolute right-0 -translate-y-[120px] hover:opacity-10 ' alt="Arrow left" /> */}
            <div className=''>
            <Project></Project>
            </div>
            </div>
    </div>
  );
}