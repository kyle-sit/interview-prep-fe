import "./MedicalRecords.css";
import { useMemo, useState } from "react";
import { MEDICAL_RECORDS } from "../../constants";
import Search from "./Search";
import Records from "./Records";

const title = "Patient Medical Records";
const NO_SELECTION = 0;

function MedicalRecords() {
    // Building as if this data could be fetched from data source and not constant
    const records = MEDICAL_RECORDS;

    /*
     * Two distinct pieces of state, deliberately:
     *   selectedId — the draft. What the dropdown shows, not yet committed.
     *   shownId    — the commit. What the table shows.
     */
    const [selectedId, setSelectedId] = useState(NO_SELECTION);
    const [shownId, setShownId] = useState(NO_SELECTION);

    /*
     * Memoized because this allocates a new array plus one object per record.
     * Trivial at three records, real work if the API ever returns thousands.
     */
    const patients = useMemo(
        () =>
            records.map((r) => ({
                recordId: Number(r.id),
                userId: r.data[0].userId,
                userName: r.data[0].userName,
                dob: r.data[0].userDob,
                height: r.data[0].meta.height,
            })),
        [records],
    );

    const record = records.find((r) => Number(r.id) === shownId);

    const onShow = () => {
        if (selectedId === NO_SELECTION) {
            window.alert("Please select a patient name");
            return;
        }
        setShownId(selectedId);
    };

    const onNext = () => {
        if (records.length === 0) return;

        // Navigate by position, not by ID arithmetic — this still works if the
        // IDs are ever non-contiguous or don't start at 1.
        const i = records.findIndex((r) => Number(r.id) === shownId);
        const next = Number(records[(i + 1) % records.length].id);

        setShownId(next);
        setSelectedId(next); // keep the dropdown in step with the table
    };

    return (
        <div className="medicalRecords">
            <h1>{title}</h1>
            <div>
                <Search
                    patients={patients}
                    value={selectedId}
                    onChange={setSelectedId}
                    onShow={onShow}
                />
                <Records records={record} onNext={onNext} />
            </div>
        </div>
    );
}

export default MedicalRecords;
