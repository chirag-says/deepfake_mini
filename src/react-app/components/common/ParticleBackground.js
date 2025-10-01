import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
export default function ParticleBackground({ className = "" }) {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return undefined;
        const ctx = canvas.getContext("2d");
        const particles = [];
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        for (let i = 0; i < 50; i += 1) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2,
            });
        }
        let animationFrame;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((particle) => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                if (particle.x < 0 || particle.x > canvas.width)
                    particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height)
                    particle.vy *= -1;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`;
                ctx.fill();
            });
            animationFrame = window.requestAnimationFrame(animate);
        };
        animate();
        return () => {
            window.removeEventListener("resize", resizeCanvas);
            if (animationFrame) {
                window.cancelAnimationFrame(animationFrame);
            }
        };
    }, []);
    return (_jsx("canvas", { ref: canvasRef, className: `fixed inset-0 z-0 pointer-events-none opacity-30 ${className}` }));
}
