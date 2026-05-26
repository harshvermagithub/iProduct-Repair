'use client'

import React, { useEffect, useRef } from 'react';

export const MacbookBootAnimation = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let startTime: number;

        // Accurate Apple Logo Path
        const applePath = new Path2D("M13.6,18.8C13.6,21.8 15.8,22.8 16,22.9C15.8,23.8 15.1,25 14.2,26.3C13.5,27.4 12.7,28.5 11.5,28.5C10.3,28.5 9.8,27.8 8.4,27.8C6.9,27.8 6.3,28.5 5.3,28.5C4.2,28.5 3.3,27.2 2.5,26.1C0.8,23.6 -0.5,19.3 0.2,16.4C0.6,14.9 1.7,13.7 3.1,13.7C4.3,13.7 5.3,14.5 6.1,14.5C6.9,14.5 8.1,13.6 9.5,13.6C10.1,13.6 11.8,13.7 12.9,14.7C12.8,14.8 10.6,16 10.6,18.6C10.6,21.4 13.1,22.4 13.1,22.4L13.6,18.8ZM9.1,11.3C9.8,10.5 10.3,9.4 10.1,8.3C9.2,8.4 8,8.9 7.3,9.7C6.7,10.4 6.2,11.5 6.4,12.6C7.4,12.7 8.5,12.1 9.1,11.3Z");

        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Easing function
        const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        const render = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = (timestamp - startTime) / 1000; // in seconds
            
            const rect = container.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;
            
            ctx.clearRect(0, 0, w, h);

            const isDark = document.documentElement.classList.contains('dark');
            const wireColor = isDark ? 'rgba(56, 189, 248, 0.4)' : 'rgba(2, 132, 199, 0.4)';
            const wireGlow = isDark ? 'rgba(56, 189, 248, 0.8)' : 'rgba(2, 132, 199, 0.8)';
            const chassisColor = isDark ? '#1e293b' : '#cbd5e1';
            const screenColor = '#000000';
            
            // Define cycle duration
            const cycleDuration = 12; // 12 seconds
            const t = elapsed % cycleDuration;
            
            ctx.save();
            ctx.translate(w/2, h/2);
            
            const mbWidth = Math.min(w * 0.8, 400);
            const mbHeight = mbWidth * 0.65;
            const mbRadius = mbWidth * 0.05;
            
            // Helper to draw wireframe
            const drawWireframe = (alpha: number) => {
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = wireColor;
                ctx.lineWidth = 1;
                
                // Draw grid lines
                ctx.beginPath();
                for (let i = -mbWidth/2 + 20; i <= mbWidth/2 - 20; i += 20) {
                    ctx.moveTo(i, -mbHeight/2 + 20);
                    ctx.lineTo(i, mbHeight/2 - 20);
                }
                for (let j = -mbHeight/2 + 20; j <= mbHeight/2 - 20; j += 20) {
                    ctx.moveTo(-mbWidth/2 + 20, j);
                    ctx.lineTo(mbWidth/2 - 20, j);
                }
                ctx.stroke();

                // Draw central M-series chip
                ctx.shadowBlur = 15;
                ctx.shadowColor = wireGlow;
                ctx.fillStyle = `rgba(56, 189, 248, 0.1)`;
                ctx.fillRect(-30, -30, 60, 60);
                ctx.strokeStyle = wireGlow;
                ctx.lineWidth = 2;
                ctx.strokeRect(-30, -30, 60, 60);
                
                ctx.restore();
            };

            // Helper to draw solid chassis
            const drawChassis = (alpha: number) => {
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = chassisColor;
                ctx.shadowBlur = 20;
                ctx.shadowColor = 'rgba(0,0,0,0.3)';
                
                // Base
                ctx.beginPath();
                ctx.roundRect(-mbWidth/2, -mbHeight/2, mbWidth, mbHeight, mbRadius);
                ctx.fill();
                
                // Screen bezel
                ctx.fillStyle = '#0f172a'; // dark bezel
                ctx.beginPath();
                ctx.roundRect(-mbWidth/2 + 6, -mbHeight/2 + 6, mbWidth - 12, mbHeight - 12, 10);
                ctx.fill();
                
                // Screen off
                ctx.fillStyle = screenColor;
                ctx.beginPath();
                ctx.roundRect(-mbWidth/2 + 8, -mbHeight/2 + 8, mbWidth - 16, mbHeight - 16, 8);
                ctx.fill();
                
                ctx.restore();
            };

            // Main Animation Logic
            if (t < 3) {
                // Phase 1: Pure wireframe
                const fade = Math.min(t / 0.5, 1);
                drawWireframe(fade);
                
                // Data dots moving
                const dotProgress = (t * 2) % 1;
                ctx.fillStyle = wireGlow;
                ctx.beginPath();
                ctx.arc(-mbWidth/4 + (mbWidth/2)*dotProgress, 0, 3, 0, Math.PI*2);
                ctx.fill();
            } 
            else if (t >= 3 && t < 5) {
                // Phase 2: Morphing
                const progress = easeInOutCubic((t - 3) / 2);
                drawWireframe(1 - progress);
                
                // Chassis scales up or fades in
                ctx.save();
                const scale = 0.95 + 0.05 * progress;
                ctx.scale(scale, scale);
                drawChassis(progress);
                ctx.restore();
            }
            else if (t >= 5 && t < 11) {
                // Phase 3 & 4: Solid
                drawChassis(1);
                
                // Booting Sequence
                const bootT = t - 5;
                if (bootT < 3) {
                    // Booting logo & bar
                    const bootAlpha = Math.min(bootT / 0.5, 1) - Math.max((bootT - 2.5) / 0.5, 0);
                    ctx.save();
                    ctx.globalAlpha = Math.max(0, bootAlpha);
                    
                    // Apple Logo
                    ctx.save();
                    ctx.translate(-15, -20); // Center Apple Logo
                    ctx.scale(2, 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#ffffff';
                    ctx.fill(applePath);
                    ctx.restore();
                    
                    // Progress Bar
                    ctx.fillStyle = '#334155';
                    ctx.beginPath();
                    ctx.roundRect(-40, 50, 80, 4, 2);
                    ctx.fill();
                    
                    const barProgress = easeInOutCubic(Math.min(bootT / 2.5, 1));
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowBlur = 0;
                    ctx.beginPath();
                    ctx.roundRect(-40, 50, 80 * barProgress, 4, 2);
                    ctx.fill();
                    ctx.restore();
                } 
                else {
                    // Desktop UI
                    const deskT = bootT - 3;
                    const deskAlpha = Math.min(deskT / 0.5, 1);
                    ctx.save();
                    ctx.globalAlpha = Math.max(0, deskAlpha);
                    
                    // Screen Background (Monterey Style Gradient)
                    const screenGrad = ctx.createLinearGradient(-mbWidth/2, -mbHeight/2, mbWidth/2, mbHeight/2);
                    screenGrad.addColorStop(0, '#c084fc');
                    screenGrad.addColorStop(0.5, '#3b82f6');
                    screenGrad.addColorStop(1, '#0ea5e9');
                    ctx.fillStyle = screenGrad;
                    ctx.beginPath();
                    ctx.roundRect(-mbWidth/2 + 8, -mbHeight/2 + 8, mbWidth - 16, mbHeight - 16, 8);
                    ctx.fill();

                    // Dock
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                    ctx.beginPath();
                    ctx.roundRect(-60, mbHeight/2 - 25, 120, 12, 6);
                    ctx.fill();

                    // Apps
                    const colors = ['#ef4444', '#eab308', '#22c55e', '#3b82f6'];
                    for (let i=0; i<4; i++) {
                        ctx.fillStyle = colors[i];
                        ctx.beginPath();
                        ctx.arc(-42 + i*28, mbHeight/2 - 19, 4, 0, Math.PI*2);
                        ctx.fill();
                    }
                    ctx.restore();
                }
            } 
            else if (t >= 11) {
                // Phase 5: Fade out
                const fadeProgress = Math.min((t - 11) / 1, 1);
                ctx.globalAlpha = Math.max(0, 1 - fadeProgress);
                drawChassis(1);
            }
            
            ctx.restore();
            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm">
            <canvas
                ref={canvasRef}
                className="w-full h-full block"
                style={{ width: '100%', height: '100%' }}
            />
            
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 pointer-events-none z-[-1] flex items-center justify-center">
                <div className="w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -translate-x-12" />
                <div className="w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] translate-x-12" />
            </div>
        </div>
    );
};

export default MacbookBootAnimation;
