import React from "react";
import { Navigate } from "react-router-dom";

// Layout Types
import { DefaultLayout, SideCategoryLayout } from "./layouts";

// Route Views
import ComingSoon from "./views/ComingSoon";
import UnderMaintenance from "./views/UnderMaintenance";
import AboutUs from "./views/AboutUs";
import Home from "./views/Home";
import BrowseByCategory from "./views/BrowseByCategory";
import SelectedGroup from "./views/SelectedGroup";
import SelectedCategory from "./views/SelectedCategory";
import SelectedVocab from "./views/SelectedVocab";
import SelectedAlphabets from "./views/SelectedAlphabet";
import FeaturedVideos from "./views/FeaturedVideos";


const routes = [
  {
    path: "/",
    layout: DefaultLayout,
    component: () => <Navigate to="/home" />,
  },
  {
    path: "/home",
    layout: DefaultLayout,
    component: Home,
  },
  {
    path: "/comingsoon",
    layout: DefaultLayout,
    component: ComingSoon,
  },
  {
    path: "/maintenance",
    layout: DefaultLayout,
    component: UnderMaintenance,
  },
  {
    path: "/about-us",
    layout: DefaultLayout,
    component: AboutUs,
  },
  {
    path: "/groups",
    layout: DefaultLayout,
    component: BrowseByCategory,
  },
  {
    path: "/groups/new-signs",
    layout: SideCategoryLayout,
    component: SelectedCategory
  },
  {
    path: "/groups/new-signs/:vocab",
    layout: SideCategoryLayout,
    component: SelectedVocab
  },
  {
    path: "/groups/:group",
    layout: SideCategoryLayout,
    component: SelectedGroup,
  },
  {
    path: "/groups/:group/:category",
    layout: SideCategoryLayout,
    component: SelectedCategory,
  },
  {
    path: "/groups/:group/:category/:vocab",
    layout: SideCategoryLayout,
    component: SelectedVocab,
  },
  {
    path: "/alphabets",
    layout: DefaultLayout,
    component: () => <Navigate to="/alphabets/a" />,
  },
  {
    path: "/alphabets/:alphabet",
    layout: SideCategoryLayout,
    component: SelectedAlphabets,
  },
  {
    path: "/alphabets/:alphabet/:vocab",
    layout: SideCategoryLayout,
    component: SelectedVocab,
  },
  {
    path: "/featured-videos",
    layout: DefaultLayout,
    component: FeaturedVideos,
  },
  
];

export default routes;