import React, { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid } from 'recharts';
import axios from 'axios';

export default function Inventory() {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('overview'); // 'overview', 'expiry', 'usage', 'waste'
  const [dashboardStats, setDashboardStats] = useState({
    totalItems: 0,
    inStockItems: 0,
    usedItems: 0,
    expiredItems: 0,
    donatedItems: 0,
    statusData: [],
    expiryCalendar: [],
    topWastedItems: [],
    weeklyUsageData: []
  });

  // Get status based on item properties
  const getItemStatus = (item) => {
    if (item.status === "expired") return "Expired";
    if (item.status === "donated") return "Donated";
    if (item.status === "used") return "Used";
    return "In Stock";
  };

  // Format data for the inventory table
  const formatInventoryData = (items) => {
    return items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: `${item.quantity} ${item.unit}`,
      purchaseDate: new Date(item.purchaseDate).toLocaleDateString(),
      expiryDate: new Date(item.expiryDate).toLocaleDateString(),
      status: getItemStatus(item),
      cost: `$${item.cost.toFixed(2)}`
    }));
  };

  // Prepare dashboard data
  const prepareDashboardData = (items) => {
    // Status distribution for donut chart
    const statusCounts = {
      "In Stock": 0,
      "Used": 0,
      "Expired": 0,
      "Donated": 0
    };
    
    items.forEach(item => {
      statusCounts[item.status]++;
    });
    
    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ 
      name, 
      value,
      percentage: items.length > 0 ? ((value / items.length) * 100).toFixed(0) : 0
    }));
    
    // Expiry calendar data
    const expiryDates = {};
    items.forEach(item => {
      if (item.status === "In Stock") {
        const expDate = item.expiryDate;
        if (!expiryDates[expDate]) {
          expiryDates[expDate] = 0;
        }
        expiryDates[expDate]++;
      }
    });
    
    const today = new Date();
    const expiryCalendar = Object.entries(expiryDates).map(([date, count]) => {
      const expiryDate = new Date(date);
      const daysUntil = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      
      return {
        date,
        count,
        daysUntil,
        urgent: daysUntil <= 2
      };
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Top wasted items (expired)
    const wastedItems = {};
    items.forEach(item => {
      if (item.status === "Expired") {
        if (!wastedItems[item.name]) {
          wastedItems[item.name] = { count: 0, cost: 0 };
        }
        wastedItems[item.name].count++;
        wastedItems[item.name].cost += parseFloat(item.cost || 0);
      }
    });
    
    const topWastedItems = Object.entries(wastedItems)
      .map(([name, data]) => ({
        name,
        count: data.count,
        cost: data.cost.toFixed(2)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Weekly usage data
    const weeklyData = generateWeeklyData(items);
    
    return {
      totalItems: items.length,
      inStockItems: statusCounts["In Stock"],
      usedItems: statusCounts["Used"],
      expiredItems: statusCounts["Expired"],
      donatedItems: statusCounts["Donated"],
      statusData,
      expiryCalendar,
      topWastedItems,
      weeklyUsageData: weeklyData
    };
  };

  // Generate mock weekly usage data - in a real app this would come from the API
  const generateWeeklyData = (items) => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    
    return weeks.map(week => {
      // In real app, you'd filter items by actual dates
      return {
        name: week,
        used: Math.floor(Math.random() * 50) + 20,
        expired: Math.floor(Math.random() * 10) + 5,
        restocked: Math.floor(Math.random() * 60) + 30
      };
    });
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an actual API call
        // For demo purposes, we'll create mock data
        const mockData = generateMockInventoryData();
        
        const formattedData = formatInventoryData(mockData);
        setInventoryData(formattedData);
        setDashboardStats(prepareDashboardData(formattedData));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching items:', error.message);
        setError('Failed to load inventory data');
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Generate mock data for demonstration
  const generateMockInventoryData = () => {
    const categories = ['Meat', 'Seafood', 'Produce', 'Dairy', 'Spices', 'Staples'];
    const statuses = ['active', 'used', 'expired', 'donated'];
    const units = ['kg', 'g', 'liters', 'pcs', 'bottles'];
    const items = [
      'Chicken Breast', 'Beef Sirloin', 'Salmon', 'Shrimp', 'Tomatoes', 
      'Lettuce', 'Cheese', 'Milk', 'Paprika', 'Salt', 'Pepper', 
      'Rice', 'Pasta', 'Flour', 'Sugar', 'Olive Oil'
    ];
    
    const generateDate = (daysOffset = 0) => {
      const date = new Date();
      date.setDate(date.getDate() + daysOffset);
      return date.toISOString().split('T')[0];
    };
    
    return Array.from({ length: 100 }, (_, i) => {
      const name = items[Math.floor(Math.random() * items.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const unit = units[Math.floor(Math.random() * units.length)];
      
      return {
        id: i + 1,
        name,
        category,
        quantity: Math.floor(Math.random() * 20) + 1,
        unit,
        purchaseDate: generateDate(-Math.floor(Math.random() * 30)),
        expiryDate: generateDate(Math.floor(Math.random() * 14) - 3),
        status,
        cost: (Math.random() * 50 + 5).toFixed(2)
      };
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-700";
      case "Expired":
        return "bg-red-100 text-red-700";
      case "Used":
        return "bg-yellow-100 text-yellow-800";
      case "Donated":
        return "bg-blue-100 text-blue-700";
      default:
        return "";
    }
  };

  // Colors for charts
  const STATUS_COLORS = {
    'In Stock': '#10B981',  // Green
    'Used': '#F59E0B',      // Yellow/Orange
    'Expired': '#EF4444',   // Red
    'Donated': '#3B82F6'    // Blue
  };

  // Calendar date color based on urgency
  const getExpiryDateColor = (daysUntil) => {
    if (daysUntil <= 0) return 'bg-red-500 text-white';
    if (daysUntil <= 2) return 'bg-red-100 text-red-800';
    if (daysUntil <= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent" role="status"></div>
          <p className="mt-2">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Restaurant Inventory Dashboard</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setView('overview')}
            className={`px-4 py-2 rounded ${view === 'overview' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setView('expiry')}
            className={`px-4 py-2 rounded ${view === 'expiry' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Expiry Dates
          </button>
          <button 
            onClick={() => setView('waste')}
            className={`px-4 py-2 rounded ${view === 'waste' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Waste Analysis
          </button>
          <button 
            onClick={() => setView('usage')}
            className={`px-4 py-2 rounded ${view === 'usage' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Usage Trends
          </button>
        </div>
      </div>

      {/* Overview Dashboard Section */}
      {view === 'overview' && (
        <>
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold mb-4">Inventory Status</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-2xl font-bold">{dashboardStats.totalItems}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">In Stock</p>
                <p className="text-2xl font-bold text-green-500">{dashboardStats.inStockItems}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Used Items</p>
                <p className="text-2xl font-bold text-yellow-500">{dashboardStats.usedItems}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Expired/Donated</p>
                <p className="text-2xl font-bold">
                  <span className="text-red-500">{dashboardStats.expiredItems}</span> / 
                  <span className="text-blue-500"> {dashboardStats.donatedItems}</span>
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status Distribution Chart */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-md font-medium mb-2">Inventory Status Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardStats.statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                      >
                        {dashboardStats.statusData.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={STATUS_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                      <Legend layout="vertical" verticalAlign="bottom" align="center" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Top Expiring Items */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-md font-medium mb-2">Upcoming Expiry Dates</h3>
                <div className="h-64 overflow-auto">
                  {dashboardStats.expiryCalendar.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {dashboardStats.expiryCalendar.slice(0, 5).map((item, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3 rounded flex justify-between items-center ${getExpiryDateColor(item.daysUntil)}`}
                        >
                          <span>{item.date}</span>
                          <span className="font-bold">{item.count} items</span>
                          {item.urgent && (
                            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded">URGENT</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No items with upcoming expiry dates.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold mb-4">Current Inventory</h2>
            {inventoryData.filter(item => item.status === "In Stock").length === 0 ? (
              <p className="text-gray-500">No active inventory items found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-t border-b">
                  <thead className="border-b">
                    <tr>
                      <th className="py-2">Item Name</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Purchase Date</th>
                      <th>Expiry Date</th>
                      <th>Cost</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData
                      .filter(item => item.status === "In Stock")
                      .slice(0, 10)
                      .map((item, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="py-2">{item.name}</td>
                          <td>{item.category}</td>
                          <td>{item.quantity}</td>
                          <td>{item.purchaseDate}</td>
                          <td>{item.expiryDate}</td>
                          <td>{item.cost}</td>
                          <td>
                            <span className={`px-2 py-1 text-sm rounded ${getStatusClass(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <p className="mt-2 text-sm text-gray-500">Showing 10 of {inventoryData.filter(item => item.status === "In Stock").length} items in stock</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Expiry Calendar View */}
      {view === 'expiry' && (
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-lg font-semibold mb-4">Expiry Date Calendar</h2>
          
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-2">
              <span className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                <span className="text-xs">Expired</span>
              </span>
              <span className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-red-200 mr-1"></span>
                <span className="text-xs">Urgent (1-2 days)</span>
              </span>
              <span className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-yellow-200 mr-1"></span>
                <span className="text-xs">Soon (3-5 days)</span>
              </span>
              <span className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-200 mr-1"></span>
                <span className="text-xs">Good (6+ days)</span>
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {dashboardStats.expiryCalendar.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-lg shadow-sm ${getExpiryDateColor(item.daysUntil)}`}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{item.date}</h3>
                  {item.urgent && (
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">URGENT</span>
                  )}
                </div>
                <p className="mt-2 text-lg font-bold">{item.count} items expiring</p>
                <p className="text-sm">
                  {item.daysUntil <= 0 
                    ? "Already expired" 
                    : item.daysUntil === 1 
                      ? "Tomorrow"
                      : `In ${item.daysUntil} days`}
                </p>
              </div>
            ))}
          </div>
          
          {dashboardStats.expiryCalendar.length === 0 && (
            <p className="text-gray-500">No expiry dates to display.</p>
          )}
        </div>
      )}

      {/* Waste Analysis View */}
      {view === 'waste' && (
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-lg font-semibold mb-4">Waste Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Wasted Items Chart */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-md font-medium mb-2">Top 5 Most Frequently Expired Items</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardStats.topWastedItems}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [value, name === "count" ? "Items Expired" : "Cost Wasted ($)"]} />
                    <Legend />
                    <Bar dataKey="count" name="Items Expired" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Waste Cost Analysis */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-md font-medium mb-2">Waste Cost Analysis</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardStats.topWastedItems}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [name === "cost" ? `$${value}` : value, name === "cost" ? "Cost Wasted" : "Items Expired"]} />
                    <Legend />
                    <Bar dataKey="cost" name="Cost Wasted ($)" fill="#9333EA" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-md font-medium mb-2">Waste Reduction Recommendations</h3>
            <div className="space-y-3">
              {dashboardStats.topWastedItems.length > 0 ? (
                <>
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <p className="text-sm font-medium text-red-800">
                      High Waste Item Alert: <br />
                      {dashboardStats.topWastedItems[0].name} has the highest waste rate with {dashboardStats.topWastedItems[0].count} expired items, costing ${dashboardStats.topWastedItems[0].cost}.
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p className="text-sm font-medium text-yellow-800">
                      Recommendation: <br />
                      Consider reducing order quantities for {dashboardStats.topWastedItems[0].name} and {dashboardStats.topWastedItems[1]?.name || "other high-waste items"}.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <p className="text-sm font-medium text-blue-800">
                      Alternative Action: <br />
                      Create "special menu items" using ingredients approaching expiry to reduce waste and increase profits.
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">No waste data available for analysis.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Usage Trends View */}
      {view === 'usage' && (
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-lg font-semibold mb-4">Usage Trends</h2>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
            <h3 className="text-md font-medium mb-2">Weekly Inventory Flow</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dashboardStats.weeklyUsageData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="used" name="Items Used" stroke="#F59E0B" strokeWidth={2} />
                  <Line type="monotone" dataKey="expired" name="Items Expired" stroke="#EF4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="restocked" name="Items Restocked" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-md font-medium mb-2">Usage Efficiency</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardStats.weeklyUsageData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="used" name="Items Used" stackId="a" fill="#F59E0B" />
                    <Bar dataKey="expired" name="Items Expired" stackId="a" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-md font-medium mb-2">Forecasting Insights</h3>
              <div className="space-y-4">
                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                  <p className="text-sm font-medium text-green-800">
                    Usage Trend: <br />
                    Your usage rate is steady with a weekly average of {
                      Math.round(dashboardStats.weeklyUsageData.reduce((sum, week) => sum + week.used, 0) / 
                      dashboardStats.weeklyUsageData.length)
                    } items.
                  </p>
                </div>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <p className="text-sm font-medium text-blue-800">
                    Restock Recommendation: <br />
                    Based on current usage patterns, consider ordering {
                      Math.round(dashboardStats.weeklyUsageData.reduce((sum, week) => sum + week.used, 0) / 
                      dashboardStats.weeklyUsageData.length * 1.1)
                    } items next week with a 10% buffer.
                  </p>
                </div>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-sm font-medium text-yellow-800">
                    Waste Reduction: <br />
                    Current waste rate: {
                      ((dashboardStats.weeklyUsageData.reduce((sum, week) => sum + week.expired, 0) / 
                      dashboardStats.weeklyUsageData.reduce((sum, week) => sum + week.used + week.expired, 0)) * 100).toFixed(1)
                    }%. Target should be under 5%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}