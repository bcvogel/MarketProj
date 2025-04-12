import React from "react";

const CreateUser = () => {
  return (
    <div>
      <h1>Login Page</h1>
      <form>
        <input type="text" placeholder="email" />
        <br></br>
        <input type="text" placeholder="Username" />
        <br></br>
        <input type="password" placeholder="Password" />
        <br></br>
        <input type="password" placeholder="Confirm Password" />
        <br></br>
        <button type="submit">Create User</button>
      </form>
    </div>
  );
};

export default CreateUser;
