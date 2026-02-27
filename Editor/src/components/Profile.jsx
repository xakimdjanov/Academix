import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Token bo‘lmasa → login sahifa
    if (!token) {
      navigate("/login");
      return;
    }

    // LocalStorage-dan userni olish
    const savedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("admin"));

    if (!savedUser) {
      navigate("/login");
      return;
    }

    setUser(savedUser);
  }, [navigate]);

  if (!user) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6">

        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          User Profile
        </h2>

        <div className="space-y-3">
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium text-gray-700">Full Name:</span>
            <span>{user.fullname || user.name || "No data"}</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="font-medium text-gray-700">Email:</span>
            <span>{user.email}</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="font-medium text-gray-700">Role:</span>
            <span>{user.role || "Editor"}</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="font-medium text-gray-700">Editor ID:</span>
            <span>{localStorage.getItem("editorId")}</span>
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl shadow hover:bg-blue-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Profile;