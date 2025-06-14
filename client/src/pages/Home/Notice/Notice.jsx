import { useEffect, useState } from "react";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import NoticeView from "./NoticeView";

const Notice = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [notice, setNotice] = useState({ notice: "" });
  const axiosPublic = useAxiosPublic();

  useEffect(() => {
    axiosPublic.get("/notice").then((res) => {
      setNotice(res?.data[0]);
    });
  }, [axiosPublic]);

  return (
    <NoticeView isOpen={isOpen} notice={notice?.notice} setIsOpen={setIsOpen} title="Notice" />
  );
};

export default Notice;
