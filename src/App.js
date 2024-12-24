import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import Nav from './components/Nav';
import Resume from './components/Resume';

 function App(){
  return (
    <div>
      <Router>
      <Nav/> 
      <Routes>
        <Route path="/" element={<Hero/>} /> 
        <Route path="/resume" element={<Resume />} /> 
      </Routes>
    </Router>
      {/* <Hero/> */}
    </div>
  );
}

export default App;
