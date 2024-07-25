import { useScroll, useTransform, useSpring } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function App() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const { scrollYProgress } = useScroll();

  const images = useMemo(() => {
    const loadedImages: HTMLImageElement[] = [];
    const totalImages = 601;

    for (let i = 1; i <= totalImages; i++) {
      const img = new Image();
      img.src = `/images/frame_${String(i).padStart(6, "0")}.jpg`;
      img.onload = () => {
        loadedImages.push(img);
        if (loadedImages.length === totalImages) {
          setImagesLoaded(true);
        }
      };
    }

    return loadedImages;
  }, []);

  const render = useCallback(
    (index: number) => {
      if (images[index - 1] && ref.current) {
        const context = ref.current.getContext("2d");

        if (context) {
          context.clearRect(0, 0, ref.current.width, ref.current.height);
          context.drawImage(
            images[index - 1],
            0,
            0,
            ref.current.width,
            ref.current.height
          );
        }
      }
    },
    [images]
  );

  // Adjust the range to make the transition cover the entire scroll
  const currentIndex = useTransform(scrollYProgress, [0, 1], [1, 601], {
    clamp: false,
  });

  // Use spring to smooth out the transitions
  const smoothCurrentIndex = useSpring(currentIndex, {
    stiffness: 50,
    damping: 20,
  });

  useEffect(() => {
    if (imagesLoaded) {
      const unsubscribe = smoothCurrentIndex.onChange((latest) => {
        render(Math.round(latest));
      });

      return () => unsubscribe();
    }
  }, [imagesLoaded, smoothCurrentIndex, render]);

  useEffect(() => {
    if (imagesLoaded) {
      render(1);
    }
  }, [imagesLoaded, render]);

  return (
    <div
      style={{
        height: "2000px",
        backgroundColor: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        <canvas
          width={1920}
          height={1080}
          ref={ref}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        />
      </div>
    </div>
  );
}

export default App;
