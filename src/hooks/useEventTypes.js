// src/hooks/useEventTypes.js
const useEventTypes = () => {
  return {
    cultural_festival: {
      label: "Cultural Festival",
      icon: "🎭",
      color: "bg-purple-500",
    },
    natural_festival: {
      label: "Natural Festival",
      icon: "🌿",
      color: "bg-green-500",
    },
    adventure_festival: {
      label: "Adventure Festival",
      icon: "🧗",
      color: "bg-blue-500",
    },
    sports_festival: {
      label: "Sports Festival",
      icon: "🏅",
      color: "bg-yellow-500",
    },
  };
};

export default useEventTypes;
