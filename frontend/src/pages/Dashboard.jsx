/** React page with Tailwind styling that lets users:

View existing letters

Create a new letter (title, message, scheduled date or trigger rule)

Option to attach a YouTube/video link */

import React, { useState } from "react";

function Dashboard() {
  const [letters, setLetters] = useState([]);

  // Fetch letters from backend (placeholder function)
  const fetchLetters = async () => {
    // Fetch logic here
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <button onClick={fetchLetters} className="bg-blue-500 text-white px-4 py-2 rounded">
        Fetch Letters
      </button>
      <ul>
        {letters.map((letter) => (
          <li key={letter.id}>{letter.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;