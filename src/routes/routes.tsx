import type { ReactElement } from "react";
import Form from "../components/Form/Form.jsx";
import Articles from "../components/Articles/Articles.jsx";
import { ARTICLES_DATA } from "../constants";
import CodeReviewFeedback from "../components/CodeReview/CodeReviewFeedback.jsx";
import MedicalRecords from "../components/MedicalRecords/MedicalRecords.jsx";

export type PracticeRoute = {
    /** URL segment, no leading slash. */
    path: string;
    /** Shown in the nav bar and on the home index. */
    label: string;
    /** Rendered when the route matches. Pass whatever props it needs here. */
    element: ReactElement;
};

/**
 * Single source of truth for practice components.
 *
 * Adding an entry here wires up the route, the nav link, and the home
 * index all at once — nothing else needs to change.
 */
export const practiceRoutes: PracticeRoute[] = [
    { path: "form", label: "Form", element: <Form /> },
    {
        path: "articles",
        label: "Articles",
        element: <Articles articles={ARTICLES_DATA} />,
    },
    { path: "codereview", label: "Code Review", element: <CodeReviewFeedback /> },
    { path: "medicalrecords", label: "Medical Records", element: <MedicalRecords /> },
];
