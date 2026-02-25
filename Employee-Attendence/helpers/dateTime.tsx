export const getGreeting = (): string => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good Morning 👋';
    if (hour < 17) return 'Good Afternoon 👋';
    if (hour < 21) return 'Good Evening 👋';
    return 'Good Night 👋';
};

export const getFormattedDate = (): string => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
};