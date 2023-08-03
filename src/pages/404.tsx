import type { NextPage } from "next";

const Custom404: NextPage = (props) => {
  return (
    <>
        <div>
      <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="relative isolate overflow-hidden border border-1 border-black dark:border-white px-6 py-24 text-center sm:rounded-3xl sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-black dark:text-white sm:text-4xl">
            404 - Page Not Found
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-500 dark:text-gray-300">
            The page you're looking for does not exist.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/"
              className="rounded-md bg-black dark:bg-white px-3.5 py-2.5 text-sm font-semibold text-white dark:text-gray-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Return Home
            </a>
      
          </div>
       
        </div>
      </div>
    </div>
    </>
  );
};

export default Custom404;