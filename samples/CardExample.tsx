export default function CardExample({ title, description }) {
  return (
    <div
      className="
      p-6 bg-white dark:bg-gray-900 border border-gray-200 
      rounded-xl shadow  hover:shadow-lg
      flex  flex-col gap-3   
      transition-all duration-300 ease-out
      "
      style={{ borderRadius: "14px" }}
    >
      <h2 className="text-xl   font-bold   text-gray-800 dark:text-gray-100 leading-none  ">
        {title}
      </h2>

      <p className="text-sm   text-gray-600   dark:text-gray-300 mt-2">
        {description}
      </p>

      <button
        className=" w-full py-2 px-3   bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium mt-3    "
        style={{ paddingTop: "11px" }}
      >
        Learn More
      </button>
    </div>
  );
}
