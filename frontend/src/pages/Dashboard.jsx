import { useState } from 'react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Your Dashboard</h1>
      
      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 ${activeTab === 'inventory' ? 'border-b-2 border-primary font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'suggestions' ? 'border-b-2 border-primary font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('suggestions')}
          >
            Meal Suggestions
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'stats' ? 'border-b-2 border-primary font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('stats')}
          >
            Waste Analytics
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        {activeTab === 'inventory' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Food Inventory</h2>
            <p className="text-gray-500">You don't have any items in your inventory yet. Add some to get started!</p>
            <button className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors">
              Add Item
            </button>
          </div>
        )}
        
        {activeTab === 'suggestions' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">AI Meal Suggestions</h2>
            <p className="text-gray-500">Add items to your inventory to get personalized meal suggestions.</p>
          </div>
        )}
        
        {activeTab === 'stats' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Waste Analytics</h2>
            <p className="text-gray-500">Track your food waste reduction progress here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
