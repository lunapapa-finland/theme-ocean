import "./styles/tailwind.css";
import "./styles/main.css";
import Alpine from "alpinejs";
import * as tocbot from "tocbot";
import dropdown from "./alpine-data/dropdown";
import colorSchemeSwitcher from "./alpine-data/color-scheme-switcher";
import pagination from "./alpine-data/pagination";
import postUtil from "./alpine-data/post-util";
import search from "./alpine-data/search";

window.Alpine = Alpine;

Alpine.data("dropdown", dropdown);
Alpine.data("colorSchemeSwitcher", colorSchemeSwitcher);
// @ts-ignore
Alpine.data("pagination", pagination);
// @ts-ignore
Alpine.data("postUtil", postUtil);
// @ts-ignore
Alpine.data("search", search);

Alpine.start();

const onScroll = () => {
  const headerMenu = document.getElementById("header-menu");
  if (window.scrollY > 0) {
    headerMenu?.classList.add("menu-sticky");
  } else {
    headerMenu?.classList.remove("menu-sticky");
  }
};

window.addEventListener("scroll", onScroll);

export function generateToc() {
  tocbot.init({
    tocSelector: ".toc",
    contentSelector: "#content",
    headingSelector: "h1, h2, h3, h4",
    extraListClasses: "space-y-1 dark:border-zinc-500",
    extraLinkClasses:
      "group flex items-center justify-between rounded py-1 px-1.5 transition-all hover:bg-zinc-100 text-sm opacity-80 dark:hover:bg-zinc-700 dark:text-zinc-50",
    activeLinkClass: "is-active-link bg-zinc-100 dark:bg-zinc-600",
    collapseDepth: 6,
    headingsOffset: 100,
    scrollSmooth: true,
    scrollSmoothOffset: -100,
  });
}

type ColorSchemeType = "system" | "dark" | "light";

export let currentColorScheme: ColorSchemeType = "system";

export function initColorScheme(defaultColorScheme: ColorSchemeType, enableChangeColorScheme: boolean) {
  let colorScheme = defaultColorScheme;

  if (enableChangeColorScheme) {
    colorScheme = (localStorage.getItem("color-scheme") as ColorSchemeType) || defaultColorScheme;
  }

  currentColorScheme = colorScheme;

  setColorScheme(colorScheme, false);
}

export function setColorScheme(colorScheme: ColorSchemeType, store: boolean) {
  if (colorScheme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.add(prefersDark ? "dark" : "light");
    document.documentElement.classList.remove(prefersDark ? "light" : "dark");
  } else {
    document.documentElement.classList.add(colorScheme);
    document.documentElement.classList.remove(colorScheme === "dark" ? "light" : "dark");
  }
  currentColorScheme = colorScheme;
  if (store) {
    localStorage.setItem("color-scheme", colorScheme);
  }
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
  if (currentColorScheme === "system") {
    setColorScheme("system", false);
  }
});

/*移除HTML标签代码*/
export function removeHTMLTag(str: String) {
  str = str.replace(/<.*?>/g, ""); //去除HTML tag
  str = str.replace(/<\/?[^>]*>/g, ""); //去除HTML tag
  str = str.replace(/[ | ]*\n/g, "\n"); //去除行尾空
  str = str.replace(/\n[\s| | ]*\r/g, "\n"); //去除多余空行
  str = str.replace(/ /gi, ""); //去掉
  // str = str.replace(/[a-zA-Z]+/g, ''); //去除字母
  return str;
}

/*阅读时间*/
export function readTime() {
  const contentHtml: HTMLElement | null = document.getElementById("content");
  // @ts-ignore
  let str = contentHtml.innerHTML;
  return (
    "In Total " +
    removeHTMLTag(str).length +
    " Words，estimated reading time: " +
    Math.ceil(removeHTMLTag(str).length / 400) +
    " mins"
  );
}

// 快速返回顶部或底部
const onScrollToTop = () => {
  const backToTop = document.getElementById("back-to-top");
  const backToDown = document.getElementById("back-to-down");
  if (window.scrollY < 100) {
    backToTop?.classList.add("hidden");
    backToDown?.classList.add("hidden");
  } else if (window.scrollY > 300) {
    backToTop?.classList.remove("hidden");
    backToDown?.classList.add("hidden");
  } else {
    backToTop?.classList.add("hidden");
    backToDown?.classList.remove("hidden");
  }
};

