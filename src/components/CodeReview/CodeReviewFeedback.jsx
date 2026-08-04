import "./CodeReviewFeedback.css";
import { CODE_REVIEW_CATEGORIES } from "../../constants";
import { useState } from "react";
import CodeReviewCard from "./CodeReviewCard";

function CodeReviewFeedback() {
    const categories = CODE_REVIEW_CATEGORIES.map((category) => (
        <CodeReviewCard category={category} />
    ));

    return <div className="codeReview">{categories}</div>;
}

export default CodeReviewFeedback;
