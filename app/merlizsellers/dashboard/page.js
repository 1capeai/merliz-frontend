"use client";

// Card Component for Seller Motivation and Instructions
const SellerMotivationCard = () => {
  return (
    <div className="p-6 bg-black text-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Welcome, Seller!</h2>
      <p className="mb-4 text-sm sm:text-base">
        At Merliz, we are committed to empowering sellers like you to grow and succeed in our marketplace. Your efforts contribute significantly to the success of our platform.
      </p>
      <h3 className="text-lg font-semibold mb-2">Why Choose Merliz?</h3>
      <p className="text-sm sm:text-base">
        Merliz is more than just a marketplace; it's a community that fosters growth and innovation. Our platform offers competitive pricing, secure transactions, and unparalleled customer support to ensure your business thrives.
      </p>
      <p className="mt-4 font-semibold text-sm sm:text-base">
        We encourage you to stay motivated and take full advantage of the opportunities available on Merliz!
      </p>
    </div>
  );
};

// Step Cards Component (Display Steps Nicely in Rows with Icons)
const StepCards = () => {
  const steps = [
    {
      id: 1,
      title: "Select Product",
      description: "Choose the product you want to order.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="h-6 w-6 text-[#d4af37]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0h2v2H7v-2z"
          />
        </svg>
      ),
    },
    {
      id: 2,
      title: "Add Quantity",
      description: "Specify the quantity for your order.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="h-6 w-6 text-[#d4af37]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      ),
    },
    {
      id: 3,
      title: "Upload Slip",
      description: "Attach the payment slip if necessary.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="h-6 w-6 text-[#d4af37]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
      ),
    },
    {
      id: 4,
      title: "Submit Order",
      description: "Click the submit button to finalize.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="h-6 w-6 text-[#d4af37]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
    },
    {
      id: 5,
      title: "Check Submission",
      description: "Verify your order in the table below.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="h-6 w-6 text-[#d4af37]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: 6,
      title: "Review Details",
      description: "Ensure all information is accurate.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="h-6 w-6 text-[#d4af37]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {steps.map((step) => (
        <div key={step.id} className="bg-white p-6 rounded-lg shadow-md flex items-center border border-black">
          <span>{step.icon}</span>
          <div className="ml-4">
            <h4 className="text-lg font-semibold text-black">{step.title}</h4>
            <p className="text-gray-700 text-sm sm:text-base">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function MerlizSellersDashboardPage() {
  return (
    <div className="p-4 sm:p-8 bg-[#ffffff] min-h-screen">
      {/* Seller Motivation Card */}
      <SellerMotivationCard />

      {/* Step-by-Step Guide */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-black text-center sm:text-left">
          Follow These Steps:
        </h2>
        <StepCards />
      </div>

      {/* Orders Table: Show status of orders */}
   
    </div>
  );
}