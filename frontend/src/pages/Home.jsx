import { Link } from 'react-router-dom';
import ModeCard from '../components/ModeCard';
import FeatureCard from '../components/FeatureCard';

const Home = () => {
  return (
    <>
      {/* Main Content */}
      <div className="container mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-primary">FoodWise</span>: AI Expiry Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Minimize food wastage and maximize resourceful consumption using AI
            and smart inventory tracking.
          </p>
        </div>

        {/* Mode Heading */}
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Choose Your Mode
        </h2>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16 bg-gray-100 dark:bg-gray-800 p-6 rounded-xl transition-colors duration-300">
          <ModeCard
            type="home"
            icon="🏠"
            title="Home Mode"
            description="Track your kitchen items, get expiry notifications, and receive AI-generated meal suggestions."
            buttonText="Enter Home Mode"
          />
          <ModeCard
            type="restaurant"
            icon="🍴"
            title="Restaurant Mode"
            description="Manage inventory, track bulk items, and minimize wastage for your restaurant."
            buttonText="Enter Restaurant Mode"
          />
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Why Choose FoodWise?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🕒"
              title="Track Expiry Dates"
              description="Never forget when food expires with smart notifications."
            />
            <FeatureCard
              icon="🧪"
              title="AI Meal Suggestions"
              description="Get creative recipe ideas based on items in your kitchen."
            />
            <FeatureCard
              icon="⚖️"
              title="Reduce Food Waste"
              description="Save money and help the environment by minimizing waste."
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
