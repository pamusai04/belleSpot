import { Routes, Route, NavLink } from 'react-router-dom';
import SimpleHeader from '../common/SimpleHeader';
import CreateShop from './CreateShop';
import ManageShop from './ManageShop';
import ViewShop from './ViewShop';
import ManageOffers from './ManageOffers';
import { useRef, useEffect } from 'react';
import { PlusSquare, Settings, Eye, Tag, Home } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { checkShopExistence } from '../../redux/slices/shopSlice';

const ProviderDashboard = () => {
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const dispatch = useDispatch();


  const { hasShop } = useSelector((state) => state.shop);

  useEffect(() => {
    dispatch(checkShopExistence()).unwrap().catch(err => {
    if (err.message) toast.error(err.message); 
  });
  }, [dispatch]);

  
  useEffect(() => {
    if (headerRef.current && contentRef.current) {
      const headerHeight = headerRef.current.offsetHeight;
      contentRef.current.style.marginTop = `${headerHeight}px`;
    }
  }, []);

  const navLinks = [
    {
      to: 'create-shop',
      icon: <PlusSquare size={24} />,
      text: 'Create Shop',
      disabled: hasShop,
    },
    {
      to: 'manage-shop',
      icon: <Settings size={24} />,
      text: 'Manage Shop',
      disabled: !hasShop,
    },
    {
      to: 'view-shop',
      icon: <Eye size={24} />,
      text: 'View Shop',
      disabled: !hasShop,
    },
    {
      to: 'manage-offers',
      icon: <Tag size={24} />,
      text: 'Manage Offers',
      disabled: !hasShop,
    },
    {
      to: '/',
      icon: <Home size={24} />,
      text: 'Dashboard',
      disabled: false,
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-black">
      <div ref={headerRef}>
        <SimpleHeader />
      </div>

      <div ref={contentRef} className="flex-1 overflow-auto pt-18 md:px-20">
        <h1 className="text-2xl font-bold px-4 mb-4">Service Provider Dashboard</h1>

        {/* Centered Carousel */}
        <div className="relative flex overflow-x-auto py-3 px-2 justify-center">
         
            <div
              className="carousel carousel-center space-x-4 p-4 bg-white rounded-box shadow-sm overflow-x-auto "
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {navLinks.map((link) => (
                <div key={link.to} className="carousel-item">
                  <NavLink
                    to={link.disabled ? '#' : link.to}
                    onClick={(e) => link.disabled && e.preventDefault()}
                    className={({ isActive }) =>
                      `flex flex-col items-center justify-center p-4 rounded-lg w-32 h-22 transition-all duration-300 ease-in-out
                      ${
                        link.disabled
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : isActive
                          ? 'bg-pink-500 text-white shadow-lg'
                          : 'bg-purple-100 text-purple-600 hover:bg-pink-100'
                      }`
                    }
                  >
                    <div className="mb-2">{link.icon}</div>
                    <span className="text-sm font-medium text-center">{link.text}</span>
                  </NavLink>
                </div>
              ))}
            </div>
          
        </div>

        <div className="mt-6">
          <Routes>
            <Route path="create-shop" element={<CreateShop />} />
            <Route path="manage-shop" element={<ManageShop />} />
            <Route path="view-shop" element={<ViewShop />} />
            <Route path="manage-offers" element={<ManageOffers />} />
            <Route
              index
              element={
                <div className="p-4 text-center">
                  <p className="text-gray-600">
                    Select an option above to manage your shops or offers.
                  </p>
                </div>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
