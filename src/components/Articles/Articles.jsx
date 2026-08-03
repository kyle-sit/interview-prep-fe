import { useState, useMemo } from "react";
import "./Articles.css";
import ArticleTable from "./ArticleTable";

function Articles({ articles }) {
    const [sortBy, setSortBy] = useState("vote");
    const sortedArticles = useMemo(() => {
        const copy = [...articles];
        if (sortBy === "vote") {
            return copy.sort((a, b) => b.upvotes - a.upvotes);
        } else if (sortBy === "recent") {
            return copy.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
        }
        return copy;
    }, [articles, sortBy]);

    return (
        <div className="articles">
            <h1>Articles</h1>
            <div className="sortBy">
                <label>Sort By</label>
                <button onClick={() => setSortBy("vote")}>Most Upvoted</button>
                <button onClick={() => setSortBy("recent")}>Most Recent</button>
            </div>
            <ArticleTable articles={sortedArticles} />
        </div>
    );
}

export default Articles;
