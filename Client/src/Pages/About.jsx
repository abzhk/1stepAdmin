import React, { useRef, useEffect } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

const About = () => {
  const ref = useRef(null);
  const controls = useAnimation();
  const isInView = useInView(ref, { threshold: 0.25, once: false, margin: "0px" });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [isInView, controls]);

  const imgVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.9, ease: "easeOut" } },
  };

  const textVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.9, delay: 0.15, ease: "easeOut" } },
  };

  return (
    <div
      ref={ref}
      className="flex flex-col md:flex-row w-full h-screen from-gray-50 to-gray-200 overflow-hidden">
      <motion.div
        variants={imgVariants}
        initial="hidden"
        animate={controls}
        className="w-full md:w-1/2 h-full flex justify-center items-center">
        <div className="flex flex-col gap-4 p-4">
          <img
            src="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=900&q=80"
            alt="Teamwork"
            className="rounded-2xl shadow-lg max-w-[90%] max-h-[80%] object-cover"/>
        </div>
      </motion.div>
      <motion.div
        variants={textVariants}
        initial="hidden"
        animate={controls}
        className="w-full md:w-1/2 flex flex-col justify-center p-10 md:p-16 text-left"
      >
        <h1 className="text-5xl font-extrabold text-gray-800 mb-6">
          About <span className="text-blue-600">OneStep</span>
        </h1>
        <p className="text-gray-700 text-lg leading-relaxed mb-6">
          The Association of Professional Community Practitioners (OneStep) is a
          collaborative platform dedicated to empowering professionals through
          innovation, teraphy, and collective growth. We aim to bridge the gap
          between industry experts and emerging professionals by fostering
          communication and sharing valuable knowledge.
        </p>
        <p className="text-gray-700 text-lg leading-relaxed mb-6">
          Our organization believes that continuous learning and professional
          development are the keys to success in today’s ever-evolving world.
          With a strong network of mentors, researchers, and innovators, APCP
          serves as a trusted hub for collaboration and excellence.
        </p>
        <button className="bg-blue-600 text-black px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition duration-300 w-fit">
          Learn More
        </button>
      </motion.div>
    </div>
  );
};

export default About;
