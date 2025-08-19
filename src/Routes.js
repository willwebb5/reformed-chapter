// Routes.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import About from "./About";
import Donate from "./Donate";
import SubmitResource from "./SubmitResource";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/donate" element={<Donate />} />
      <Route path="/SubmitResource" element={<SubmitResource />} />
    </Routes>
  );
}
