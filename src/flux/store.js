import { EventEmitter } from "events";

import Dispatcher from "./dispatcher";
import Constants from "./constants";
import getMainNavItems from "../data/main-nav-items";
import getAlphabets from "../data/alphabets/alphabets-arrays";

const parseBlobUrl = (urlStr) => {
  if (!urlStr) return "";
  if (urlStr.startsWith("vercel_blob_rw_")) {
    const parts = urlStr.split("_");
    if (parts.length >= 4) {
      return `https://${parts[3]}.public.blob.vercel-storage.com`;
    }
  }
  // Trim trailing slash if present
  return urlStr.endsWith("/") ? urlStr.slice(0, -1) : urlStr;
};

let _store = {
  menuVisible: false,
  mainNavItems: getMainNavItems(),
  signListVisible: false,
  openDropdown: false,
  alphabets: getAlphabets(),
  languages: ["en","ms"],
  countryCode: ["gb","my"],
  featuredVideosPlaylistId: "PLEztM-ga58Y4s6t5pac5uJKLeSSuspioQ",
  youtubeAPIKey: "AIzaSyBIk86nsIH0h4HSEgHPLI8bku6WKQlizDk",
  featuredVideos: [],
  imageURL: parseBlobUrl(process.env.REACT_APP_BLOB_BASE_URL),
};

class Store extends EventEmitter {
  constructor() {
    super();

    this.registerToActions = this.registerToActions.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.storeExcel = this.storeExcel.bind(this);
    this.storeExcelGroup = this.storeExcelGroup.bind(this);
    this.storeFeaturedVideos = this.storeFeaturedVideos.bind(this);

    Dispatcher.register(this.registerToActions.bind(this));
  }

  registerToActions({ actionType, payload }) {
    switch (actionType) {
      case Constants.TOGGLE_SIDEBAR:
        this.toggleSidebar();
        break;

      case Constants.TOGGLE_DROPDOWN:
        this.toggleDropdown();
        break;

      case Constants.STORE_EXCEL:     // store all the entries from BIM sheet
        this.storeExcel(payload);
        break;

      case Constants.STORE_EXCEL_GROUP: // store all the entries from Group sheet
        this.storeExcelGroup(payload);
        break;

      case Constants.STORE_FEATURED_VIDEOS: // store all the entries from Group sheet
        this.storeFeaturedVideos(payload);
        break;        

      default:
    }
  }

  toggleSidebar() {
    _store.menuVisible = !_store.menuVisible;
    this.emit(Constants.CHANGE);
  }

  toggleDropdown() {
    _store.openDropdown = !_store.openDropdown;
    this.emit(Constants.CHANGE);
  }

  // Add this method to debug the store state
  logStoreState() {
    console.log("Store state:", {
      vocabsItems: _store.vocabsItems.length,
      groupCategoryItems: _store.groupCategoryItems.length,
      groupItems: _store.groupItems.length,
      categoryItems: _store.categoryItems.length
    });
  }

  // store all entries from BIM sheet
  storeExcel(value) {
    console.log("Storing vocab items:", value.length);
    _store.vocabsItems = value;
    this.emit(Constants.CHANGE);
  }

  // store all entries from Group sheet
  storeExcelGroup(value) {
    console.log("Storing group category items:", value.length);
    _store.groupCategoryItems = value;              // get all entries from Group sheet
    this.emit(Constants.CHANGE);
    _store.groupItems = this.getGroupItems();       // get groups (unique)
    _store.categoryItems = this.getCategoryItems(); // get groups and categories pair (unique)
    
    // Log the processed data for debugging
    console.log("Processed group items:", _store.groupItems.length);
    console.log("Processed category items:", _store.categoryItems.length);
  }

  storeFeaturedVideos(value) {
    _store.featuredVideos = value;
    this.emit(Constants.CHANGE);
  }

  getMenuState() {
    return _store.menuVisible;
  }

  getMainNavItems() {
    return _store.mainNavItems;
  }  

  getOpenDropdown() {
    return _store.openDropdown;
  }

  getAlphabetsList() {
    return _store.alphabets;
  }

  getLanguages() {
    return _store.languages;
  }

  getCountryCode() {
    return _store.countryCode;
  }

  getFeaturedVideosList() {
    return _store.featuredVideos;
  }

  getFeaturedVideosPlaylistUrl() {
    return "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId="
    + _store.featuredVideosPlaylistId
    + "&key="
    + _store.youtubeAPIKey;
  }

  getFeaturedVideoUrl(videoId) {
    return "https://youtu.be/" + videoId;
  }

  // get image for Category (from vercel blob)
  // Filenames in blob were uploaded as-is (e.g. "Category_Aktiviti & Peristiwa.jpg")
  // We use encodeURIComponent so the URL is valid while matching the actual blob filename.
  getCategoryImgSrc(kumpulanKategori) {
    const kategoriPublicId = "Category_" + kumpulanKategori;
    return `${_store.imageURL}/category/${encodeURIComponent(kategoriPublicId)}.jpg`;
  }

  getFallbackImage() {
    return `${_store.imageURL}/image-coming-soon.jpg`;
  }

  // get image for vocab (from vercel blob)
  // Filenames in blob were uploaded as-is (e.g. "Pengembara (Beg galas).jpg")
  // We use encodeURIComponent so the URL is valid while matching the actual blob filename.
  getSignImgSrc(perkataan) {
    const perkataanPublicId = perkataan.trim();
    return `${_store.imageURL}/vocab/${encodeURIComponent(perkataanPublicId)}.jpg`;
  }

  // format string to lower case, replace space with dash, and remove '?' and '/' (for link path name)
  formatString(string) {
    if (!string) return '';
    
    try {
      var stringFormatted = string.toLowerCase().replace(/\s+/g, "-")
      stringFormatted = stringFormatted.replace(/[?/]/g, "")
      return stringFormatted
    } catch (err) {
      return string;
    }
  }

  // format group&category pair (to follow link path name)
  formatGroupCategory(string) {
    if (!string) return '';
    
    try {
      // return string.toLowerCase().replace(/\s+/g, "-");
      const groupCat = string.toString().split("/");
      return this.formatString(groupCat[0]) + "/" + this.formatString(groupCat[1]);
    } catch (err) {
      return string;
    }
  }

  getBaseURLBIMSheet() {
    const baseURL = window.location.origin;
    const filePathname = _store.filePathBIMSheet;
    return baseURL + filePathname;
  }

  addChangeListener(callback) {
    this.on(Constants.CHANGE, callback);
  }

  removeChangeListener(callback) {
    this.removeListener(Constants.CHANGE, callback);
  }
}
export default new Store();
