/** React page with Tailwind styling for creating a new letter:

Fields: title, message, video link, scheduled date

Button: Save */

import React, { useState } from "react";

function CreateLetter() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");

  const handleSave = async () => {
    // Save letter logic here
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Create New Letter</h1>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />
      <textarea
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />
      <input
        type="text"
        placeholder="Video Link (optional)"
        value={videoLink}
        onChange={(e) => setVideoLink(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />
      <input
        type="date"
        value={scheduledDate}
        onChange={(e) => setScheduledDate(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />
      <button
        onClick={handleSave}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Save
      </button>
    </div>
  );
}

export default CreateLetter;