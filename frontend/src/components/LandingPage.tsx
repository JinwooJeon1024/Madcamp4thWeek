import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import App from '../App';
import { motion } from "framer-motion";



export const LandingPage = (): JSX.Element => {

    const navigate = useNavigate();
    const [animationComplete, setAnimationComplete] = useState(false);

    const goToMain = () => {
        setAnimationComplete(true);
        setTimeout(() => {
          navigate('App');
        }, 2000); // Adjust the delay based on your animation duration
      };

  return (

      <div className="overlap-group">
        <div className="rectangle" />
        <img className="vector" src={process.env.PUBLIC_URL+"/vector-2.svg"} />
        <img className="element-file" src={process.env.PUBLIC_URL+"/Group1.png"}/>
        <motion.img
            className={`screen-in ${animationComplete ? "animate" : ""}`}
            src={process.env.PUBLIC_URL + "/MainPage.png"}
        />   
        <motion.div
            className="assistant"
            animate={{ scale: [1, 1.2, 1.1] }}
            transition={{ duration: 4, times: [0, 0.5, 1] }}
        >NOTED
        </motion.div>
        <motion.button className="cta" onClick={goToMain} whileHover = {{ scale: 1.1 }} whileTap={{scale: 0.9}} transition={{type: "spring", stiffness: 400, damping: 17}}>
          <div className="try-now">TRY NOW</div>
        </motion.button>
        <p className="text-wrapper">대학생에게 필요한 모든 기능을 담은 노트필기 앱</p>
        <p className="div">
          하나로 충분하도록,
          <br />
          당신의 완벽한 수업시간을 위한 조력자
        </p>
      </div>

  );
};
