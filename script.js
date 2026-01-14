import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    const bannerContainer = document.querySelector(".banner-img-container");
    const bannerIntroTextElements = gsap.utils.toArray(".banner-intro-text");
    const bannerMaskLayers = gsap.utils.toArray(".mask");

    const bannerHeader = document.querySelector(".banner-header h1");
    const splitText = new SplitText(bannerHeader, { type: "words" });
    const words = splitText.words;
    gsap.set(words, { opacity: 0 });

    bannerMaskLayers.forEach((layer, i) => {
        gsap.set(layer, { scale: 0.9 - i * 0.15 });
    });
    gsap.set(bannerContainer, { scale: 0 });

    ScrollTrigger.create({
        trigger: "banner",
        start: "top top",
        end: `+=${window.innerHeight * 4}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
            const progress = self.progress;

            gsap.set(bannerContainer, { scale: progress });

            bannerMaskLayers.forEach((layer, i) => {
                const initialScale = 0.9 - i * 0.15;
                const layerProgress = Math.min(progress / 0.9, 1.0);
                const currentScale = 
                    initialScale + layerProgress * (1.0 - initialScale);
                
                gsap.set(layer, { scale: currentScale });
            });

            if (progress <= 0.9) {
                const textProgress = progress /0.9;
                const moveDistance = window.innerWidth * 0.5;

                gsap.set(bannerIntroTextElements[0], {
                    x: -textProgress * moveDistance,
                });
                gsap.set(bannerIntroTextElements[1], {
                    x: textProgress * moveDistance,
                });
            }

            if (progress >= 0.7 && progress <= 0.9) {
                const headerProgress = (progress - 0.7) / 0.2;
                const totalWords = words.length;
                
                words.forEach((word, i) => {
                    const wordStartDelay = i / totalWords;
                    const wordEndDelay = (i + 1) / totalWords;

                    let wordOpacity = 0;

                    if (headerProgress >= wordEndDelay) {
                        wordOpacity = 1;
                    } else if (headerProgress >= wordStartDelay) {
                        const wordProgress = 
                        (headerProgress - wordStartDelay) / 
                        (wordEndDelay - wordStartDelay);
                        wordOpacity = wordProgress;
                    }

                    gsap.set(word, { opacity: wordOpacity });
                });
            } else if (progress < 0.7) {
                gsap.set(words, { opacity: 0 });
            } else if (progress > 0.9) {
                gsap.set(words, {opacity: 1});
            }
        },
    });
});