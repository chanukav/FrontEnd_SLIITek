
import React from 'react';

const TailwindTest = () => {
    return (
        <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4 mt-10 border border-gray-200">
            <div className="shrink-0">
                <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    TW
                </div>
            </div>
            <div>
                <div className="text-xl font-medium text-black">Tailwind Works!</div>
                <p className="text-slate-500">You have successfully configured Tailwind CSS v4.</p>
            </div>
        </div>
    );
};

export default TailwindTest;
