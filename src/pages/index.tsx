import * as React from "react";
import JSONData from "../../content/output.json";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { Issue } from "../components/Issue";
import { Summary } from "../components/Summary";
import { DataGrid } from "@material-ui/data-grid";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      marginTop: "40px",
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: "center",
      color: theme.palette.text.secondary,
    },
    title: {
      fontSize: 14,
    },
    pos: {
      marginBottom: 12,
    },
  })
);

// It is possible to use env variables, but they have a length restriction
// import { BASE64DEPCHECK } from "gatsby-env-variables";
// styles
const pageStyles = {
  backgroundColor: "light-grey",
  color: "#36313d",
  padding: 96,
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
};
const headingStyles = {
  marginTop: 0,
  marginBottom: 64,
  maxWidth: 320,
  color: "#A6A6A6",
};
const headingAccentStyles = {
  color: "#71235D",
};

const listStyles = {
  marginTop: 100,
  marginBottom: 50,
  paddingLeft: 0,
};

const NPM = JSONData.NPM.packages.map((p: any) => {
  p["language"] = "JS";
  return p;
});

const JAVA = JSONData.POM.packages.map((p: any) => {
  p["language"] = "JAVA";
  return p;
});

const IndexPage = () => {
  const classes = useStyles();
  const columns = React.useMemo(
    () => [
      {
        headerName: "Name",
        field: "name",
        flex: 1,
      },
      {
        headerName: "Language",
        field: "language",
        flex: 0.7,
      },
      {
        headerName: "Version",
        field: "version",
      },
      {
        headerName: "License",
        field: "npmLicenseCheck",
        flex: 1,
      },
      {
        headerName: "Open Issues",
        field: "issuesCount",
        flex: 1,
      },
      {
        headerName: "Months since update",
        field: "monthsSinceUpdated",
        flex: 1,
      },
      {
        headerName: "Contributors",
        field: "contributors",
        flex: 0.7,
      },
      {
        headerName: "Open Pull Request",
        field: "pullRequests",
        flex: 0.8,
      },
      {
        headerName: "Stars",
        field: "stars",
        flex: 0.5,
      },
      {
        headerName: "Forks",
        field: "forks",
        flex: 0.5,
      },
    ],
    []
  );

  const data = React.useMemo(() => [...NPM, ...JAVA], [JSONData.NPM.packages]);
  const importantPackages = ["lombok", "joda-time", "jackson", "guava"];

  return (
    <main style={pageStyles}>
      <title>NC - SOUP check</title>
      <h1 style={headingStyles}>
        SOUP
        <br />
        <span style={headingAccentStyles}>—analysis! </span>
        <span role="img" aria-label="Party popper emojis">
          🎉
        </span>
      </h1>
      <span style={listStyles}>
        {JSONData.POM.packages.map((pck: any, index: number) => (
          <>
            {importantPackages.some((packageName) =>
              pck.name.toLowerCase().includes(packageName)
            ) && (
              <>
                <Grid item xs={12} style={listStyles}>
                  <Typography variant="h6" component="h4">
                    {pck.name}
                  </Typography>
                  {pck.issues.map((issue: any, index: number) => (
                    <li>
                      <a href={`#${issue.id}`}>{issue.title}</a>
                    </li>
                  ))}
                </Grid>
              </>
            )}
          </>
        ))}
      </span>
      {/* 
                <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Paper className={classes.paper}>
              <Summary
                packages={JSONData.POM.packages}
                licenses={JSONData.POM.licenses}
                language={"POM"}
                date={JSONData.date}
              />
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.paper}>
              <Summary
                packages={JSONData.NPM.packages}
                licenses={JSONData.NPM.licenses}
                language={"NPM"}
                date={JSONData.date}
              />
            </Paper>
          </Grid>
        </Grid>
      </div>
      <Grid item xs={12}>
        <DataGrid
          rows={data}
          columns={columns}
          pageSize={100}
          checkboxSelection
          autoHeight
        />
      </Grid>
        
        */}

      <span style={listStyles}>
        {JSONData.NPM.packages.map((pck: any, index: number) => (
          <>
            {/*
            <Grid item xs={12} style={listStyles}>
              <Paper className={classes.paper}>
                <Typography variant="h5" component="h2">
                  {pck.name}
                </Typography>

                <Typography variant="h3" component="h1">
                  {pck.issues?.length} issues
                </Typography>
              </Paper>
            </Grid>
            
              {pck.issues?.map((issue: any, index: number) => (
                <Issue issue={issue} />
              ))} 
            */}
          </>
        ))}
      </span>

      <span style={listStyles}>
        {JSONData.POM.packages.map((pck: any, index: number) => (
          <>
            {importantPackages.some((packageName) =>
              pck.name.toLowerCase().includes(packageName)
            ) && (
              <>
                <Grid item xs={12} style={listStyles}>
                  <Paper className={classes.paper}>
                    <Typography variant="h5" component="h2">
                      {pck.name}
                    </Typography>

                    <Typography variant="h3" component="h1">
                      {pck.issues?.length} issues
                    </Typography>
                  </Paper>
                </Grid>

                {pck.issues.map((issue: any, index: number) => (
                  <Issue issue={issue} />
                ))}
              </>
            )}
          </>
        ))}
      </span>
    </main>
  );
};

export default IndexPage;
