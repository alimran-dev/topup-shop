import PropTypes from "prop-types";
import { useState } from "react";

const Image = ({img}) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="w-full mx-auto max-w-[1366px] aspect-video relative">
      {/* <img src={img} alt="" className="block w-fit mx-auto" /> */}
      {!loaded && <div data-theme="light" className="skeleton absolute top-0 left-0 w-full h-full"></div>}
      <img
      src={img}
      srcSet={`${img} 1x, ${img.replace('.png', '@2x.png')} 2x`}
      alt="Order Image"
      loading="lazy"
      onLoad={() => setLoaded(true)}
      className={`w-full h-full object-cover  transition-opacity duration-300 mx-auto shadow-[5px_5px_20px] shadow-slate-600 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};

export default Image;

Image.propTypes = {
  img: PropTypes.string.isRequired,
}