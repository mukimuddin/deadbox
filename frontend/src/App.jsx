import { useState, useEffect } from "react";

function App() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + "/items")
      .then((response) => response.json())
      .then((data) => setItems(data))
      .catch((error) => console.error("Error fetching items:", error));
  }, []);

  return (
    <div>
      <h1>Items</h1>
      <ul>
        {items.map((item) => (
          <li key={item._id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;