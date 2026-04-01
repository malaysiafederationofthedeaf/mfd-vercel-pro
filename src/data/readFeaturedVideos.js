import axios from "axios";

import { Store } from "../flux";

const fetchData = async (url) => {
  let videoItems = [];
  await axios.get(url)
    .then((response) => {        
      response.data.items.map((item) => 
        // item.snippet.resourceId.videoId
        videoItems.push({
          "id": item.snippet.resourceId.videoId,
          "title": item.snippet.title,
        })
      )        
    })
    .catch((err) => console.log(err));
  return videoItems;
};

const readFeaturedVideos = async () => {
  const file = await fetchData(Store.getFeaturedVideosPlaylistUrl());
  const promise = new Promise((resolve) => {    
    resolve(file);
  });
  return promise;
};

export default readFeaturedVideos();