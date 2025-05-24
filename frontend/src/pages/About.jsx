const About = () => {
    return (
      <div className="container mx-auto py-12 px-4 text-gray-800 dark:text-gray-200">
        <h1 className="text-4xl font-bold text-center mb-6 text-primary">About FoodWise</h1>
        <p className="text-lg text-center max-w-3xl mx-auto mb-10 text-gray-700 dark:text-gray-300">
          FoodWise is a smart AI-based application focused on minimizing food waste in homes and restaurants.
          Our mission is to promote sustainable food practices through technology and awareness.
        </p>
  
        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <h2 className="text-xl font-semibold mb-2 text-primary">🌍 Our Vision</h2>
            <p className="text-gray-700 dark:text-gray-300">
              To build a world where food is used wisely and waste is minimized, leveraging the power of artificial intelligence.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <h2 className="text-xl font-semibold mb-2 text-primary">💡 Our Mission</h2>
            <p className="text-gray-700 dark:text-gray-300">
              To provide tools and insights that help individuals and restaurants manage inventory, track expiry dates,
              and optimize food usage.
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  export default About;
  