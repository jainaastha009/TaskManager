import React from 'react';
import Tasktable from './Components/Tasktable';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Ensure this is imported!

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Tasktable />
    </div>
  );
};

export default App;
