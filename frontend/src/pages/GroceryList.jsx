import React, { useState, useEffect } from "react";
import axios from "axios";

export default function GroceryList() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [customItem, setCustomItem] = useState("");
  const [suggestedItems, setSuggestedItems] = useState([]);
  const [finalList, setFinalList] = useState([]);

  const COMMON_INGREDIENTS = ["Salt", "Sugar", "Onion", "Tomato", "Oil", "Rice", "Flour"];

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3002/api/items", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const itemNames = res.data.map(item => item.name);
        setInventoryItems(itemNames);
      } catch (err) {
        console.error("Error fetching inventory:", err);
      }
    };
    fetchInventory();
  }, []);

  // Add item to the list
  const addItem = (item) => {
    if (!selectedItems.includes(item)) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const addCustomItem = () => {
    const trimmed = customItem.trim();
    if (trimmed && !selectedItems.includes(trimmed)) {
      setSelectedItems([...selectedItems, trimmed]);
      setCustomItem("");
    }
  };

  const suggestItems = () => {
    const missing = COMMON_INGREDIENTS.filter(ingredient => !selectedItems.includes(ingredient));
    setSuggestedItems(missing);
  };

  const downloadList = () => {
    const content = selectedItems.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "weekly_grocery_list.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-6">
      <h1 className="text-2xl font-bold">🛒 Weekly Grocery List</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inventory Items */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Available from Inventory</h2>
          <div className="flex flex-wrap gap-2">
            {inventoryItems.map((item, i) => (
              <button
                key={i}
                onClick={() => addItem(item)}
                className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Entry + Suggestions */}
        <div className="bg-white p-4 rounded shadow space-y-4">
          <div>
            <h2 className="font-semibold mb-2">Add Custom Ingredient</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={customItem}
                onChange={(e) => setCustomItem(e.target.value)}
                placeholder="e.g. Ginger"
                className="border px-2 py-1 rounded w-full"
              />
              <button
                onClick={addCustomItem}
                className="bg-blue-600 text-white px-4 py-1 rounded"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <button
              onClick={suggestItems}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded"
            >
              🔍 Suggest Missing Essentials
            </button>
            {suggestedItems.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-semibold text-gray-700">You may consider adding:</p>
                <ul className="list-disc list-inside text-gray-600">
                  {suggestedItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Final Grocery List */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">🧾 Final Grocery List</h2>
        {selectedItems.length === 0 ? (
          <p className="text-gray-500">No items added yet.</p>
        ) : (
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {selectedItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
        <button
          onClick={downloadList}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
        >
          ⬇️ Download List
        </button>
      </div>
    </div>
  );
}
