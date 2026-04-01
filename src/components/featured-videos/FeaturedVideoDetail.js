import React from "react";
import { Card, CardBody, CardTitle } from "shards-react";

import { Store } from "../../flux";
import ReactPlayer from 'react-player';
import { HashLink } from 'react-router-hash-link';

const FeaturedVideoDetail = ({ video }) => {
    const url = Store.getFeaturedVideoUrl(video.id);

    return (
        <HashLink smooth to={`/featured-videos#${video.id}`}>
            <Card small className="card-post card-post--1">
                <CardBody>
                    <div>
                        <ReactPlayer url={url} playing={false} controls={true} loop={true} width="100%" height="180px"/>
                    </div>                
                    <CardTitle className="card-title-featured-video">
                        {video.title}
                    </CardTitle>
                </CardBody>
            </Card>
        </HashLink>
    );
};

export default FeaturedVideoDetail;