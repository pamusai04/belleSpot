// src/components/Layout.jsx
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from '../user/Sidebar';
import MobileNavigation from '../user/MobileNavigation.jsx '; // We'll create this

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col transition-all duration-300 ease-in-out">
      <Header />
      <div className="flex flex-1 pt-14 transition-all duration-300 ease-in-out flex-col">
        <Sidebar />
        <div className="flex-1  py-3 pb-5 transition-all duration-300 ease-in-out">
          <Outlet /> {/* This will render the matched route */}
        </div>
      </div>
      <MobileNavigation />
    </div>
  );
};

export default Layout;