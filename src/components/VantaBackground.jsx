import { useEffect, useRef } from 'react';

const VantaBackground = () => {
    const vantaRef = useRef(null);
    const vantaEffect = useRef(null);

    useEffect(() => {
        let mounted = true;

        const initVanta = async () => {
            try {
                // Load scripts dynamically using CDN approach for better compatibility
                const loadScript = (src) => {
                    return new Promise((resolve, reject) => {
                        if (document.querySelector(`script[src="${src}"]`)) {
                            resolve();
                            return;
                        }
                        const script = document.createElement('script');
                        script.src = src;
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                };

                // Load Three.js first
                if (!window.THREE) {
                    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js');
                }

                // Wait a bit for Three.js to be available
                await new Promise(resolve => setTimeout(resolve, 100));

                // Load Vanta Waves effect (more stable than trunk)
                if (!window.VANTA) {
                    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/vanta/0.5.24/vanta.fog.min.js');
                }

                // Wait a bit for Vanta to be available
                await new Promise(resolve => setTimeout(resolve, 100));

                if (!mounted || !vantaRef.current) return;

                // Verify everything loaded
                if (!window.THREE || !window.VANTA || !window.VANTA.FOG) {
                    throw new Error('Required libraries not loaded');
                }

                // Initialize Vanta effect
                vantaEffect.current = window.VANTA.FOG({
                    el: vantaRef.current,
                    THREE: window.THREE,
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    minHeight: 200.00,
                    minWidth: 200.00,
                    highlightColor: 0x0a4d3f,
                    midtoneColor: 0x0a4d3f,
                    lowlightColor: 0x565F64,
                    baseColor: 0x0
                });
                // VANTA.CELLS({
                //     el: vantaRef.current,
                //     mouseControls: true,
                //     touchControls: true,
                //     gyroControls: false,
                //     minHeight: 200.00,
                //     minWidth: 200.00,
                //     scale: 1.00,
                //     color1: 0x0a4d3f,
                //     color2: 0x7A7B7D,
                //     size: 0.90
                //   })

                // Handle theme changes
                const updateVantaTheme = () => {
                    const theme = document.documentElement.getAttribute('data-theme');
                    const isLight = theme === 'light' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches);

                    if (vantaEffect.current) {
                        vantaEffect.current.setOptions({
                            color: isLight ? 0x335dff : 0x7aa2ff
                        });
                    }
                };

                // Listen for theme changes
                const observer = new MutationObserver(updateVantaTheme);
                observer.observe(document.documentElement, {
                    attributes: true,
                    attributeFilter: ['data-theme']
                });

                // Listen for system theme changes
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateVantaTheme);

                // Store observer for cleanup
                vantaEffect.current.observer = observer;

            } catch (error) {
                console.error('Failed to initialize Vanta:', error);
                // Fallback background
                if (vantaRef.current) {
                    vantaRef.current.style.background =
                        'radial-gradient(1200px 800px at 80% -10%, rgba(122,162,255,.08), transparent 70%), radial-gradient(1000px 600px at -10% 110%, rgba(255,255,255,.04), transparent 60%), #0b0c10';
                }
            }
        };

        initVanta();

        return () => {
            mounted = false;
            if (vantaEffect.current) {
                if (vantaEffect.current.observer) {
                    vantaEffect.current.observer.disconnect();
                }
                vantaEffect.current.destroy();
            }
        };
    }, []);

    return (
        <div
            ref={vantaRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none'
            }}
        />
    );
};

export default VantaBackground;