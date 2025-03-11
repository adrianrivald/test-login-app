import React, { useState } from "react";

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

const LoginForm = ({ accessToken, refreshToken, headers }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });
      // Inspect the response headers
      const headers = [...response.headers.entries()]; // Convert headers to an array
      console.log("Response Headers:", headers);

      // Check if cookies are being set via `Set-Cookie` (not available directly in JS)
      const setCookieHeader = response.headers.get("set-cookie");
      if (setCookieHeader) {
        console.log("Set-Cookie Header:", setCookieHeader);
      } else {
        console.log(
          "Set-Cookie Header is not present in the response headers."
        );
      }

      return response; // Return response for other uses or error handling

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      alert("Login success");
      // Redirect or perform other actions upon successful login
    } catch (error) {
      setError(error.message);
      alert(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
          Login
        </h2>

        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}

        {/* Debugging: Display accessToken and refreshToken */}
        <div className="mb-4 text-sm text-gray-600">
          <p>Access Token: {accessToken || "Not available"}</p>
          <p>Refresh Token: {refreshToken || "Not available"}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block mb-2 text-sm font-bold text-gray-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-6">
            <label
              className="block mb-2 text-sm font-bold text-gray-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label
                htmlFor="rememberMe"
                className="block ml-2 text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>

            <a
              className="inline-block text-sm font-bold text-blue-500 align-baseline hover:text-blue-800"
              href="#"
            >
              Forgot Password?
            </a>
          </div>

          <div className="flex items-center justify-center">
            <button
              className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">
              Don't have an account?{" "}
            </span>
            <a
              className="inline-block text-sm font-bold text-blue-500 align-baseline hover:text-blue-800"
              href="#"
            >
              Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;

export const getServerSideProps = async (context) => {
  const { req } = context;

  // Debugging: Log headers and cookies
  console.log(req.headers, "log: headers");
  console.log(req.cookies, "log: cookies");
  console.log(req.headers.cookie, "log: req.headers.cookie");

  // Manually parse cookies from headers
  const cookies = req.headers.cookie || "";
  const accessToken =
    cookies
      .split(";")
      .find((c) => c.trim().startsWith("access_token="))
      ?.split("=")[1] || null; // Use null if undefined
  const refreshToken =
    cookies
      .split(";")
      .find((c) => c.trim().startsWith("refresh_token="))
      ?.split("=")[1] || null; // Use null if undefined

  console.log(accessToken, "log: accessToken");
  console.log(refreshToken, "log: refreshToken");

  try {
    return {
      props: {
        accessToken, // Pass the accessToken to the page (will be null if not available)
        refreshToken, // Pass the refreshToken to the page (will be null if not available)
        headers: req.headers,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);

    return {
      props: {
        error: "Failed to fetch data",
        accessToken: null, // Ensure accessToken is null
        refreshToken: null, // Ensure refreshToken is null
        headers: req.headers,
      },
    };
  }
};
