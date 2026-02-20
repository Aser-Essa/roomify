import { Box } from "lucide-react";
import React from "react";
import { Button } from "./ui/Button";
import { useOutletContext } from "react-router";

export default function Navbar() {
  const { isSignedIn, userName, signIn, signOut } = useOutletContext<any>();
  async function handleAuthClick() {
    if (isSignedIn) {
      try {
        await signOut();
      } catch (error) {
        console.error(`Puter Sign out error: ${error}`);
      }
      return;
    }
    try {
      await signIn();
    } catch (error) {
      console.error(`Puter Sign in error: ${error}`);
    }
  }

  return (
    <header className=" navbar">
      <nav className=" inner">
        <div className=" left">
          <div className=" brand">
            <Box className="logo" />
            <span className=" name">Roomify</span>
          </div>
          <ul className=" links">
            <li>
              <a href="#">Home</a>
            </li>
            <li>
              <a href="#">Pricing</a>
            </li>
            <li>
              <a href="#">Community</a>
            </li>
            <li>
              <a href="#">Enterprise</a>
            </li>
          </ul>
        </div>
        <div className=" actions">
          {isSignedIn ? (
            <>
              <span className=" greeting ">
                {userName ? `Hi, ${userName}` : "Signed in"}
              </span>
              <Button onClick={handleAuthClick} size="sm">
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleAuthClick} size="sm" variant="ghost">
                Log in
              </Button>
              <a href="#upload" className=" cta ">
                Get Started
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
