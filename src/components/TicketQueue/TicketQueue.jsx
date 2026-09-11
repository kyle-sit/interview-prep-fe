import "./TicketQueue.css";
import { useEffect, useState, useRef } from "react";

function formatAge(minutes) {
    const hours = Math.floor(minutes / 60);
    const min = minutes % 60;
    if (hours === 0) return `${min}m`;
    return `${hours}h ${min}m`;
}

const TICKET_STATUSES = ["Open", "Pending", "Closed"];
const FILTER_OPTIONS = ["All", ...TICKET_STATUSES];

async function getTickets(setTickets, setStatus, setLastFetch) {
    try {
        const res = await fetch("/api/tickets");
        if (!res.ok) throw new Error(`Error fetching tickets with status: ${res.status}`);
        const tickets = await res.json();
        setTickets(tickets);
        setLastFetch(new Date().toLocaleTimeString("en-US"));
        setStatus("ready");
    } catch (error) {
        console.log(error.message);
        setStatus("error");
    }
}

async function updateTickets(ids, status) {
    try {
        const res = await fetch("/api/tickets/status", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ids: ids,
                status: status,
            }),
        });
        if (!res.ok) throw new Error(`Error updating tickets with status: ${res.status}`);

        const updatedTickets = await res.json();
        return updatedTickets;
    } catch (error) {
        console.log(error.message);
    }
}

function TicketQueue() {
    const [tickets, setTickets] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [statusFilter, setStatusFilter] = useState(FILTER_OPTIONS[0]);
    const [isPolling, setIsPolling] = useState(false);
    const [lastPollTime, setLastPollTime] = useState("");
    const [status, setStatus] = useState("loading");
    const [bulkStatus, setBulkStatus] = useState(TICKET_STATUSES[0]);
    const [selectedTickets, setSelectedTickets] = useState(() => new Set());

    const searchTimeout = useRef(0);
    const searchInputChange = (e) => {
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => setSearchInput(e.target.value), 300);
    };
    const togglePolling = () => {
        setIsPolling(!isPolling);
    };

    useEffect(() => {
        getTickets(setTickets, setStatus, setLastPollTime);
    }, []);

    useEffect(() => {
        if (!isPolling) return;

        const intervalId = setInterval(() => {
            getTickets(setTickets, setStatus, setLastPollTime);
        }, 5000);

        return () => clearInterval(intervalId);
    }, [isPolling]);

    const visibleTickets = tickets
        .filter((t) => {
            const query = searchInput.trim().toLowerCase();
            const matchesQuery =
                query === "" ||
                t.title.toLowerCase().includes(query) ||
                t.requester.toLowerCase().includes(query);
            const matchesStatus =
                statusFilter === "All" ||
                t.status.toLowerCase() === statusFilter.toLowerCase();
            return matchesQuery && matchesStatus;
        })
        .sort((a, b) => b.age - a.age);

    const selectTicket = (ticketId, selected) => {
        setSelectedTickets((prev) => {
            const newSet = new Set(prev);
            if (selected) newSet.add(ticketId);
            else newSet.delete(ticketId);
            return newSet;
        });
    };
    const selectAllTickets = (selected) => {
        setSelectedTickets((prev) => {
            const newSet = new Set(prev);
            for (const vt of visibleTickets) {
                selected ? newSet.add(vt.id) : newSet.delete(vt.id);
            }
            return newSet;
        });
    };
    const allSelected = () => {
        for (const vt of visibleTickets) {
            if (!selectedTickets.has(vt.id)) return false;
        }
        return true;
    };
    const applyBulkChange = async () => {
        try {
            const updatedTickets = await updateTickets([...selectedTickets], bulkStatus);
            setTickets(updatedTickets);
            setSelectedTickets(new Set());
        } catch (e) {}
    };

    return (
        <div className="ticket-queue">
            <div className="search">
                <label>Search</label>{" "}
                <input
                    type="text"
                    onChange={searchInputChange}
                    data-testid="search-input"
                ></input>
            </div>
            <div className="search">
                <label>Status filter:</label>{" "}
                <select
                    onChange={(e) => setStatusFilter(e.target.value)}
                    data-testid="status-filter"
                >
                    {FILTER_OPTIONS.map((s) => (
                        <option key={s}>{s}</option>
                    ))}
                </select>
            </div>
            <div className="poll">
                <button data-testid="poll-toggle" onClick={togglePolling}>
                    {isPolling ? "Stop Poll" : "Poll"}
                </button>
                <div data-testid="last-updated">Last updated: {lastPollTime}</div>
            </div>
            <div className="status-change">
                <div>
                    <label>Select All</label>
                    <input
                        data-testid="select-all"
                        type="checkbox"
                        onChange={(e) => selectAllTickets(e.target.checked)}
                        checked={allSelected()}
                    ></input>
                </div>
                <div data-testid="selected-count">
                    Selected Count: {selectedTickets.size}
                </div>
                <div>
                    <div>New Status: </div>
                    <select
                        className="new-status"
                        data-testid="bulk-status"
                        value={bulkStatus}
                        onChange={(e) => setBulkStatus(e.target.value)}
                    >
                        {TICKET_STATUSES.map((s) => (
                            <option key={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <button data-testid="bulk-apply" onClick={applyBulkChange}>
                    Apply
                </button>
            </div>
            <div className="ticket-table">
                {status === "loading" ? (
                    <p data-testid="loading">...loading</p>
                ) : visibleTickets.length === 0 ? (
                    <p data-testid="ticket-list-empty">No tickets.</p>
                ) : (
                    <table className="ticket-list" data-testid="ticket-list">
                        <thead>
                            <tr>
                                <td>Title</td>
                                <td>Status</td>
                                <td>Age</td>
                                <td>Requester</td>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleTickets.map((t) => (
                                <tr key={t.id} data-testid={`ticket-${t.id}`}>
                                    <td data-testid={`ticket-title-${t.id}`}>
                                        {t.title}
                                    </td>
                                    <td data-testid={`ticket-status-${t.id}`}>
                                        {t.status}
                                    </td>
                                    <td data-testid={`ticket-age-${t.id}`}>
                                        {formatAge(t.age)}
                                    </td>
                                    <td>{t.requester}</td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            onChange={(e) =>
                                                selectTicket(t.id, e.target.checked)
                                            }
                                            checked={selectedTickets.has(t.id)}
                                        ></input>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="result-count" data-testid="result-count">
                Results: {visibleTickets.length}
            </div>
        </div>
    );
}

export default TicketQueue;
