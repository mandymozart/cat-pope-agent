export default {
  repositories: [
    {
      name: "Local Sample",
      repoUrl: "./markdown",
      entryPoint: "", // Root of this repo
      isLocal: true
    },
    {
      name: "Cat Pope Awakening",
      repoUrl: "https://github.com/mandymozart/cat-pope-awakening.git",
      entryPoint: "de", // Look in the /de folder
      isLocal: false
    },
    {
      name: "Memex Prime",
      repoUrl: "https://github.com/mandymozart/memexprime.git",
      entryPoint: "Projects/Pocket Preacher", // Look in the specified folder
      isLocal: false
    }
  ],
  outputPath: "public/data/combined-markdown.md"
}
