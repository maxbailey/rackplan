module.exports = {
  extends: ["next"],
  rules: {
    "react/no-unescaped-entities": "off", // Disables warnings for unescaped characters like quotes
    "@next/next/no-page-custom-font": "off", // Disables warnings about custom fonts
    "@next/next/no-img-element": "off", // Allows usage of <img> tags instead of <Image>
    "@typescript-eslint/no-unused-vars": [
      "warn", // Changes the error to a warning
      { vars: "all", args: "after-used", ignoreRestSiblings: true },
    ],
  },
};
