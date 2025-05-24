import { useState } from 'react';
import { toast } from 'react-hot-toast';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill out all fields.');
      return;
    }

    toast.success('Thanks! Your message has been received.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center text-primary dark:text-green-400 mb-8">
        Contact Us
      </h1>

      <div className="max-w-3xl mx-auto text-center mb-10">
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
          We'd love to hear from you! Whether you have a question, feedback, or just want to say hello, feel free to reach out.
        </p>
        <p className="text-gray-800 dark:text-gray-300">
          Email: <span className="text-primary dark:text-green-400">support@foodwise.ai</span>
        </p>
        <p className="text-gray-800 dark:text-gray-300">Phone: +91 98765 43210</p>
        <p className="text-gray-800 dark:text-gray-300">Address: Pune, Maharashtra, India</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-md"
      >
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            placeholder="Your name"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            placeholder="you@example.com"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
            Message
          </label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            rows="4"
            placeholder="Your message..."
          />
        </div>

        <button
          type="submit"
          className="bg-primary dark:bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition"
        >
          Send Message
        </button>
      </form>
    </div>
  );
};

export default Contact;
