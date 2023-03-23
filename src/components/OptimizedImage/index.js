import Raect, { useState } from "react";
import "./styles.css";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Blurhash } from "react-blurhash";

const OptimizedImage = ({ data, height }) => {

    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoadStarted, setIsLoadStarted] = useState(false);

    return (
        <div className="Optimized-image">
            <LazyLoadImage 
                src={data.img}
                width={'100%'}
                height={'100%'}
                onLoad={() => setIsLoaded(true)}
                beforeLoad={() => setIsLoadStarted(true)}
            />
            {!isLoaded && isLoadStarted && (
                <div className="Hashed-image">
                    <Blurhash 
                        hash={data.hash}
                        width={'100%'}
                        height={'100%'}
                        resolutionX={32}
                        resolutionY={32}
                        punch={1}
                    />
                </div>
            )}
        </div>
    )
};

export default OptimizedImage;