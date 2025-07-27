import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, fetchAllShops } from '../../redux/slices/adminSlice';
import { Pagination } from '@mui/material';
import LoadingSpinner from "../common/LoadingSpinner ";
const AdminDashboard = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('users');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { 
    users, 
    shops, 
    usersLoading, 
    shopsLoading, 
    usersError, 
    shopsError 
  } = useSelector((state) => state.admin);

  useEffect(() => {
    if (activeTab === 'users') {
      dispatch(fetchAllUsers());
    } else {
      dispatch(fetchAllShops());
    }
  }, [activeTab, dispatch]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const currentData = activeTab === 'users' ? users : shops;
  const totalItems = currentData.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const paginatedData = currentData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div className="  text-white bg-gray-900 min-h-screen flex flex-col">
      <div className="px-4 md:px-30 pt-16">
        <h1 className="text-2xl font-bold p-4">Admin Dashboard</h1>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 mb-4">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'users' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400'}`}
            onClick={() => {
              setActiveTab('users');
              setPage(1);
            }}
          >
            User Profiles
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'shops' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400'}`}
            onClick={() => {
              setActiveTab('shops');
              setPage(1);
            }}
          >
            Admin Profiles
          </button>
        </div>

        {/* Loading State */}
        {(usersLoading || shopsLoading) && (
          <div className="flex justify-center items-center h-64">
           <LoadingSpinner/>
          </div>
        )}

        {/* Error State */}
        {usersError && activeTab === 'users' && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{usersError}</p>
          </div>
        )}
        {shopsError && activeTab === 'shops' && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{shopsError}</p>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                {activeTab === 'users' ? (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Profile</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Gender</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Shop Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Shop Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Owner</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-700">
                    {activeTab === 'users' ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={item.profilePhoto || 'https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg'}
                            alt={item.firstName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {item.firstName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                          }`}>
                            {item.gender === 'male' ? 'Male' : 'Female'}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={item.shopImage}
                            alt={item.shopName}
                            className="h-10 w-10 rounded object-cover"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {item.shopName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-yellow-400 mr-1">★</span>
                            <span>{item.globalRating.avg_rating.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {item.providerName}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={activeTab === 'users' ? 3 : 4} className="px-6 py-4 text-center text-gray-400">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fixed Pagination at Bottom */}
      <div className="mt-auto px-4 py-3 bg-gray-800 border-t border-gray-700 sticky bottom-0">
        <div className="flex justify-between items-center">
          <div className="hidden sm:block  items-center space-x-2">
            <span className="text-sm text-gray-400">
              Showing {(page - 1) * rowsPerPage + 1} to{' '}
              {Math.min(page * rowsPerPage, totalItems)} of {totalItems} entries
            </span>
          </div>
          
          <Pagination
            count={totalPages}
            page={page}
            onChange={handleChangePage}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                color: 'white',
                borderColor: 'white',
              },
              '& .MuiPaginationItem-icon': {
                color: 'white',
              },
              '& .Mui-selected': {
                backgroundColor: '#1976d2',
                color: 'white',
              }
            }}
          />

          <div className="flex items-center space-x-2">
            <span className="hidden sm:block text-sm text-gray-400">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              className="bg-gray-700 text-white rounded px-2 py-1 text-sm"
            >
              {[5, 10, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;