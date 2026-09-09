import "./DwellTracker.css";

import { useState, useEffect, useRef } from "react";

const timeFormatter = new Intl.DateTimeFormat("en-US", {
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 1, // Forces exactly 1 decimal point (.d)
    timeZone: "UTC", // Ensures zero alignment
});

function formatTime(ms) {
    return timeFormatter.format(ms);
}

async function fetchDwellings(setDwellings, setTotals) {
    const dwellRes = await fetch("/api/dwell");
    if (!dwellRes.ok) throw new Error(`Http error with status: ${dwellRes.status}`);

    const dwellings = await dwellRes.json();
    setDwellings(dwellings);
    for (const d of dwellings) {
        setTotals((prev) => {
            const newMap = new Map(prev);
            newMap.set(d.id, d.ms);
            return newMap;
        });
    }
}

async function writeDwelling(cardId, ms) {
    const response = await fetch(`/api/dwell/${cardId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ms: ms,
        }),
    });

    if (!response.ok) throw new Error(`Http error with status: ${response.status}`);
}

function DwellCard({ card, elapsed, isTracking, onEnter, onLeave, onReset }) {
    return (
        <div className="dwell-card">
            <b>{card.label}</b>
            <div className="status">Status: {isTracking ? "tracking" : "idle"}</div>
            <div className="timer" onMouseEnter={onEnter} onMouseLeave={onLeave}>
                {formatTime(elapsed)}
            </div>
            <button className="reset" onClick={onReset}>
                Reset
            </button>
        </div>
    );
}

function DwellTracker() {
    const [cards, setCards] = useState([]);
    const [totals, setTotals] = useState(() => new Map());
    const [activeId, setActiveId] = useState(null);
    const [startedAt, setStartedAt] = useState(null);
    const [now, setNow] = useState(() => Date.now());
    const [isPaused, setIsPaused] = useState(false);

    const isRunning = activeId !== null;
    const liveMs = isRunning ? now - startedAt : 0;
    const elapsedFor = (id) => (totals.get(id) ?? 0) + (id === activeId ? liveMs : 0);
    const total = cards.reduce((sum, card) => sum + elapsedFor(card.id), 0);

    useEffect(() => {
        fetchDwellings(setCards, setTotals);
    }, []);

    useEffect(() => {
        const pause = () => {
            if (!isPaused) {
                setIsPaused(true);
                stop();
            }
        };
        const resume = () => {
            if (isPaused) {
                setIsPaused(false);
                start();
            }
        };
        const onVisibility = () => (document.hidden ? pause() : resume());

        document.addEventListener("visibilitychange", onVisibility);
        window.addEventListener("blur", pause);
        window.addEventListener("focus", resume);
        return () => {
            document.removeEventListener("visibilitychange", onVisibility);
            window.removeEventListener("blur", pause);
            window.removeEventListener("focus", resume);
        };
    }, [isPaused, activeId, startedAt, totals]);

    useEffect(() => {
        if (!isRunning) return;
        const id = setInterval(() => setNow(Date.now()), 100);
        return () => clearInterval(id);
    }, [isRunning]);

    /**
     * One promise chain per card. A write is only issued once the previous write to
     * the same card has settled, so a slow request can't land after a newer one and
     * leave the server holding a stale total. The catch keeps a failed write from
     * poisoning the tail — without it, every later write for that card is skipped.
     */
    const writeChains = useRef(new Map());

    const queueWrite = (cardId, ms) => {
        const prev = writeChains.current.get(cardId) ?? Promise.resolve();
        const next = prev.catch(() => {}).then(() => writeDwelling(cardId, ms));
        writeChains.current.set(cardId, next);
        return next;
    };

    const bankActive = () => {
        if (!isRunning) return;
        const banked = Date.now() - startedAt;
        const newMs = (totals.get(activeId) ?? 0) + banked;
        setTotals((prev) => new Map(prev).set(activeId, newMs));
        queueWrite(activeId, newMs);
    };

    /** Both clocks can't run at once: starting one banks whatever came before. */
    const start = (id) => {
        if (id === activeId) return;
        bankActive();
        const at = Date.now();
        setActiveId(id);
        setStartedAt(at);
        setNow(at);
    };

    const stop = () => {
        if (!isRunning) return;
        bankActive();
        setActiveId(null);
        setStartedAt(null);
    };

    const resetCard = (id) => {
        setTotals((prev) => new Map(prev).set(id, 0));
        queueWrite(id, 0);
        if (id === activeId) {
            const at = Date.now();
            setStartedAt(at);
            setNow(at);
        }
    };

    const resetAll = () => {
        setTotals((prev) => {
            const newMap = new Map(prev);
            for (const key of newMap.keys()) {
                newMap.set(key, 0);
            }
            return newMap;
        });

        for (const card of cards) {
            queueWrite(card.id, 0);
        }
    };

    return (
        <div className="dwell-tracker">
            <div className="dwell-cards">
                {cards.map((card) => (
                    <DwellCard
                        key={card.id}
                        card={card}
                        elapsed={elapsedFor(card.id)}
                        isTracking={card.id === activeId}
                        onEnter={() => start(card.id)}
                        onLeave={stop}
                        onReset={() => resetCard(card.id)}
                    />
                ))}
            </div>
            <div className="dwell-total">
                <div>Total Elapsed: {formatTime(total)}</div>
                <button onClick={resetAll}>Reset All</button>
            </div>
        </div>
    );
}

export default DwellTracker;
