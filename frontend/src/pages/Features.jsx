import FeatureCard from '../components/FeatureCard';

const Features = () => {
  return (
    <div className="container mx-auto py-12 px-4 text-gray-800 dark:text-gray-200">
      <h1 className="text-4xl font-bold text-center text-primary mb-12">✨ FoodWise Features</h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <FeatureCard
          icon="🕒"
          title="Expiry Date Alerts"
          description="Automatic reminders before your food goes bad."
        />
        <FeatureCard
          icon="🤖"
          title="AI-Powered Suggestions"
          description="Meal ideas based on what's available in your kitchen."
        />
        <FeatureCard
          icon="📦"
          title="Inventory Tracking"
          description="Keep track of what's in your fridge or pantry."
        />
        <FeatureCard
          icon="📈"
          title="Analytics"
          description="See how much food you're saving and wasting."
        />
        <FeatureCard
          icon="🏠"
          title="Home & Restaurant Modes"
          description="Tailored features depending on your usage type."
        />
        <FeatureCard
          icon="⚙️"
          title="Custom Settings"
          description="Control notification times and inventory rules."
        />
      </div>
    </div>
  );
};

export default Features;
