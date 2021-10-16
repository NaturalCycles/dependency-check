import React from "react";
import ReactMarkdown from "react-markdown";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardHeader from "@material-ui/core/CardHeader";
import Avatar from "@material-ui/core/Avatar";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      marginTop: "40px",
      breakInside: "avoid",
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

interface IssueInterface {
  issue: any;
}
export const Issue = ({ issue }: IssueInterface) => {
  const classes = useStyles();

  return (
    <Card className={classes.root} id={issue.id}>
      <CardHeader
        avatar={<Avatar aria-label="recipe" src={issue.user?.avatar_url} />}
        title={issue.user?.login}
        subheader={issue.created_at}
      />
      <CardContent>
        <Typography
          className={classes.title}
          color="textSecondary"
          gutterBottom
        ></Typography>
        <Typography variant="h5" component="h2">
          <ReactMarkdown>{issue.title}</ReactMarkdown>
        </Typography>

        <Typography variant="body2" component="p">
          <ReactMarkdown>{issue.body}</ReactMarkdown>
        </Typography>
      </CardContent>
    </Card>
  );
};
