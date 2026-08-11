import "./BlogPost.css";

import { useState } from "react";
import BlogInput from "./BlogInput";
import BlogDisplay from "./BlogDisplay";

function BlogPost() {
    const [posts, setPosts] = useState([]);

    const createPost = (formData) => {
        /**
         * React 19 allows formData to be retrieved on action, validation is at the input level.
         * This allows the input to be uncontrolled inputs, not triggering rerender on every keystroke.
         * If we made the inputs controlled (would be necessary if we wanted validation on each
         * keystroke), we should memoize the BlogDisplay component and its props so that that component
         * does not rerender every time the user updates the inputs.
         **/
        const title = formData.get("title");
        const description = formData.get("description");
        setPosts((prev) => [...prev, { id: crypto.randomUUID(), title, description }]);
    };

    const onDelete = (post) => {
        setPosts((prev) => prev.filter((p) => p.id !== post.id));
    };

    return (
        <div className="blog-posts">
            <form className="blog-form" action={createPost}>
                <BlogInput />
                <button type="submit">Create Post</button>
            </form>
            <div>
                <BlogDisplay posts={posts} onDelete={onDelete} />
            </div>
        </div>
    );
}

export default BlogPost;
