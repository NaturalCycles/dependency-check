module.exports = {
  siteMetadata: {
    title: "NC Dependency Check",
  },
  plugins: [
    "gatsby-plugin-sass",
    "gatsby-env-variables",
    "gatsby-plugin-output",
    {
      resolve: "gatsby-plugin-react-svg",
      options: {
        rule: {
          include: /assets/,
        },
      },
    },
  ],
};
