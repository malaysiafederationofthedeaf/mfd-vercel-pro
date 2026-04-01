import { EventEmitter } from "events";

import Dispatcher from "./dispatcher";
import Constants from "./constants";
import getMainNavItems from "../data/main-nav-items";
import getAlphabets from "../data/alphabets/alphabets-arrays";

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
  imageURL: process.env.REACT_APP_BLOB_BASE_URL || "",
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

  logStoreState() {
    console.log("Store state:", {
      vocabsItems: _store.vocabsItems.length,
      groupCategoryItems: _store.groupCategoryItems.length,
      groupItems: _store.groupItems.length,
      categoryItems: _store.categoryItems.length
    });
  }

  storeExcel(value) {
    console.log("Storing vocab items:", value.length);
    _store.vocabsItems = value;
    this.emit(Constants.CHANGE);
  }

  storeExcelGroup(value) {
    console.log("Storing group category items:", value.length);
    _store.groupCategoryItems = value;
    this.emit(Constants.CHANGE);
    _store.groupItems = this.getGroupItems();
    _store.categoryItems = this.getCategoryItems();
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

  // get image for Category from Vercel Blob using untouched exact filenames
  getCategoryImgSrc(kumpulanKategori) {
    const baseUrl = process.env.REACT_APP_BLOB_BASE_URL || "";
    const exactName = "Category_" + kumpulanKategori.trim();
    return `${baseUrl}/Assets/category/${encodeURIComponent(exactName)}.jpg`;
  }

  getFallbackImage() {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+";
  }

  // get image for vocab from Vercel Blob using untouched exact filenames
  getSignImgSrc(perkataan) {
    if (!perkataan) return this.getFallbackImage();
    const baseUrl = process.env.REACT_APP_BLOB_BASE_URL || "";
    const exactName = perkataan.trim();
    return `${baseUrl}/Assets/vocab/${encodeURIComponent(exactName)}.jpg`;
  }

  // format string to lower case, replace space with dash, remove '?' and '/'
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

  formatGroupCategory(string) {
    if (!string) return '';
    try {
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

  getSortedVocabsItems(language) {
    if (!_store.vocabsItems) return [];
    
    // Transform to the same format as API response
    const transformed = _store.vocabsItems.map(item => ({
      groupCategory: item.category_group?.GroupCategory || `${item.Group}/${item.Category}`,
      word: item.Word || '',
      perkataan: item.Perkataan || '',
      id: item.id,
      attributes: item
    }));
    
    // Sort by the language field
    const sortField = language === 'en' ? 'word' : 'perkataan';
    return transformed.sort((a, b) => a[sortField].localeCompare(b[sortField]));
  }

  addChangeListener(callback) {
    this.on(Constants.CHANGE, callback);
  }

  removeChangeListener(callback) {
    this.removeListener(Constants.CHANGE, callback);
  }
}
export default new Store();
