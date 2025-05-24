const Footer = () => {
    return (
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-3">FoodWise</h2>
            <p className="text-sm text-gray-300">
              AI-powered food expiry tracker to reduce waste and inspire smart consumption.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Quick Links</h3>
            <ul className="space-y-1 text-sm">
              <li><a href="/" className="hover:text-primary">Home</a></li>
              <li><a href="/about" className="hover:text-primary">About</a></li>
              <li><a href="/features" className="hover:text-primary">Features</a></li>
              <li><a href="/contact" className="hover:text-primary">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Get Involved</h3>
            <ul className="space-y-1 text-sm">
              <li><a href="/signup" className="hover:text-primary">Sign Up</a></li>
              <li><a href="/login" className="hover:text-primary">Login</a></li>
              <li><a href="/dashboard/home" className="hover:text-primary">Dashboard</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Follow Us</h3>
            <div className="flex space-x-4 text-xl">
              <a href="#" className="hover:text-primary">🌐</a>
              <a href="#" className="hover:text-primary">📘</a>
              <a href="#" className="hover:text-primary">📸</a>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-8">© 2025 FoodWise. All rights reserved.</p>
      </footer>
    );
  };
  
  export default Footer;
  