import React from "react";
import { Button } from "../ui/button";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";

function Header() {
  return (
    <div className="p-3 shadow-sm flex justify-between items-center px-5">
      <img src="/logo.svg" alt="logo" />

      <div className="flex gap-3 items-center">
        {/* Agar user logged OUT hai */}
        <SignedOut>
          <SignInButton mode="modal">
            <Button>Sign In</Button>
          </SignInButton>
        </SignedOut>

        {/* Agar user logged IN hai */}
        <SignedIn>
          <Button variant="outline">My Trips</Button>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </div>
  );
}

export default Header;
