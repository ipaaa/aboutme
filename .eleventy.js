export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/styles.css": "styles.css" });
  eleventyConfig.addPassthroughCopy({ "src/favicon-32.png": "favicon-32.png" });
  eleventyConfig.addPassthroughCopy({ "src/favicon-180.png": "favicon-180.png" });
  eleventyConfig.addPassthroughCopy({ "src/selfportrait.png": "selfportrait.png" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    htmlTemplateEngine: "njk",
  };
}
