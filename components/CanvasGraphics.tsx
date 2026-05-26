'use client';

import React, { useRef, useEffect, useState } from 'react';

/**
 * Premium Canvas-drawn Interactive Logo
 */
export const CanvasLogo = ({ className = "h-10 w-auto" }: { className?: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Dynamic theme detection
        const getIsDark = () => {
            if (typeof document !== 'undefined') {
                return document.documentElement.classList.contains('dark');
            }
            return true;
        };

        let isDark = getIsDark();

        const observer = new MutationObserver(() => {
            isDark = getIsDark();
        });

        if (typeof document !== 'undefined') {
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class']
            });
        }

        let animationFrameId: number;
        let time = 0;
        let particles: Array<{ x: number; y: number; vx: number; vy: number; alpha: number; size: number; color: string }> = [];

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            time += 0.035;
            
            const w = canvas.width;
            const h = canvas.height;
            const cx = 28; // Center X of logo icon
            const cy = h / 2; // Center Y of logo icon

            // Theme colors based on light / dark mode
            const primaryBlue = isDark ? '#2997ff' : '#0071e3';
            const accentPurple = isDark ? '#a855f7' : '#86198f';
            const textMain = isDark ? '#ffffff' : '#1d1d1f';
            const ringColor = isDark ? 'rgba(41, 151, 255, 0.2)' : 'rgba(0, 113, 227, 0.15)';

            // Emit tech sparkles on hover
            if (isHovered && Math.random() < 0.4) {
                particles.push({
                    x: cx + (Math.random() - 0.5) * 10,
                    y: cy + (Math.random() - 0.5) * 10,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    alpha: 1.0,
                    size: Math.random() * 2 + 1,
                    color: Math.random() < 0.6 ? primaryBlue : accentPurple
                });
            }

            // Update & draw sparkles
            particles.forEach((p, idx) => {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.03;
                if (p.alpha <= 0) {
                    particles.splice(idx, 1);
                    return;
                }
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.shadowBlur = 4;
                ctx.shadowColor = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // 1. Draw Tech Outer Orbital Ring (rotating)
            ctx.save();
            ctx.strokeStyle = ringColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, 16, 0, Math.PI * 2);
            ctx.stroke();

            // Draw spinning orbit notch
            ctx.strokeStyle = primaryBlue;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            const startAngle = time * 1.5;
            ctx.arc(cx, cy, 16, startAngle, startAngle + 0.4 * Math.PI);
            ctx.stroke();
            ctx.restore();

            // 2. Draw Highly Precise, Accurate Apple Silhouette Core Shape
            ctx.save();
            const glow = Math.sin(time * 3.5) * 3.5 + (isHovered ? 14 : 6);
            ctx.shadowBlur = glow;
            ctx.shadowColor = primaryBlue;
            ctx.strokeStyle = isHovered ? (isDark ? '#ffffff' : '#000000') : primaryBlue;
            ctx.lineWidth = 2.4;
            ctx.lineJoin = 'round';
            
            // Mathematical Bezier coordinates for the body of the Apple shape
            ctx.beginPath();
            ctx.moveTo(cx, cy - 5.5);
            ctx.bezierCurveTo(cx - 2.5, cy - 10, cx - 9.5, cy - 8, cx - 9.5, cy - 1.5);
            ctx.bezierCurveTo(cx - 9.5, cy + 4.5, cx - 6, cy + 9, cx - 2.5, cy + 9);
            ctx.bezierCurveTo(cx - 0.8, cy + 9, cx - 1.6, cy + 7.2, cx, cy + 7.2);
            ctx.bezierCurveTo(cx + 1.6, cy + 7.2, cx + 0.8, cy + 9, cx + 2.5, cy + 9);
            ctx.bezierCurveTo(cx + 6, cy + 9, cx + 9.5, cy + 4.5, cx + 9.5, cy - 1);
            // Inward bite arc curve
            ctx.bezierCurveTo(cx + 6.8, cy - 1.8, cx + 6.8, cy - 5.4, cx + 9.5, cy - 6.2);
            ctx.bezierCurveTo(cx + 8.5, cy - 9, cx + 3, cy - 10, cx, cy - 5.5);
            ctx.closePath();
            ctx.stroke();
            
            // Drawing the Leaf at the top
            ctx.beginPath();
            ctx.moveTo(cx + 1, cy - 7.5);
            ctx.bezierCurveTo(cx + 2, cy - 12, cx + 6.5, cy - 13, cx + 6.5, cy - 10);
            ctx.bezierCurveTo(cx + 4.5, cy - 7.5, cx + 2, cy - 6.5, cx + 1, cy - 7.5);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();

            // 3. Central pulsing microchip core inside the Apple silhouette
            ctx.save();
            ctx.fillStyle = isHovered ? accentPurple : primaryBlue;
            ctx.shadowBlur = 9;
            ctx.shadowColor = isHovered ? accentPurple : primaryBlue;
            ctx.beginPath();
            ctx.arc(cx - 0.5, cy + 1, 2.5 + Math.sin(time * 4) * 0.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // [Moving Gradient Scan Sweep Removed for cleaner aesthetic]

            // 4. Draw typography with dynamic theme support
            ctx.save();
            ctx.font = '900 17px Geist, -apple-system, sans-serif';
            ctx.letterSpacing = '-0.5px';
            
            // "iProduct" - Custom dynamic color
            ctx.fillStyle = textMain;
            ctx.fillText('iProduct', 52, cy + 5);
            
            // "Repair" - Radiant Tech Blue
            ctx.fillStyle = primaryBlue;
            ctx.font = '700 17px Geist, -apple-system, sans-serif';
            ctx.fillText('Repair', 130, cy + 5);
            ctx.restore();

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            observer.disconnect();
        };
    }, [isHovered]);

    return (
        <canvas
            ref={canvasRef}
            width={200}
            height={44}
            className={`${className} cursor-pointer`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        />
    );
};

