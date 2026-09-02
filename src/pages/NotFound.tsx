import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

export default function NotFound() {
  const location = useLocation();
  console.error("404 Error: User attempted to access non-existent route:", location.pathname);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-[#C9A96E] text-xs tracking-[0.3em] uppercase font-semibold mb-4">404</p>
        <h1 className="font-display text-7xl md:text-9xl text-[#0a0a0a] mb-4">NOT FOUND</h1>
        <p className="text-gray-500 text-sm mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary inline-block">RETURN HOME</Link>
      </div>
    </div>
  );
}
