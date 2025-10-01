import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

export default function FloatingCard({ children, delay = 0, className = "" }) {
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return undefined;

    let timer;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = window.setTimeout(() => setInView(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className={`bg-slate-800/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 shadow-2xl transition-all duration-700 ease-out hover:shadow-blue-500/10 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${
        hovered
          ? "transform -translate-y-2 scale-[1.02] border-blue-500/30"
          : "transform translate-y-0 scale-100"
      } ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}

FloatingCard.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
  className: PropTypes.string,
};