/**
 * Premium Interactive Diagnostics Teardown Hero Graphic
 */
export const CanvasHeroAnimation = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Dynamic theme detection
        const getIsDark = () => {
            if (typeof document !== 'undefined') {
                return document.documentElement.classList.contains('dark');
            }
            return true;
        };

        let isDark = getIsDark();
        const observer = new MutationObserver(() => { isDark = getIsDark(); });
        if (typeof document !== 'undefined') {
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        }

        let animationFrameId: number;
        let time = 0;
        let particles: Array<{x: number, y: number, vx: number, vy: number, size: number, density: number, color: string}> = [];
        let mouse = { x: -1000, y: -1000, radius: 100, active: false };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            // Scale mouse coords if canvas CSS size differs from internal resolution (600x450)
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            mouse.x = (e.clientX - rect.left) * scaleX;
            mouse.y = (e.clientY - rect.top) * scaleY;
            mouse.active = true;
        };

        const handleMouseLeave = () => {
            mouse.active = false;
            mouse.x = -1000;
            mouse.y = -1000;
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        // Offscreen canvas for path sampling
        const offscreen = document.createElement('canvas');
        offscreen.width = 600;
        offscreen.height = 450;
        const offCtx = offscreen.getContext('2d', { willReadFrequently: true });

        if (!offCtx) return;

        const getPointsFromOffscreen = (drawFunc: () => void) => {
            offCtx.clearRect(0, 0, 600, 450);
            drawFunc();
            const imageData = offCtx.getImageData(0, 0, 600, 450).data;
            const points = [];
            for (let y = 0; y < 450; y += 4) {
                for (let x = 0; x < 600; x += 4) {
                    const index = (y * 600 + x) * 4;
                    if (imageData[index + 3] > 128) {
                        points.push({ x, y });
                    }
                }
            }
            return points;
        };

        const applePoints = getPointsFromOffscreen(() => {
            const applePath = new Path2D("M13.6,18.8C13.6,21.8 15.8,22.8 16,22.9C15.8,23.8 15.1,25 14.2,26.3C13.5,27.4 12.7,28.5 11.5,28.5C10.3,28.5 9.8,27.8 8.4,27.8C6.9,27.8 6.3,28.5 5.3,28.5C4.2,28.5 3.3,27.2 2.5,26.1C0.8,23.6 -0.5,19.3 0.2,16.4C0.6,14.9 1.7,13.7 3.1,13.7C4.3,13.7 5.3,14.5 6.1,14.5C6.9,14.5 8.1,13.6 9.5,13.6C10.1,13.6 11.8,13.7 12.9,14.7C12.8,14.8 10.6,16 10.6,18.6C10.6,21.4 13.1,22.4 13.1,22.4L13.6,18.8ZM9.1,11.3C9.8,10.5 10.3,9.4 10.1,8.3C9.2,8.4 8,8.9 7.3,9.7C6.7,10.4 6.2,11.5 6.4,12.6C7.4,12.7 8.5,12.1 9.1,11.3Z");
            offCtx.fillStyle = 'white';
            offCtx.save();
            const scale = 8;
            offCtx.translate(300 - (16*scale)/2, 225 - (28*scale)/2);
            offCtx.scale(scale, scale);
            offCtx.fill(applePath);
            offCtx.restore();
        });

        const macPoints = getPointsFromOffscreen(() => {
            const mbW = 200, mbH = 120;
            const mbX = 300 - mbW/2, mbY = 225 - mbH/2 - 10;
            offCtx.fillStyle = 'white';
            
            // Screen outer
            offCtx.beginPath();
            offCtx.roundRect(mbX, mbY, mbW, mbH, 8); 
            offCtx.fill();
            
            // Screen inner (hollow out)
            offCtx.clearRect(mbX + 8, mbY + 8, mbW - 16, mbH - 16); 
            
            // Base
            offCtx.beginPath();
            offCtx.moveTo(mbX - 25, mbY + mbH + 4);
            offCtx.lineTo(mbX + mbW + 25, mbY + mbH + 4);
            offCtx.lineTo(mbX + mbW + 15, mbY + mbH + 16);
            offCtx.lineTo(mbX - 15, mbY + mbH + 16);
            offCtx.fill(); 
        });

        // Ensure both arrays have the same length
        const maxLen = Math.max(applePoints.length, macPoints.length);
        while(applePoints.length < maxLen) applePoints.push(applePoints[Math.floor(Math.random() * applePoints.length)]);
        while(macPoints.length < maxLen) macPoints.push(macPoints[Math.floor(Math.random() * macPoints.length)]);
        
        // Shuffle to make the transition look beautiful and chaotic
        applePoints.sort(() => Math.random() - 0.5);
        macPoints.sort(() => Math.random() - 0.5);

        // Initialize particles
        for (let i = 0; i < maxLen; i++) {
            particles.push({
                x: Math.random() * 600,
                y: Math.random() * 450,
                vx: 0,
                vy: 0,
                size: Math.random() * 1.5 + 0.8,
                density: (Math.random() * 30) + 10,
                color: Math.random() > 0.5 ? '#2997ff' : '#a855f7' // Blue and Purple glowing mix
            });
        }

        const render = () => {
            time += 0.016; 
            
            // Create trails by drawing a semi-transparent rectangle over the canvas
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = isDark ? 'rgba(10, 10, 12, 0.25)' : 'rgba(250, 250, 250, 0.25)';
            ctx.fillRect(0, 0, 600, 450);

            // Draw glowing particles
            ctx.globalCompositeOperation = isDark ? 'lighter' : 'source-over';

            // Switch shapes every 6 seconds
            const currentPoints = (Math.floor(time / 6) % 2 === 0) ? applePoints : macPoints;

            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];
                let target = currentPoints[i];

                let dx = mouse.x - p.x;
                let dy = mouse.y - p.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                // Repulsion force from mouse
                if (distance < mouse.radius && mouse.active) {
                    let force = (mouse.radius - distance) / mouse.radius;
                    p.vx -= (dx / distance) * force * p.density * 0.15;
                    p.vy -= (dy / distance) * force * p.density * 0.15;
                }
                
                // Spring force towards target
                p.vx += (target.x - p.x) * 0.04; 
                p.vy += (target.y - p.y) * 0.04;
                
                // Friction
                p.vx *= 0.85; 
                p.vy *= 0.85;
                
                p.x += p.vx;
                p.y += p.vy;

                // Draw
                ctx.fillStyle = isDark ? p.color : (p.color === '#2997ff' ? '#0066cc' : '#9333ea');
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            observer.disconnect();
            if (canvas) {
                canvas.removeEventListener('mousemove', handleMouseMove);
                canvas.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, []);

    return (
        <div ref={containerRef} className="relative w-[300px] h-[225px] sm:w-[600px] sm:h-[450px] bg-slate-50/70 dark:bg-slate-950/80 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl p-0 overflow-hidden flex items-center justify-center backdrop-blur-md transition-colors duration-300">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none rounded-[2.5rem]" />
            <canvas
                ref={canvasRef}
                width={600}
                height={450}
                className="w-full h-full block cursor-crosshair"
            />
        </div>
    );
};

