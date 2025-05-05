export default defineNuxtPlugin(() => {
  const siteConfig = {
    // Change this value to one of the suggested names when you decide
    siteName: "Budget Buddy",

    // Site metadata
    description: "Track and manage your monthly spending easily",
    socialImage: "/images/social-preview.jpg",

    // Social media links
    social: {
      twitter: "https://twitter.com/yourusername",
      github: "https://github.com/yourusername/spending-log",
    },
  };

  return {
    provide: {
      siteConfig,
    },
  };
});
