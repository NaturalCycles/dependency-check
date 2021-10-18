# Dependency Checker

Analyze your NPM and JAVA dependencies that your project depends on.
Quickly view a list of open issues and aggregated data for each open-source package.

Check [this link](https://depchecker.com/blog/analyze-project-deps/) for more information on how packages are analyzed.
 

## Installation

You can either install it globally 
```bash
npm install -g @naturalcycles/dependency-check
```

or as one of your dev dependencies.

```bash
npm install --save-dev @naturalcycles/dependency-check
```

## Running the checker

As dependency checker queries multiple Github sources, set your own github token while/before running it.

```bash
GITHUB_TOKEN=<my-github-token> nc-depcheck
```


## Development

Clone this repo to your workspace

```bash
git clone https://github.com/NaturalCycles/dependency-check.git
```

install dependencies

```bash
npm install
```

link this package to be able to use it globally.

```bash
npm link
```

And finally build it in watch mode

```bash
npm run watch
```

## Locally serve static site

After generating the site, you can use http-server to check the generated page

```bash
npm install http-server -g
```

```bash
cd nc-depcheckPublic && http-server
```


## Running for NCBackend

```bash
GITHUB_TOKEN=<some-GH-token> nc-depcheck --pdfName "1159-SOUP Anomalies List" --only lombok joda-time jackson guava
```
