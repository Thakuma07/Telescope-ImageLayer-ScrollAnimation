document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger, SplitText);

    /* ========================
       LENIS (OPTIMIZED)
    ======================== */
    const lenis = new Lenis({
        lerp: 0.08,
        smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    /* ========================
       ELEMENT CACHE
    ======================== */
    const bannerContainer = document.querySelector(".banner-img-container");
    const bannerIntroTextElements = gsap.utils.toArray(".banner-intro-text");
    const bannerMaskLayers = gsap.utils.toArray(".mask");
    const bannerHeader = document.querySelector(".banner-header h1");

    /* ========================
       SPLIT TEXT (ONCE)
    ======================== */
    const splitText = new SplitText(bannerHeader, { type: "words" });
    const words = splitText.words;

    gsap.set(words, { opacity: 0 });

    /* ========================
       PRE-COMPUTED VALUES
    ======================== */
    const moveDistance = window.innerWidth * 0.5;
    const layerInitialScales = bannerMaskLayers.map(
        (_, i) => 0.9 - i * 0.15
    );

    /* ========================
       GPU HINTS
    ======================== */
    gsap.set(
        [
            bannerContainer,
            bannerIntroTextElements,
            bannerMaskLayers,
            words,
        ],
        {
            willChange: "transform, opacity",
            force3D: true,
        }
    );

    /* ========================
       WORD TIMELINE (KEY OPTIMIZATION)
    ======================== */
    const wordsTl = gsap.timeline({ paused: true });
    wordsTl.to(words, {
        opacity: 1,
        stagger: 0.04,
        ease: "none",
    });

    /* ========================
       INITIAL STATES
    ======================== */
    gsap.set(bannerContainer, { scale: 0 });

    bannerMaskLayers.forEach((layer, i) => {
        gsap.set(layer, { scale: layerInitialScales[i] });
    });

    /* ========================
       SCROLLTRIGGER
    ======================== */
    ScrollTrigger.create({
        trigger: ".banner",
        start: "top top",
        end: `+=${window.innerHeight * 4}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,

        onUpdate: (self) => {
            const progress = self.progress;

            /* IMAGE SCALE */
            gsap.set(bannerContainer, { scale: progress });

            /* MASK LAYERS SCALE */
            const layerProgress = Math.min(progress / 0.9, 1);

            bannerMaskLayers.forEach((layer, i) => {
                gsap.set(layer, {
                    scale:
                        layerInitialScales[i] +
                        layerProgress * (1 - layerInitialScales[i]),
                });
            });

            /* INTRO TEXT MOVE */
            if (progress <= 0.9) {
                const textProgress = progress / 0.9;

                gsap.set(bannerIntroTextElements[0], {
                    x: -textProgress * moveDistance,
                });
                gsap.set(bannerIntroTextElements[1], {
                    x: textProgress * moveDistance,
                });
            }

            /* INTRO TEXT VISIBILITY */
            const textFade = gsap.utils.clamp(
                0,
                1,
                (progress - 0.85) / 0.05
            );

            gsap.set(bannerIntroTextElements, {
                opacity: 1 - textFade,
            });

            /* HEADER WORDS (TIMELINE DRIVEN) */
            const headerProgress = gsap.utils.clamp(
                0,
                1,
                (progress - 0.7) / 0.2
            );
            wordsTl.progress(headerProgress);
        },
    });
});
