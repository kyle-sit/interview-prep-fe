import "./Search.css";

function Search({ patients, value, onChange, onShow }) {
    return (
        <div className="search">
            <div className="dropdown">
                <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
                    <option value="0" disabled>
                        Select Patient
                    </option>
                    {patients.map((p) => (
                        <option key={p.recordId} value={p.recordId}>
                            {p.userName}
                        </option>
                    ))}
                </select>
            </div>

            <button onClick={onShow}>Show</button>
        </div>
    );
}

export default Search;
