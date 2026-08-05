import "./Records.css";

function Records({ records, onNext }) {
    if (!records) return null;

    const patient = records.data[0];

    const tableRows = records.data.map((r, i) => (
        <tr key={r.id}>
            <td>{i + 1}</td>
            <td>
                {new Date(r.timestamp).toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                })}
            </td>
            <td>{r.diagnosis.name}</td>
            <td>{r.meta.weight}</td>
            <td>{r.doctor.name}</td>
        </tr>
    ));

    return (
        <div className="recordsTable">
            <div className="patientInfo">
                <div className="patientDetails">
                    <h4 id="patient-name">{patient.userName}</h4>
                    <h5 id="patient-dob">DOB: {patient.userDob}</h5>
                    <h5 id="patient-height">Height: {patient.meta.height} cm</h5>
                </div>
                <button onClick={onNext}>Next</button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>SL</th>
                        <th>Date</th>
                        <th>Diagnosis</th>
                        <th>Weight</th>
                        <th>Doctor</th>
                    </tr>
                </thead>
                <tbody>{tableRows}</tbody>
            </table>
        </div>
    );
}

export default Records;
