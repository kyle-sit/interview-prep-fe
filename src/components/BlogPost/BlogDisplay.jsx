import "./BlogDisplay.css";

function BlogDisplay({ posts, onDelete }) {
    return (
        <div className="blog-display">
            {posts.map((post) => (
                <div className="blog-post" key={post.id}>
                    <h3>{post.title}</h3>
                    <p>{post.description}</p>
                    <button onClick={() => onDelete(post)}>Delete</button>
                </div>
            ))}
        </div>
    );
}

export default BlogDisplay;
