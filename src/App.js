import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import routes from "./routes";
import withTracker from "./withTracker";

import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/styles/App.scss";
import Aos from "aos";
import "aos/dist/aos.css";
import ScrollToTop from "./components/common/ScrollToTop";

function App() {
  Aos.init();
  return (
    <Router>
      <ScrollToTop>
        <Routes>
          {routes.map((route, index) => {
            const Layout = route.layout || React.Fragment;
            const Component = route.component;
            const TrackedComponent = withTracker(Component);
            return (
              <Route
                key={index}
                path={route.path}
                element={
                  <Layout>
                    <TrackedComponent />
                  </Layout>
                }
              />
            );
          })}
        </Routes>
      </ScrollToTop>
    </Router>
  );
}

export default App;