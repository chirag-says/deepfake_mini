import PropTypes from "prop-types";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn redirectUrl={location.pathname} />
      </SignedOut>
    </>
  );
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
