import { ImgHTMLAttributes } from "react";

type Props = ImgHTMLAttributes<HTMLImageElement>;

const Image = (props: Props) => {
  return (
    <img
      {...props}
      style={{
        width: "calc(100% - 100px)",
        boxShadow: "0px 0px 7px rgba(0,0,0,0.5)",
        margin: "50px",
      }}
    />
  );
};

export default Image;
