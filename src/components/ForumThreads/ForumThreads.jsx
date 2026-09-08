import { useEffect, useState } from "react";
import "./ForumThreads.css";

async function loadThreads(setThreads) {
    const threads = [];
    const seedThreadsRes = await fetch("/api/posts?_limit=4");
    if (!seedThreadsRes.ok)
        throw new Error(
            `Error retrieving threads with http status: ${seedThreadsRes.status}`,
        );
    const seedThreads = await seedThreadsRes.json();

    for (const seedThread of seedThreads) {
        seedThread.replies = await loadReplies(seedThread.id);
        threads.push(seedThread);
    }
    setThreads(threads);
}

async function loadReplies(threadId) {
    const commentsRes = await fetch(`/api/comments?postId=${threadId}`);
    if (!commentsRes.ok)
        throw new Error(
            `Error retrieving comments for thread: ${threadId}, with http status: ${commentsRes.status}`,
        );
    const comments = await commentsRes.json();

    // Pass 1: build every node before linking anything, so arrival order can't matter.
    const byId = new Map();
    for (const comment of comments) {
        byId.set(comment.id, {
            id: comment.id,
            author: comment.name,
            body: comment.body,
            replies: [],
        });
    }

    // Pass 2: attach each node to the comment its body references, else to the root.
    const roots = [];
    for (const comment of comments) {
        const node = byId.get(comment.id);
        const parent = byId.get(parentIdFrom(comment.body));
        if (parent && parent !== node) parent.replies.push(node);
        else roots.push(node);
    }

    return roots;
}

function parentIdFrom(body) {
    const at = body.indexOf("@");
    if (at === -1) return null;

    let end = at + 1;
    while (end < body.length && body[end] >= "0" && body[end] <= "9") end++;
    if (end === at + 1) return null; // an "@" with no digits after it

    return Number(body.slice(at + 1, end));
}

function calculateReplies(thread) {
    let replies = thread.replies.length;
    for (const reply of thread.replies) {
        replies += calculateReplies(reply);
    }
    return replies;
}

function Reply({ reply, level, collapsedReplies, onToggle }) {
    const isCollapsed = collapsedReplies.has(reply.id);

    return (
        <div className="thread-replies" style={{ paddingLeft: `${level * 10}px` }}>
            <div className="thread-reply">
                <div>
                    {reply.author}: {reply.body}
                </div>
                {reply.replies.length > 0 && (
                    <button onClick={() => onToggle(reply.id)}>
                        {isCollapsed ? "⌄" : "⌃"}
                    </button>
                )}
            </div>
            <div>
                {!isCollapsed &&
                    reply.replies.map((child) => (
                        <Reply
                            key={child.id}
                            reply={child}
                            level={level + 1}
                            collapsedReplies={collapsedReplies}
                            onToggle={onToggle}
                        />
                    ))}
            </div>
        </div>
    );
}

function Thread({ thread, isExpanded, collapsedReplies, onToggleThread, onToggleReply }) {
    return (
        <div className="thread">
            <b onClick={() => onToggleThread(thread.id)}>{thread.title}</b>
            <div>Author: {thread.author}</div>
            <div>Replies: {calculateReplies(thread)}</div>
            {isExpanded &&
                thread.replies.map((reply) => (
                    <Reply
                        key={reply.id}
                        reply={reply}
                        level={1}
                        collapsedReplies={collapsedReplies}
                        onToggle={onToggleReply}
                    />
                ))}
        </div>
    );
}

function ForumThreads() {
    const [threads, setThreads] = useState([]);

    useEffect(() => {
        loadThreads(setThreads);
    }, []);

    const [expandedThreads, setExpandedThreads] = useState(() => new Set());
    const [collapsedReplies, setCollapsedReplies] = useState(() => new Set());
    const toggleThread = (threadId) => {
        setExpandedThreads((prev) => {
            const next = new Set(prev);
            if (next.has(threadId)) next.delete(threadId);
            else next.add(threadId);
            return next;
        });
    };
    const toggleReply = (replyId) => {
        setCollapsedReplies((prev) => {
            const next = new Set(prev);
            if (next.has(replyId)) next.delete(replyId);
            else next.add(replyId);
            return next;
        });
    };

    return (
        <div className="thread-list">
            {threads.map((thread) => (
                <Thread
                    key={thread.id}
                    thread={thread}
                    isExpanded={expandedThreads.has(thread.id)}
                    collapsedReplies={collapsedReplies}
                    onToggleThread={toggleThread}
                    onToggleReply={toggleReply}
                />
            ))}
        </div>
    );
}

export default ForumThreads;
