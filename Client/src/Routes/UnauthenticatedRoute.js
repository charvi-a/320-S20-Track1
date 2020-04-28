import React from "react";
import { Route, Redirect } from "react-router-dom";

export default function UnauthenticatedRoute({
  component: C,
  appProps,
  ...rest
}) {
  return (
    <Route
      {...rest}
      render={props =>
        sessionStorage.getItem("role") === null ? (
          <C {...props} {...appProps} />
        ) : (
          <Redirect to="/" />
        )
      }
    />
  );
}