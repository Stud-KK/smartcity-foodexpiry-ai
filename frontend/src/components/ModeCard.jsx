import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const ModeCard = ({ type, icon, title, description, buttonText, isActive = true }) => {
  const routePath = isActive ? `/${type.toLowerCase()}` : '/login';

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full hover:shadow-lg transition duration-300">
      <div className="mb-4">
        <span className="text-3xl">{icon}</span>
        <h3 className="text-xl font-bold mt-2 text-gray-800 dark:text-white">{title}</h3>
      </div>
      <p className="text-gray-600 dark:text-gray-300 flex-grow">{description}</p>
      <Link
        to={routePath}
        className={`mt-6 py-2 px-4 rounded-lg text-center font-medium transition-colors duration-300 ${
          type === 'home' 
            ? 'bg-primary text-white hover:bg-primary-dark' 
            : 'border border-primary text-primary hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        {buttonText}
      </Link>
    </div>
  );
};

ModeCard.propTypes = {
  type: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
};

export default ModeCard;
