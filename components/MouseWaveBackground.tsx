"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface MouseWaveBackgroundProps {
    theme?: 'light' | 'dark'; // Allow forcing a theme
}

export default function MouseWaveBackground({ theme: forcedTheme }: MouseWaveBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme: globalTheme } = useTheme();

    // Determine which theme to use
    const activeTheme = forcedTheme || globalTheme || 'dark';

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        let animationFrameId: number;

        // Configuration
        const config = {
            particleCount: width < 768 ? 50 : 100,
            connectionDistance: 160,
            mouseDistance: 220,
            // Dark Mode: White particles
            // Light Mode: Vibrant Indigo/Blue particles for better visibility
            baseColor: activeTheme === 'dark' ? '255, 255, 255' : '79, 70, 229', // Indigo-600 for light mode
            accentColor: activeTheme === 'dark' ? '14, 165, 233' : '37, 99, 235', // Blue-600
            opacity: activeTheme === 'dark' ? 0.6 : 0.8, // Slightly higher opacity in light mode
            lineOpacity: activeTheme === 'dark' ? 0.25 : 0.4,
        };

        // State
        const mouse = { x: -1000, y: -1000 };
        const particles: Particle[] = [];

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            baseX: number;
            baseY: number;
            density: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.baseX = this.x;
                this.baseY = this.y;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.size = Math.random() * 2.5 + 1.5;
                this.density = (Math.random() * 30) + 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.mouseDistance) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (config.mouseDistance - distance) / config.mouseDistance;
                    const directionX = forceDirectionX * force * this.density * 0.5;
                    const directionY = forceDirectionY * force * this.density * 0.5;

                    this.x -= directionX;
                    this.y -= directionY;
                }

                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fillStyle = `rgba(${config.baseColor}, ${config.opacity})`;
                ctx.fill();
            }
        }

        function init() {
            particles.length = 0;
            config.particleCount = width < 768 ? 60 : 110;
            for (let i = 0; i < config.particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            if (!canvas || !ctx) return;
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.connectionDistance) {
                        ctx.beginPath();
                        const opacity = 1 - (distance / config.connectionDistance);
                        ctx.strokeStyle = `rgba(${config.accentColor}, ${opacity * config.lineOpacity})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            if (mouse.x > 0 && mouse.y > 0) {
                for (let i = 0; i < particles.length; i++) {
                    const dx = mouse.x - particles[i].x;
                    const dy = mouse.y - particles[i].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.mouseDistance) {
                        ctx.beginPath();
                        const opacity = 1 - (distance / config.mouseDistance);
                        ctx.strokeStyle = `rgba(${config.accentColor}, ${opacity * (config.lineOpacity * 2)})`;
                        ctx.lineWidth = 1.5;
                        ctx.moveTo(mouse.x, mouse.y);
                        ctx.lineTo(particles[i].x, particles[i].y);
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            init();
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        }

        canvas.width = width;
        canvas.height = height;
        init();
        animate();

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseLeave);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [activeTheme]); // Re-run if theme changes

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{
                background: 'transparent',
            }}
        />
    );
}
