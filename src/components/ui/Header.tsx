import React from "react";
import { Button } from "./Button";

const Header = ({
  setModalOpen,
}: {
  setModalOpen: (open: boolean) => void;
}) => {
  return (
    <header className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold">Image Editor</h1>
          <Button onClick={() => setModalOpen(true)}>Upload Image</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
