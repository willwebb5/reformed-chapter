// App.js
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./Header";
import AppRoutes from "./Routes";
import Footer from "./Footer";
import LoadingScreen from './LoadingScreen';
import { typeLabels, bibleBooks, exampleAuthors, resourceTypes } from './Constants';
import Intro from "./Intro";

function App() {
  return (
    <Router>
      <Header />
      <div style={{ paddingTop: "1rem" }}>
        <AppRoutes />
      </div>
      <Footer />
    </Router>
  );
}

export default App;
