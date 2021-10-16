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
