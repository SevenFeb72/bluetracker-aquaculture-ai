import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="overlay card-md">
      <h1>🚧 Coming Soon</h1>
      <p>This feature is under development and will be available in the future.</p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  );
}

