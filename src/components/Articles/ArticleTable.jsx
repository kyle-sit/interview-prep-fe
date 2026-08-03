import "./ArticleTable.css";

function ArticleTable({ articles }) {
    const articleRows = articles.map((a) => (
        <tr key={a.title}>
            <td>{a.title}</td>
            <td>{a.upvotes}</td>
            <td>{a.date}</td>
        </tr>
    ));

    return (
        <div className="articleTable">
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Upvotes</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>{articleRows}</tbody>
            </table>
        </div>
    );
}

export default ArticleTable;
