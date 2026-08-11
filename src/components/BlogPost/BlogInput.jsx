import "./BlogInput.css";

function BlogInput() {
    // set custom invalidator for blank spaces
    const requireNonBlank = (message) => (e) => {
        e.target.setCustomValidity(e.target.value.trim() === "" ? message : "");
    };

    return (
        <div className="blog-input">
            <input
                className="blog-title"
                name="title"
                type="text"
                placeholder="Enter Title"
                required
                onInput={requireNonBlank("Title can't only be spaces.")}
            />
            <textarea
                className="blog-description"
                name="description"
                placeholder="Enter Description"
                required
                onInput={requireNonBlank("Description can't only be spaces.")}
            />
        </div>
    );
}

export default BlogInput;
