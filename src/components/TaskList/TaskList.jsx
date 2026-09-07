import { useEffect, useState } from "react";
import "./TaskList.css";

let taskCalls = 1;

function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [editingId, setEditingId] = useState(null);
    // "loading" | "error" | "ready"
    const [status, setStatus] = useState("loading");

    const getTasks = async () => {
        setStatus("loading");
        try {
            const res = await fetch(
                "https://jsonplaceholder.typicode.com/todos?_limit=5",
            );

            if (!res.ok || taskCalls === 1) {
                taskCalls++;
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();
            const tasks = data.map((task) => ({
                id: task.id,
                title: task.title,
                done: task.completed,
            }));
            setTasks(tasks);
            setStatus("ready");
        } catch (e) {
            setStatus("error");
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            getTasks();
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, []);

    const toggleTask = (id, done) => {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)));
    };
    const createNewTask = (e) => {
        e.preventDefault();
        const titleInput = e.target.elements["taskTitle"];
        const newTitle = titleInput.value;
        if (newTitle.trim() !== "") {
            const newTasks = [...tasks];
            newTasks.push({
                id: crypto.randomUUID(),
                title: newTitle,
                done: false,
            });
            setTasks(newTasks);
            e.target.reset();
        }
    };
    const commitTitle = (id, value) => {
        const newTitle = value.trim();
        if (newTitle !== "") {
            setTasks((prev) =>
                prev.map((t) => (t.id === id ? { ...t, title: newTitle } : t)),
            );
        }
        setEditingId(null);
    };
    const titleKeyDown = (e, task) => {
        if (e.key === "Enter") {
            e.currentTarget.blur();
        }
        if (e.key === "Escape") {
            e.currentTarget.value = task.title;
            e.currentTarget.blur();
        }
    };

    return (
        <div className="task-list">
            <form onSubmit={createNewTask}>
                <label>Add task: </label>
                <input name="taskTitle" type="text" />
                <button type="submit">Submit</button>
            </form>
            {status === "loading" && <p data-testid="loading">Tasks loading...</p>}
            {status === "error" && (
                <div data-testid="error">
                    <p style={{ color: "red" }}>There was an error retrieving tasks.</p>
                    <button data-testid="retry" onClick={() => getTasks()}>
                        Retry
                    </button>
                </div>
            )}
            {status === "ready" &&
                (tasks.length > 0 ? (
                    <ol data-testid="task-list">
                        {tasks.map((task) => (
                            <li key={task.id} data-testid={`task-item-${task.id}`}>
                                {editingId === task.id ? (
                                    <input
                                        autoFocus
                                        name="editTitle"
                                        data-testid={`task-edit-input-${task.id}`}
                                        defaultValue={task.title}
                                        onBlur={(e) =>
                                            commitTitle(task.id, e.target.value)
                                        }
                                        onKeyDown={(e) => titleKeyDown(e, task)}
                                    />
                                ) : (
                                    <label
                                        data-testid={`task-title-${task.id}`}
                                        onClick={() => setEditingId(task.id)}
                                    >
                                        {task.title}
                                    </label>
                                )}
                                <input
                                    data-testid={`task-toggle-${task.id}`}
                                    type="checkbox"
                                    value={task.title}
                                    checked={task.done}
                                    onChange={(e) =>
                                        toggleTask(task.id, e.target.checked)
                                    }
                                ></input>
                            </li>
                        ))}
                    </ol>
                ) : (
                    <p data-testid="task-list-empty">Task list is empty.</p>
                ))}
        </div>
    );
}

export default TaskList;
