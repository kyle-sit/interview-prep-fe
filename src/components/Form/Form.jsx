import { useReducer } from "react";
import "./Form.css";

const EMPTY = {
    name: "",
    email: "",
    dob: "",
    message: "",
};

const initialState = {
    values: EMPTY,
    submittedData: null,
    error: "",
};

const reducer = (state, action) => {
    switch (action.type) {
        case "SET_FIELD":
            return {
                ...state,
                values: { ...state.values, [action.name]: action.payload },
            };
        case "SUBMIT": {
            for (const v of Object.values(state.values)) {
                if (v.trim() === "") {
                    return { ...state, error: "All fields are required." };
                }
            }

            return { values: EMPTY, submittedData: state.values, error: "" };
        }
        default:
            return state;
    }
};

function Form() {
    const [state, dispatch] = useReducer(reducer, initialState);

    const handleFieldChange = (e) => {
        dispatch({ type: "SET_FIELD", name: e.target.name, payload: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch({ type: "SUBMIT" });
    };

    return (
        <>
            <div className="Form">
                <h1>Contact Form</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name">Name </label>
                        <input
                            type="text"
                            name="name"
                            value={state.values.name}
                            onChange={handleFieldChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="email">Email </label>
                        <input
                            type="email"
                            name="email"
                            value={state.values.email}
                            onChange={handleFieldChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="dob">Date of Birth </label>
                        <input
                            type="date"
                            name="dob"
                            value={state.values.dob}
                            onChange={handleFieldChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="message">Message </label>
                        <textarea
                            placeholder="Message"
                            name="message"
                            value={state.values.message}
                            onChange={handleFieldChange}
                        />
                    </div>
                    <button type="submit">Submit</button>
                    {state.error && <p className="formError">{state.error}</p>}
                    {state.submittedData && (
                        <div>
                            <h2>Submitted Information</h2>
                            {Object.entries(state.submittedData).map(([field, value]) => (
                                <p key={field}>
                                    <strong>{field}</strong> {value}
                                </p>
                            ))}
                        </div>
                    )}
                </form>
            </div>
        </>
    );
}

export default Form;
