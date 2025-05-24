import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const RestaurantDashboard = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New state variables for the improved Add Modal
  const [storageCondition, setStorageCondition] = useState('');
  const [itemCondition, setItemCondition] = useState('');
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [predictionMsg, setPredictionMsg] = useState('');

  // State variables for Edit Modal
  const [editItem, setEditItem] = useState({
    _id: '',
    name: '',
    category: '',
    purchaseDate: '',
    expiryDate: '',
    quantity: 1,
    unit: 'item',
    notes: ''
  });
  const [editStorageCondition, setEditStorageCondition] = useState('');
  const [editItemCondition, setEditItemCondition] = useState('');
  const [isLoadingEditPrediction, setIsLoadingEditPrediction] = useState(false);
  const [editPredictionMsg, setEditPredictionMsg] = useState('');

  // New item form data
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    purchaseDate: '',
    expiryDate: '',
    quantity: 1,
    unit: 'item',
    notes: ''
  });

  // Budget data
  const [budget, setBudget] = useState({
    total: 1500.00,
    spent: 97.00,
    remaining: 1403.00,
    categories: [
      { name: 'Dairy & Eggs', amount: 52.00 },
      { name: 'Bakery', amount: 45.00 }
    ],
    expenses: [
      { item: 'Milk', category: 'Dairy & Eggs', amount: 28.00 },
      { item: 'Bread', category: 'Bakery', amount: 35.00 },
      { item: 'Eggs', category: 'Dairy & Eggs', amount: 24.00 },
      { item: 'Apples', category: 'Fruits & Vegetables', amount: 10.00 }
    ]
  });

  // Grocery list
  const [groceryList, setGroceryList] = useState([
    { name: 'Milk', quantity: 2, category: 'Dairy & Eggs', bought: 4 },
    { name: 'Bread', quantity: 1, category: 'Bakery', bought: 3 },
    { name: 'Eggs', quantity: 12, category: 'Dairy & Eggs', bought: 2 }
  ]);

  // Tips
  const [tips, setTips] = useState([
    'Store fruits and vegetables properly to extend freshness',
    'Freeze items that are about to expire',
    'Plan your meals around what needs to be used first',
    'Don\'t overshop - buy only what you need'
  ]);

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3002/api/items', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setItems(res.data);
    } catch (error) {
      console.error('Error fetching items:', error.response?.data?.message || error.message);
    }
  };

  // Get prediction for food item expiry
  const getPrediction = async () => {
    if (!newItem.name.trim()) return;
    
    setIsLoadingPrediction(true);
    try {
      // Replace with your actual prediction API endpoint
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:3002/api/predict', 
        { 
          name: newItem.name,
          condition: itemCondition,
          storage: storageCondition
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update the form with predicted data
      if (res.data && res.data.expiryDate) {
        setNewItem({
          ...newItem,
          expiryDate: res.data.expiryDate,
          category: res.data.category || newItem.category
        });
        setPredictionMsg(`Predicted expiry: ${new Date(res.data.expiryDate).toLocaleDateString()}`);
      }
    } catch (error) {
      console.error('Error getting prediction:', error.response?.data?.message || error.message);
      setPredictionMsg('Could not predict expiry date');
    } finally {
      setIsLoadingPrediction(false);
    }
  };

  // Get prediction for edit mode
  const getEditPrediction = async () => {
    if (!editItem.name.trim()) return;
    
    setIsLoadingEditPrediction(true);
    try {
      // Replace with your actual prediction API endpoint
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:3002/api/predict', 
        { 
          name: editItem.name,
          condition: editItemCondition,
          storage: editStorageCondition
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update the form with predicted data
      if (res.data && res.data.expiryDate) {
        setEditItem({
          ...editItem,
          expiryDate: res.data.expiryDate,
          category: res.data.category || editItem.category
        });
        setEditPredictionMsg(`Predicted expiry: ${new Date(res.data.expiryDate).toLocaleDateString()}`);
      }
    } catch (error) {
      console.error('Error getting prediction:', error.response?.data?.message || error.message);
      setEditPredictionMsg('Could not predict expiry date');
    } finally {
      setIsLoadingEditPrediction(false);
    }
  };

  // Add a new item
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const itemToAdd = {
        ...newItem,
        storageCondition,
        itemCondition
      };
      
      await axios.post('http://localhost:3002/api/items', itemToAdd, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Refresh items after adding
      fetchItems();
      // Close modal
      setShowAddModal(false);
      // Reset form
      setNewItem({
        name: '',
        category: '',
        purchaseDate: '',
        expiryDate: '',
        quantity: 1,
        unit: 'item',
        notes: ''
      });
      setStorageCondition('');
      setItemCondition('');
      setPredictionMsg('');
    } catch (error) {
      console.error('Error adding item:', error.response?.data?.message || error.message);
    }
  };

  // Open edit modal with item data
  const openEditModal = (item) => {
    setEditItem({
      _id: item._id,
      name: item.name,
      category: item.category,
      purchaseDate: item.purchaseDate,
      expiryDate: item.expiryDate,
      quantity: item.quantity,
      unit: item.unit,
      notes: item.notes
    });
    setEditStorageCondition(item.storageCondition || '');
    setEditItemCondition(item.itemCondition || '');
    setShowEditModal(true);
  };

  // Update item
  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const itemToUpdate = {
        ...editItem,
        storageCondition: editStorageCondition,
        itemCondition: editItemCondition
      };
      
      await axios.put(`http://localhost:3002/api/items/${editItem._id}`, itemToUpdate, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Refresh items after updating
      fetchItems();
      // Close modal
      setShowEditModal(false);
      setEditPredictionMsg('');
    } catch (error) {
      console.error('Error updating item:', error.response?.data?.message || error.message);
    }
  };

  // Delete item
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3002/api/items/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error.response?.data?.message || error.message);
    }
  };

  // Calculate how many days left until expiry
  const daysUntilExpiry = (expiryDate) => {
    const now = new Date();
    const exp = new Date(expiryDate);
    const diffTime = exp - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filter items based on search query
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate items by status
  const today = new Date();
  const totalItems = items.length;
  const expiringSoonItems = items.filter((item) => {
    const dte = daysUntilExpiry(item.expiryDate);
    return dte > 0 && dte <= 7;
  });
  const expiredItems = items.filter((item) => new Date(item.expiryDate) < today);

  // Get active tab items
  const getActiveTabItems = () => {
    switch(activeTab) {
      case 'expiring':
        return expiringSoonItems;
      case 'expired':
        return expiredItems;
      default:
        return filteredItems;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Restaurant Dashboard</h1>
            <p className="text-gray-600">Track your food items and manage expiry dates</p>
          </div>
          <div className="flex space-x-4">
            <div className="relative">
              <input
                type="text"
                className="border rounded-lg py-2 px-4 pl-10 w-64"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Food Item
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Items */}
          <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
            <div>
              <p className="text-gray-500">Total Items</p>
              <h2 className="text-2xl font-bold">{totalItems}</h2>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
            <div>
              <p className="text-gray-500">Expiring Soon</p>
              <h2 className="text-2xl font-bold">{expiringSoonItems.length}</h2>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Expired */}
          <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
            <div>
              <p className="text-gray-500">Expired</p>
              <h2 className="text-2xl font-bold">{expiredItems.length}</h2>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column (items and meal suggestions) */}
          <div className="lg:col-span-2">
            {/* Expiring Soon List */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <h2 className="text-xl font-semibold">Expiring Soon</h2>
              </div>
              <div className="px-4 pb-4">
                {expiringSoonItems.length === 0 ? (
                  <p className="text-gray-500">No items expiring soon.</p>
                ) : (
                  <div>
                    {expiringSoonItems.slice(0, 3).map((item) => {
                      const dte = daysUntilExpiry(item.expiryDate);
                      return (
                        <div key={item._id} className="border-b py-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.name}</p>
                          </div>
                          <div className={`text-sm px-2 py-1 rounded-full ${
                            dte === 1 ? 'bg-yellow-100 text-yellow-800' : 'bg-yellow-50 text-yellow-700'
                          }`}>
                            {dte === 1 ? 'Tomorrow' : `${dte} days`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* All items with tabs (All, Expiring Soon, Expired) */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b">
                <nav className="flex overflow-x-auto">
                  <button 
                    onClick={() => setActiveTab('all')} 
                    className={`py-3 px-4 font-medium text-sm border-b-2 ${
                      activeTab === 'all' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    All Items ({items.length})
                  </button>
                  <button 
                    onClick={() => setActiveTab('expiring')} 
                    className={`py-3 px-4 font-medium text-sm border-b-2 ${
                      activeTab === 'expiring' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Expiring Soon ({expiringSoonItems.length})
                  </button>
                  <button 
                    onClick={() => setActiveTab('expired')} 
                    className={`py-3 px-4 font-medium text-sm border-b-2 ${
                      activeTab === 'expired' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Expired ({expiredItems.length})
                  </button>
                </nav>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getActiveTabItems().map((item) => {
                    const expired = new Date(item.expiryDate) < today;
                    const dte = daysUntilExpiry(item.expiryDate);
                    return (
                      <div key={item._id} className="border rounded-lg p-4">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{item.name}</h3>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            expired ? 'bg-red-100 text-red-800' : 
                            dte <= 1 ? 'bg-yellow-100 text-yellow-800' :
                            dte <= 5 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {expired ? 'Expired' : 
                             dte === 1 ? '1 day left' : `${dte} days left`}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                        <p className="text-sm mb-4">
                          {item.quantity} {item.unit === 'g' ? 'g' : 
                                           item.unit === 'pcs' ? 'pcs' : 
                                           item.unit}
                        </p>
                        <div className="flex justify-between text-sm">
                          <button 
                            onClick={() => openEditModal(item)}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(item._id)}
                            className="text-red-600 hover:text-red-800 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m5-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div>
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Quick Actions</h2>
              </div>
              <div className="p-2">
                <button onClick={() => navigate("/inventory")} className="w-full text-left flex items-center p-2 hover:bg-gray-50 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Inventory Report
                </button>
                <button onClick={() => navigate("/voice-scan")} className="w-full text-left flex items-center p-2 hover:bg-gray-50 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Voice Scan
                </button>
                <button onClick={() => navigate("/barcode-scan")} className="w-full text-left flex items-center p-2 hover:bg-gray-50 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Barcode Scan
                </button>
                <button onClick={() => navigate("/meal-suggestion")} className="w-full text-left flex items-center p-2 hover:bg-gray-50 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Manage Grocery List
                </button>
              </div>
            </div>

            {/* Food Waste Prevention Tips */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Food Waste Prevention Tips</h2>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>




      {/* Add Item Modal */}
      {showAddModal && (
  <div className="fixed inset-0 z-10 overflow-y-auto">
    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>
      <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New Food Item</h3>
              <form onSubmit={handleAddItem}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Name</label>
                  <div className="flex">
                    <input
                      type="text"
                      className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-l-md"
                      required
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    />
                    <button
                      type="button"
                      onClick={getPrediction}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-3 rounded-r-md"
                      disabled={isLoadingPrediction}
                    >
                      {isLoadingPrediction ? 'Loading...' : 'Predict'}
                    </button>
                  </div>
                  {predictionMsg && <p className="text-sm text-blue-600 mt-1">{predictionMsg}</p>}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Storage Condition</label>
                  <select
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                    value={storageCondition}
                    onChange={(e) => setStorageCondition(e.target.value)}
                  >
                    <option value="">Select Storage Condition</option>
                    <option value="fridge">Fridge</option>
                    <option value="room temperature">Room Temperature</option>
                    <option value="freezer">Freezer</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                  <select
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  >
                    <option value="">Select a category</option>
                    <option value="Uncategorized">Uncategorized</option>
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Meat & Seafood">Meat & Seafood</option>
                    <option value="Pantry">Pantry</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Item Condition</label>
                  <select
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                    value={itemCondition}
                    onChange={(e) => setItemCondition(e.target.value)}
                  >
                    <option value="">Select Condition</option>
                    <option value="fresh">Fresh</option>
                    <option value="slightly bruised">Slightly Bruised</option>
                    <option value="damaged pack">Damaged Pack</option>
                    <option value="spoiled">Spoiled</option>
                    <option value="near expiry">Near Expiry</option>
                    <option value="sealed & intact">Sealed & Intact</option>
                    <option value="minor defect">Minor Defect</option>
                    <option value="overripe">Overripe</option>
                    <option value="leaky pack">Leaky Pack</option>
                    <option value="discolored">Discolored</option>
                  </select>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={handleAddItem}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Add Item
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(false)}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Edit Item Modal */}
{showEditModal && (
  <div className="fixed inset-0 z-10 overflow-y-auto">
    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>
      <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Edit Food Item</h3>
              <form onSubmit={handleUpdateItem}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Name</label>
                  <div className="flex">
                    <input
                      type="text"
                      className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-l-md"
                      required
                      value={editItem.name}
                      onChange={(e) => setEditItem({...editItem, name: e.target.value})}
                    />
                    <button
                      type="button"
                      onClick={getEditPrediction}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-3 rounded-r-md"
                      disabled={isLoadingEditPrediction}
                    >
                      {isLoadingEditPrediction ? 'Loading...' : 'Predict'}
                    </button>
                  </div>
                  {editPredictionMsg && <p className="text-sm text-blue-600 mt-1">{editPredictionMsg}</p>}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Storage Condition</label>
                  <select
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                    value={editStorageCondition}
                    onChange={(e) => setEditStorageCondition(e.target.value)}
                  >
                    <option value="">Select Storage Condition</option>
                    <option value="fridge">Fridge</option>
                    <option value="room temperature">Room Temperature</option>
                    <option value="freezer">Freezer</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                  <select
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                    value={editItem.category}
                    onChange={(e) => setEditItem({...editItem, category: e.target.value})}
                  >
                    <option value="">Select a category</option>
                    <option value="Uncategorized">Uncategorized</option>
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Meat & Seafood">Meat & Seafood</option>
                    <option value="Pantry">Pantry</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Item Condition</label>
                  <select
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                    value={editItemCondition}
                    onChange={(e) => setEditItemCondition(e.target.value)}
                  >
                    <option value="">Select Condition</option>
                    <option value="fresh">Fresh</option>
                    <option value="slightly bruised">Slightly Bruised</option>
                    <option value="damaged pack">Damaged Pack</option>
                    <option value="spoiled">Spoiled</option>
                    <option value="near expiry">Near Expiry</option>
                    <option value="sealed & intact">Sealed & Intact</option>
                    <option value="minor defect">Minor Defect</option>
                    <option value="overripe">Overripe</option>
                    <option value="leaky pack">Leaky Pack</option>
                    <option value="discolored">Discolored</option>
                  </select>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={handleUpdateItem}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Update Item
          </button>
          <button
            type="button"
            onClick={() => setShowEditModal(false)}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}


    </div>
  );
};




export default RestaurantDashboard;