import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#FAFAF9",
          secondary: "#FFFFFF",
          surface: "#F5F5F4",
          hover: "#F0EFED",
          sidebar: "#1C1917",
          sidebarHover: "#292524",
        },
        accent: {
          DEFAULT: "#8B5CF6",
          secondary: "#EC4899",
          hover: "#7C3AED",
          dim: "rgba(139, 92, 246, 0.1)",
        },
        text: {
          primary: "#1C1917",
          secondary: "#57534E",
          muted: "#A8A29E",
          inverse: "#FAFAF9",
        },
        border: {
          DEFAULT: "#E7E5E4",
          strong: "#D6D3D1",
          accent: "rgba(139, 92, 246, 0.3)",
        },
        role: {
          executor: "#8B5CF6", // violet
          executorBg: "rgba(139, 92, 246, 0.1)",
          beneficiary: "#10B981", // emerald
          beneficiaryBg: "rgba(16, 185, 129, 0.1)",
          contact: "#6B7280", // gray
          contactBg: "rgba(107, 114, 128, 0.1)",
          // Legacy alias
          observer: "#6B7280",
          observerBg: "rgba(107, 114, 128, 0.1)",
        },
        type: {
          identity: "#8B5CF6",
          identityBg: "rgba(139, 92, 246, 0.1)",
          financial: "#10B981",
          financialBg: "rgba(16, 185, 129, 0.1)",
          credentials: "#F59E0B",
          credentialsBg: "rgba(245, 158, 11, 0.1)",
          documents: "#3B82F6",
          documentsBg: "rgba(59, 130, 246, 0.1)",
          instructions: "#EC4899",
          instructionsBg: "rgba(236, 72, 153, 0.1)",
          assets: "#F97316",
          assetsBg: "rgba(249, 115, 22, 0.1)",
        },
        category: {
          personal: "#3B82F6", // blue
          personalBg: "rgba(59, 130, 246, 0.1)",
          business: "#8B5CF6", // violet
          businessBg: "rgba(139, 92, 246, 0.1)",
        },
        source: {
          profile: "#EC4899", // pink/coral
          profileBg: "rgba(236, 72, 153, 0.1)",
          vault: "#6B7280", // gray
          vaultBg: "rgba(107, 114, 128, 0.1)",
        },
        status: {
          success: "#10B981",
          successBg: "rgba(16, 185, 129, 0.1)",
          warning: "#F59E0B",
          warningBg: "rgba(245, 158, 11, 0.1)",
          error: "#EF4444",
          errorBg: "rgba(239, 68, 68, 0.1)",
          info: "#3B82F6",
          infoBg: "rgba(59, 130, 246, 0.1)",
        },
        // Legacy aliases
        primary: {
          bg: "#FAFAF9",
        },
        secondary: {
          bg: "#FFFFFF",
        },
        warning: "#F59E0B",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        accent: "0 4px 12px rgba(139, 92, 246, 0.25)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