window.addEventListener("scroll", onScrollToTop);



// Video resizing
document.addEventListener('DOMContentLoaded', () => {
  const adjustVideoSize = () => {
    // Assert the element as HTMLVideoElement
    const video = document.querySelector('#banner-container video') as HTMLVideoElement;
    if (video) {
      if (window.innerWidth < 768) {
        video.style.height = '50vh';
        video.style.objectFit = 'cover';
      } else {
        video.style.height = '100%';
        video.style.objectFit = 'cover';
      }
    } else {
      console.log('No video element found');
    }
  };

  // Apply adjustments on load and on window resize
  adjustVideoSize();
  window.addEventListener('resize', adjustVideoSize);
});



// Banner Image Looping
document.addEventListener('DOMContentLoaded', () => {
  const bannerContainer = document.getElementById('banner-container');
  if (!bannerContainer) {
      console.error('Banner container not found!');
      return;
  }
  const bannerType = bannerContainer.getAttribute('data-type');
  if (bannerType === 'video') {
    console.log('Video background set. No image cycling needed.');
    return; // Exit if the background is a video
  }

  const images = bannerContainer.getAttribute('data-images')?.split(',').map(img => img.trim()) || [];
  if (images.length <= 1) {
      console.log('Not enough images to cycle.');
      return; // No need to cycle if there are fewer than 2 images
  }

  let currentIndex = 1; // Start from the second image because the first is already set by Thymeleaf
  let autoCycleTimeout: number | undefined; // Declare as number, initialize as undefined

  function updateBackgroundImage() {
      if (bannerContainer) {
          bannerContainer.style.backgroundImage = `url('${images[currentIndex]}')`;
      }
  }

  function cycleImages() {
      currentIndex = (currentIndex + 1) % images.length;
      updateBackgroundImage();
      resetAutoCycle();
  }

  function resetAutoCycle() {
      if (autoCycleTimeout !== undefined) {
          clearTimeout(autoCycleTimeout);
      }
      autoCycleTimeout = window.setTimeout(cycleImages, 5000); // Explicitly use window.setTimeout
  }

  document.getElementById('left-btn')?.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateBackgroundImage();
      resetAutoCycle();
  });

  document.getElementById('right-btn')?.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % images.length;
      updateBackgroundImage();
      resetAutoCycle();
  });

  autoCycleTimeout = window.setTimeout(cycleImages, 5000); // Explicitly use window.setTimeout
});


// WhatsAPP 
document.addEventListener("DOMContentLoaded", () => {
  const whatsappIcon = document.getElementById('whatsappIcon');
  const backToTop = document.getElementById('back-to-top');
  const backToDown = document.getElementById('back-to-down');

  window.onscroll = () => {
      const scrolled = document.body.scrollTop > 50 || document.documentElement.scrollTop > 50;
      
      if (whatsappIcon) {
          whatsappIcon.style.display = scrolled ? "block" : "none";
      }
      if (backToTop) {
          backToTop.style.display = scrolled ? "block" : "none";
      }
      if (backToDown) {
          backToDown.style.display = scrolled ? "block" : "none";
      }
  };
});




// Type Effect for banner title
document.addEventListener("DOMContentLoaded", function() {
  const bannerTitle = document.getElementById("bannerTitle") as HTMLElement | null;
  if (bannerTitle) {
    const customTitle: string = bannerTitle.textContent?.trim() || "";
    bannerTitle.textContent = ""; // Clear the text content initially
    typeEffect(bannerTitle, customTitle);
  }
});

function typeEffect(element: HTMLElement, text: string): void {
  let index: number = 0;
  const typingSpeed: number = 100; // Adjust typing speed as desired

  function type(): void {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      setTimeout(type, typingSpeed);
    }
  }

  type();
}

// fix the position of the scroll, if you wanna enable it, uncomment the following two lines
// import { ScrollManager } from './ScrollManager';
// new ScrollManager();  // Instantiates and sets up event listeners without assigning to a variable

