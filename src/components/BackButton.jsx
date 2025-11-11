import React from "react";
import { useNavigation } from "../contexts/NavigationContext";

const BackButton = () => {
  const { goBack, getLastVisitedPage } = useNavigation();
  const lastPage = getLastVisitedPage();

  // Eğer geçmiş yoksa butonu gösterme
  if (!lastPage) {
    return null;
  }

  return (
    <button
      data-registry="H5"
      id="back-button"
      onClick={goBack}
      className="fixed top-28 left-4 z-50 bg-gray-800/80 hover:bg-gray-700/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 backdrop-blur-sm border border-gray-600/50 shadow-lg"
      title={`${lastPage.title} sayfasına geri dön`}
    >
      <svg
        data-registry="H5.1"
        id="back-button-icon"
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
      <span
        data-registry="H5.2"
        id="back-button-text"
        className="text-sm font-medium"
      >
        {lastPage.icon} {lastPage.title}
      </span>
    </button>
  );
};

export default BackButton;
