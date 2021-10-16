import React from "react";
import { DependencyOutput } from "../helpers/types";
import Chip from "@material-ui/core/Chip";
const listItemStyles = {
  fontWeight: 300,
  fontSize: 24,
  maxWidth: 560,
  marginBottom: 30,
};

interface SummaryInterface {
  language: string;
  packages: DependencyOutput[];
  licenses: string[];
  date: string;
}
export const Summary = ({
  packages,
  licenses,
  language,
  date,
}: SummaryInterface) => {
  return (
    <>
      <span style={{ ...listItemStyles, color: "#E95800" }}>{language}</span>
      <p>Date check: {date}</p>
      <p>Dependencies: {packages.length}</p>
      <p>
        <p>Licenses: {licenses.length}</p>

        {licenses.map((license: any) => (
          <Chip key={license} label={license} variant="outlined" />
        ))}
      </p>
    </>
  );
};
