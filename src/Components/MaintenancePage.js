import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTools } from '@fortawesome/free-solid-svg-icons';

const MaintenancePage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-500">
                    <FontAwesomeIcon icon={faTools} size="2x" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Site Temporarily Unavailable</h1>
                <p className="text-gray-600 mb-6">
                    This domain is currently inactive or undergoing maintenance. Please check back later.
                </p>
                <div className="text-xs text-gray-400">
                    Error Code: DOMAIN_DISABLED
                </div>
            </div>
        </div>
    );
};

export default MaintenancePage;
