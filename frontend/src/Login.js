import React from "react";
import { Link } from "react-router-dom";


const Login = () => {
  return (
    <div>
      <h1>Login Page</h1>
      <form>
        <input type="text" placeholder="Username" />
        <br></br>
        <input type="password" placeholder="Password" />
        <br></br>
        <button type="submit">Login</button>
      </form>
      <Link to="/createprofile">Don't have an account?</Link>
    </div>
  );
};

export default Login;
