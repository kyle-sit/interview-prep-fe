import { useState } from "react";
import "./CodeReviewCard.css";

function CodeReviewCard({ category }) {
    const [votes, setVotes] = useState({ up: 0, down: 0 });

    return (
        <div key={category} className="reviewCategory">
            <h2>{category}</h2>
            <div className="voteButtons">
                <button
                    className="upVote"
                    onClick={() => setVotes((prev) => ({ ...prev, up: prev.up + 1 }))}
                >
                    👍 Upvote
                </button>
                <button
                    className="downVote"
                    onClick={() => setVotes((prev) => ({ ...prev, down: prev.down + 1 }))}
                >
                    👎 Downvote
                </button>
            </div>
            <p>
                Upvotes:{" "}
                <strong className="voteCount upCount" key={votes.up}>
                    {votes.up}
                </strong>
            </p>
            <p>
                Downvotes:{" "}
                <strong className="voteCount downCount" key={votes.down}>
                    {votes.down}
                </strong>
            </p>
        </div>
    );
}

export default CodeReviewCard;