/**
 * Premium Interactive Technician / Fast Delivery Animation
 */
export const CanvasRiderIllustration = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        const render = () => {
            time += 0.025;
            ctx.clearRect(0, 0, 240, 240);

            const cx = 120;
            const cy = 120;

            // 1. Draw glowing background warp tunnel rings (Fast Doorstep speed effect)
            ctx.save();
            for (let i = 0; i < 3; i++) {
                const scale = ((time * 0.8 + i) % 3) / 3;
                ctx.strokeStyle = `rgba(41, 151, 255, ${0.4 * (1 - scale)})`;
                ctx.lineWidth = 1 + scale * 2;
                ctx.beginPath();
                ctx.ellipse(cx - (1 - scale) * 40, cy, 30 + scale * 60, 20 + scale * 40, -0.2, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();

            // 2. Draw professional 3D-like diagnostic shield
            ctx.save();
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#2997ff';
            ctx.strokeStyle = '#2997ff';
            ctx.fillStyle = 'rgba(11, 11, 12, 0.9)';
            ctx.lineWidth = 3.5;

            ctx.beginPath();
            // Elegant shield coordinates
            ctx.moveTo(cx, cy - 45);
            ctx.quadraticCurveTo(cx + 35, cy - 45, cx + 40, cy - 10);
            ctx.quadraticCurveTo(cx + 38, cy + 30, cx, cy + 55);
            ctx.quadraticCurveTo(cx - 38, cy + 30, cx - 40, cy - 10);
            ctx.quadraticCurveTo(cx - 35, cy - 45, cx, cy - 45);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            // Inner glowing checkmark/tools drawn inside the shield
            ctx.save();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            // Draw clean checkmark
            ctx.moveTo(cx - 15, cy + 2);
            ctx.lineTo(cx - 3, cy + 14);
            ctx.lineTo(cx + 18, cy - 12);
            ctx.stroke();
            ctx.restore();

            // 3. Draw fast-moving repair sparkles orbiting the shield
            ctx.save();
            for (let i = 0; i < 5; i++) {
                const angle = time * 1.5 + (i * Math.PI * 2) / 5;
                const rx = 65 + Math.sin(time + i) * 5;
                const ry = 40 + Math.cos(time + i) * 3;
                const px = cx + Math.cos(angle) * rx;
                const py = cy + Math.sin(angle) * ry;

                ctx.shadowBlur = 8;
                ctx.shadowColor = '#a855f7';
                ctx.fillStyle = i % 2 === 0 ? '#2997ff' : '#a855f7';
                ctx.beginPath();
                ctx.arc(px, py, 3.5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={240}
            height={240}
            className="mx-auto block"
        />
    );
};
