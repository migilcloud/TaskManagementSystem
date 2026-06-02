import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import "../styles/auth.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/register", formData);

      alert("Registration successful!");

      navigate("/");
    } catch (error) {
      console.log(error);
      console.log(error.response);

      alert(
        JSON.stringify(error.response?.data) ||
        "Registration failed"
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h1>Register</h1>

        <form onSubmit={handleSubmit}>

          <input
            className="auth-input"
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            className="auth-input"
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            className="auth-input"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <button
            className="auth-button"
            type="submit"
          >
            Register
          </button>

        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/">
            Login
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Register;