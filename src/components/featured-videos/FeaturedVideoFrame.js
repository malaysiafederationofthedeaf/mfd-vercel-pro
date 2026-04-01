import React from "react";
import ReactPlayer from 'react-player';

import { Store } from "../../flux"
import PageTitle from "../common/PageTitle";

const FeaturedVideoFrame = ({ video }) => {
    return (
        <section id={video.id}>
            <div className="featured-video-title">
                <div className="featured-video-wrapper">
                    <ReactPlayer 
                        url={Store.getFeaturedVideoUrl(video.id)} 
                        playing={window.location.hash === ("#" + video.id)} 
                        controls={true} 
                        loop={true}
                        width="100%"
                    />
                </div>
                <PageTitle title={video.title} />
            </div>                    
        </section>
    );
};

export default FeaturedVideoFrame;

