import { useState } from "react";
import "./Form.css";

function Form() {


  const handleSubmit = (e) => {

  };

  return (
    <>
      <div className="Form">
        <form>
            <input type="text" name="name" />
            <input type="email" name="email" />
            <input type="date" name="dob" />
            <textarea placeholder="Message" />
        </form>
      </div>
    </>
  );
}

export default Form;
